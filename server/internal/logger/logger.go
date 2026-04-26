package logger

import (
	"io"
	"log"
	"os"
	"strings"
)

var (
	Info  *log.Logger
	Warn  *log.Logger
	Error *log.Logger
	Debug *log.Logger
)

func Init(level string) {
	flags := log.Ldate | log.Ltime | log.Lshortfile

	Info = log.New(os.Stdout, "[INFO] ", flags)
	Warn = log.New(os.Stdout, "[WARN] ", flags)
	Error = log.New(os.Stderr, "[ERROR] ", flags)

	level = strings.ToLower(level)
	if level == "debug" {
		Debug = log.New(os.Stdout, "[DEBUG] ", flags)
	} else {
		Debug = log.New(io.Discard, "[DEBUG] ", flags)
	}
}
