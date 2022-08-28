package main

import (
	"encoding/json"
	"net/http"
	"os"

	echo "git.vh7.uk/jakew/echo-go"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

type bridge struct {
	config Config
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (b *bridge) receiver(conn *websocket.Conn, client *echo.Client) {
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

func (b *bridge) socketHandler(w http.ResponseWriter, r *http.Request) {
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

	var address *string

	for _, configServer := range b.config.Servers {
		if configServer.Id == server {
			address = &configServer.Address
		}
	}

	if address == nil {
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Invalid server ID\"}"))
		return
	}

	log.Info().Str("dest", *address).Str("user", username).Msg("creating echo client")
	client, err := echo.New(*address, username)
	if err != nil {
		log.Error().Err(err).Msg("failed to create echo client")
		_ = conn.WriteMessage(websocket.TextMessage, []byte("{\"error\": \"Failed to connect\"}"))
		return
	}
	defer client.Disconnect()

	err = client.HandshakeLoop(EchoClientVersion, password)
	if err != nil {
		log.Error().Err(err).Msg("failed to handshake with server")
		_ = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprint("{\"error\": \"Failed to connect: ", err, "\"}")))
		return
	}

	go b.receiver(conn, client)

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

func (b *bridge) infoHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	bytes, err := json.Marshal(GetBridgeInfo(b.config))
	if err != nil {
		log.Error().Err(err).Msg("failed to marshal config")
		w.WriteHeader(500)
		return
	}

	_, err = w.Write(bytes)
	if err != nil {
		log.Error().Err(err).Msg("failed to write bytes to response")
		w.WriteHeader(500)
		return
	}
}

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	config, err := LoadConfig()
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load config file")
	}

	b := bridge{
		config: config,
	}

	http.HandleFunc("/", b.socketHandler)
	http.HandleFunc("/info", b.infoHandler)

	log.Info().Msg("starting server")
	err = http.ListenAndServe(":4000", nil)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to start server")
	}
}
