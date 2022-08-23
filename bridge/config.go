package main

import (
	"github.com/mozillazg/go-slugify"
	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
	"os"
)

const EchoClientVersion = "4.0.0"

type Server struct {
	Id      string `yaml:"id"`
	Name    string `yaml:"name"`
	Address string `yaml:"address"`
}

type Config struct {
	Servers []Server `yaml:"servers"`
}

type BridgeInfoServer struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type BridgeInfo struct {
	Version string             `json:"version"`
	Servers []BridgeInfoServer `json:"servers"`
}

func LoadConfig() (Config, error) {
	log.Debug().Msg("loading config")
	bytes, err := os.ReadFile("config.yml")
	if err != nil {
		return Config{}, err
	}

	var config Config
	err = yaml.Unmarshal(bytes, &config)
	if err != nil {
		return config, err
	}

	for i := 0; i < len(config.Servers); i++ {
		if config.Servers[i].Id == "" {
			config.Servers[i].Id = slugify.Slugify(config.Servers[i].Name)
		}
	}

	return config, err
}

func GetBridgeInfo(config Config) BridgeInfo {
	var servers []BridgeInfoServer

	for _, server := range config.Servers {
		servers = append(servers, BridgeInfoServer{Id: server.Id, Name: server.Name})
	}

	return BridgeInfo{
		Servers: servers,
		Version: "dev",
	}
}
