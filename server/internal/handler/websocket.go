package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"photorecord-server/internal/logger"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type FrameMessage struct {
	FrameID   int   `json:"frame_id"`
	Timestamp int64 `json:"timestamp"`
	Data      string `json:"data"`
}

type DetectionResult struct {
	FrameID     int         `json:"frame_id"`
	Timestamp   int64       `json:"timestamp"`
	Detections []Detection `json:"detections"`
}

type Detection struct {
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	Width      float64 `json:"width"`
	Height     float64 `json:"height"`
	Label      string  `json:"label"`
	Confidence float64 `json:"confidence"`
}

type WebSocketHandler struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]bool
}

func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		clients: make(map[*websocket.Conn]bool),
	}
}

func (h *WebSocketHandler) Handle(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()

	logger.Info.Printf("Client connected (%s)", r.RemoteAddr)

	defer func() {
		h.mu.Lock()
		delete(h.clients, conn)
		h.mu.Unlock()
		conn.Close()
		logger.Info.Printf("Client disconnected (%s)", r.RemoteAddr)
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var frame FrameMessage
		if err := json.Unmarshal(message, &frame); err != nil {
			logger.Debug.Printf("Invalid frame message: %v", err)
			continue
		}

		logger.Debug.Printf("Frame received: id=%d, size=%d bytes", frame.FrameID, len(frame.Data))

		result := DetectionResult{
			FrameID:   frame.FrameID,
			Timestamp: time.Now().UnixMilli(),
			Detections: []Detection{},
		}

		if err := conn.WriteJSON(result); err != nil {
			logger.Error.Printf("Write failed: %v", err)
			break
		}
	}
}

func (h *WebSocketHandler) ClientsCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
