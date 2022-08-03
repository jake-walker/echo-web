package main

import (
	echo "git.vh7.uk/jakew/echo-go"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/samber/lo"
	"gopkg.in/yaml.v3"
	"io/ioutil"
	"net/http"
	"os"
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

	if !lo.Contains[string](h.config.AllowedServers, server) {
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

	err = client.HandshakeLoop(password)
	if err != nil {
		log.Error().Err(err).Msg("failed to handshake with server")
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Failed to connect\"}"))
		return
	}

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Warn().Err(err).Msg("failed to receive websocket message")
			break
		}

		if messageType == websocket.CloseMessage {
			break
		} else if messageType == websocket.TextMessage {
			err = conn.WriteMessage(messageType, message)
			if err != nil {
				log.Warn().Err(err).Msg("failed to send websocket message")
				break
			}
		} else {
			log.Warn().Int("type", messageType).Bytes("message", message).Msg("message type not implemented")
		}
	}

	log.Info().Str("address", conn.RemoteAddr().String()).Msg("websocket connection closed")
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
