package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	echo "git.vh7.uk/jakew/echo-go"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/samber/lo"
	"gopkg.in/yaml.v3"
)

type Config struct {
	AllowedServers []string `yaml:"allowedServers"`
}

type websocketHandler struct {
	config Config
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *websocketHandler) receiver(conn *websocket.Conn, client *echo.Client) {
	defer conn.Close()

	for {
		msgs, err := client.Receive()
		if err != nil {
			log.Error().Err(err).Msg("failed to receive from server")
			return
		}

		for _, msg := range msgs {
			log.Info().Interface("msg", msg).Msg("received message")
			bytes, err := json.Marshal(&msg)
			if err != nil {
				log.Error().Err(err).Msg("failed to marshal message")
			}
			conn.WriteMessage(websocket.TextMessage, bytes)
		}
	}
}

func (h *websocketHandler) socketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Warn().Err(err).Msg("failed to upgrade connection")
		return
	}
	defer conn.Close()

	log.Info().Str("address", conn.RemoteAddr().String()).Msg("websocket connection opened")

	server := r.URL.Query().Get("server")
	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")

	if !lo.Contains(h.config.AllowedServers, server) {
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Server not allowed\"}"))
		return
	}

	log.Info().Str("dest", server).Str("user", username).Msg("creating echo client")
	client, err := echo.New(server, username)
	if err != nil {
		log.Error().Err(err).Msg("failed to create echo client")
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Failed to connect\"}"))
		return
	}
	defer client.Disconnect()

	err = client.HandshakeLoop("4.0.0", password)
	if err != nil {
		log.Error().Err(err).Msg("failed to handshake with server")
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Failed to connect\"}"))
		return
	}

	go h.receiver(conn, client)

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Warn().Err(err).Msg("failed to receive websocket message")
			return
		}

		if messageType == websocket.CloseMessage {
			log.Debug().Msg("websocket closed")
			break
		} else if messageType == websocket.TextMessage {
			var echoMessage echo.RawMessage
			err = json.Unmarshal(message, &echoMessage)
			if err != nil {
				log.Warn().Err(err).Msg("failed to unmarshal message")
				break
			}
			client.Send(echoMessage.MessageType, echoMessage.Data, echoMessage.SubType, []string{})
		} else {
			log.Warn().Int("type", messageType).Bytes("message", message).Msg("message type not implemented")
		}
	}
}

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	log.Debug().Msg("loading config")
	bytes, err := ioutil.ReadFile("config.yml")
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load config file")
	}

	var config Config
	err = yaml.Unmarshal(bytes, &config)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load config file")
	}

	handler := websocketHandler{
		config: config,
	}

	http.HandleFunc("/", handler.socketHandler)

	log.Info().Msg("starting server")
	err = http.ListenAndServe(":4000", nil)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to start server")
	}
}
