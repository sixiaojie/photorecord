package stream

import (
	"bytes"
	"encoding/base64"
	"image"
	"image/jpeg"
	"image/png"
)

func DecodeFrame(data string) (image.Image, error) {
	raw, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return nil, err
	}

	img, err := jpeg.Decode(bytes.NewReader(raw))
	if err != nil {
		img, err = png.Decode(bytes.NewReader(raw))
		if err != nil {
			return nil, err
		}
	}

	return img, nil
}

func Resize(img image.Image, maxWidth, maxHeight int) image.Image {
	bounds := img.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()

	if w <= maxWidth && h <= maxHeight {
		return img
	}

	ratio := float64(maxWidth) / float64(w)
	if float64(h)*ratio > float64(maxHeight) {
		ratio = float64(maxHeight) / float64(h)
	}

	newW := int(float64(w) * ratio)
	newH := int(float64(h) * ratio)

	dst := image.NewRGBA(image.Rect(0, 0, newW, newH))
	for y := 0; y < newH; y++ {
		for x := 0; x < newW; x++ {
			srcX := x * w / newW
			srcY := y * h / newH
			dst.Set(x, y, img.At(srcX, srcY))
		}
	}

	return dst
}

func IsJPEG(data string) bool {
	raw, err := base64.StdEncoding.DecodeString(data)
	if err != nil || len(raw) < 4 {
		return false
	}
	return raw[0] == 0xFF && raw[1] == 0xD8 && raw[2] == 0xFF
}
