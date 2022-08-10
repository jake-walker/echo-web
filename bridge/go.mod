module git.vh7.uk/jakew/echo-web/bridge

go 1.18

require (
	git.vh7.uk/jakew/echo-go v0.0.0-20220809112338-5bd7802455cb
	github.com/gorilla/websocket v1.5.0
	github.com/rs/zerolog v1.27.0
	github.com/samber/lo v1.27.0
	gopkg.in/yaml.v3 v3.0.1
)

require (
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/thoas/go-funk v0.9.2 // indirect
	golang.org/x/exp v0.0.0-20220303212507-bbda1eaf7a17 // indirect
	golang.org/x/sys v0.0.0-20211019181941-9d821ace8654 // indirect
)

replace git.vh7.uk/jakew/echo-go => ../../echo-go
