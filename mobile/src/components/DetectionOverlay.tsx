import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Detection } from '../types'

interface Props {
  detections: Detection[]
  width: number
  height: number
}

export function DetectionOverlay({ detections, width, height }: Props) {
  if (detections.length === 0) return null

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {detections.map((d, i) => (
        <View
          key={i}
          style={[
            styles.box,
            {
              left: d.x * width,
              top: d.y * height,
              width: d.width * width,
              height: d.height * height,
            },
          ]}
        >
          <View style={styles.labelContainer}>
            <View style={styles.labelBg}>
              <Text style={styles.labelText}>
                {d.label} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 2,
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: -2,
  },
  labelBg: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  labelText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
})
