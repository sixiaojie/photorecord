package handler

import (
	"encoding/json"
	"net/http"
)

func NewRouter(wsHandler *WebSocketHandler) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/ws/video", wsHandler.Handle)

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	return mux
}
