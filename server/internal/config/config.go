package config

import (
	"os"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server    ServerConfig    `yaml:"server"`
	Websocket WebsocketConfig `yaml:"websocket"`
	Detector  DetectorConfig  `yaml:"detector"`
	Stream    StreamConfig    `yaml:"stream"`
	Storage   StorageConfig   `yaml:"storage"`
	Log       LogConfig       `yaml:"log"`
}

type ServerConfig struct {
	Host string `yaml:"host"`
	Port int    `yaml:"port"`
}

type WebsocketConfig struct {
	Path          string `yaml:"path"`
	MaxFrameSizeMB int   `yaml:"max_frame_size_mb"`
	ReadTimeout   string `yaml:"read_timeout"`
	WriteTimeout  string `yaml:"write_timeout"`
}

type DetectorConfig struct {
	Enabled             bool    `yaml:"enabled"`
	ModelPath           string  `yaml:"model_path"`
	ConfidenceThreshold float64 `yaml:"confidence_threshold"`
	MaxDetections       int     `yaml:"max_detections"`
}

type StreamConfig struct {
	TargetFPS int `yaml:"target_fps"`
	MaxWidth  int `yaml:"max_width"`
	MaxHeight int `yaml:"max_height"`
}

type StorageConfig struct {
	RecordLocal bool   `yaml:"record_local"`
	OutputDir   string `yaml:"output_dir"`
}

type LogConfig struct {
	Level string `yaml:"level"`
}

func Load(path string) (*Config, error) {
	cfg := &Config{
		Server: ServerConfig{
			Host: "0.0.0.0",
			Port: 8080,
		},
		Websocket: WebsocketConfig{
			Path:           "/ws/video",
			MaxFrameSizeMB: 10,
			ReadTimeout:    "60s",
			WriteTimeout:   "10s",
		},
		Detector: DetectorConfig{
			Enabled:             true,
			ModelPath:           "./models/yolov8n.onnx",
			ConfidenceThreshold: 0.5,
			MaxDetections:       100,
		},
		Stream: StreamConfig{
			TargetFPS: 20,
			MaxWidth:  1280,
			MaxHeight: 720,
		},
		Storage: StorageConfig{
			RecordLocal: false,
			OutputDir:   "./recordings",
		},
		Log: LogConfig{
			Level: "info",
		},
	}

	data, err := os.ReadFile(path)
	if err == nil {
		if err := yaml.Unmarshal(data, cfg); err != nil {
			return nil, err
		}
	}

	overrideFromEnv(cfg)

	return cfg, nil
}

func overrideFromEnv(cfg *Config) {
	if v := os.Getenv("SERVER_HOST"); v != "" {
		cfg.Server.Host = v
	}
	if v := os.Getenv("SERVER_PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			cfg.Server.Port = p
		}
	}
	if v := os.Getenv("WEBSOCKET_PATH"); v != "" {
		cfg.Websocket.Path = v
	}
	if v := os.Getenv("DETECTOR_ENABLED"); v != "" {
		cfg.Detector.Enabled = strings.ToLower(v) == "true"
	}
	if v := os.Getenv("DETECTOR_CONFIDENCE_THRESHOLD"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			cfg.Detector.ConfidenceThreshold = f
		}
	}
	if v := os.Getenv("STREAM_TARGET_FPS"); v != "" {
		if f, err := strconv.Atoi(v); err == nil {
			cfg.Stream.TargetFPS = f
		}
	}
	if v := os.Getenv("LOG_LEVEL"); v != "" {
		cfg.Log.Level = v
	}
}
