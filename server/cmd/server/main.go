package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"

	"photorecord-server/internal/config"
	"photorecord-server/internal/handler"
	"photorecord-server/internal/logger"
)

func main() {
	configPath := flag.String("config", "config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	logger.Init(cfg.Log.Level)

	wsHandler := handler.NewWebSocketHandler()
	router := handler.NewRouter(wsHandler)

	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	logger.Info.Printf("Starting server on %s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		logger.Error.Fatalf("Server failed: %v", err)
	}
}
