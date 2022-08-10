FROM golang:1.18-alpine
WORKDIR /app
COPY . /app
RUN go mod download \
  && go build -o /echo-bridge \
  && cp config.yml /
EXPOSE 4000
CMD ["/echo-bridge"]
