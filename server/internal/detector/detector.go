package detector

import (
	"image"

	"photorecord-server/internal/handler"
)

type Detector interface {
	Detect(img image.Image) ([]handler.Detection, error)
	Close() error
}

type NoopDetector struct{}

func NewNoopDetector() *NoopDetector {
	return &NoopDetector{}
}

func (d *NoopDetector) Detect(img image.Image) ([]handler.Detection, error) {
	return []handler.Detection{}, nil
}

func (d *NoopDetector) Close() error {
	return nil
}
