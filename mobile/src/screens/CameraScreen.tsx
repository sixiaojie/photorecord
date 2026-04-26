import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
  type CameraRef,
} from 'react-native-vision-camera'
import { Detection, AppSettings } from '../types'
import { DetectionOverlay } from '../components/DetectionOverlay'
import { ControlBar } from '../components/ControlBar'
import { wsService } from '../services/websocket'
import { captureAndSendFrame, getResolutionConfig } from '../services/camera'
import { adaptiveController } from '../services/adaptiveController'

interface Props {
  settings: AppSettings
  onOpenSettings: () => void
}

export function CameraScreen({ settings, onOpenSettings }: Props) {
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()
  const cameraRef = useRef<CameraRef>(null)
  const photoOutput = usePhotoOutput({
    quality: adaptiveController.quality / 100,
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected')
  const [detections, setDetections] = useState<Detection[]>([])
  const [currentFps, setCurrentFps] = useState(0)
  const streamingRef = useRef(false)
  const frameCountRef = useRef(0)
  const fpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    wsService.onStatusChange(setConnectionStatus)
    wsService.onMessage((result) => {
      setDetections(result.detections)
    })
  }, [])

  useEffect(() => {
    fpsTimerRef.current = setInterval(() => {
      const count = frameCountRef.current
      setCurrentFps(count)
      frameCountRef.current = 0
      adaptiveController.setEffectiveFps(count)
    }, 1000)
    return () => {
      if (fpsTimerRef.current) clearInterval(fpsTimerRef.current)
    }
  }, [])

  const startStreaming = useCallback(() => {
    streamingRef.current = true
    setIsStreaming(true)
    adaptiveController.reset()
    adaptiveController.setUserFps(settings.fps)
    wsService.connect(settings)

    const tick = async () => {
      if (!streamingRef.current) return

      const interval = 1000 / adaptiveController.targetFps
      const nextTick = Date.now() + interval

      await captureAndSendFrame(photoOutput)
      frameCountRef.current++

      const delay = Math.max(0, nextTick - Date.now())
      frameIntervalRef.current = setTimeout(tick, delay)
    }

    tick()
  }, [settings, photoOutput])

  const stopStreaming = useCallback(() => {
    streamingRef.current = false
    setIsStreaming(false)
    if (frameIntervalRef.current) {
      clearTimeout(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
    wsService.disconnect()
    setDetections([])
  }, [])

  const toggleStream = useCallback(() => {
    if (isStreaming) {
      stopStreaming()
    } else {
      startStreaming()
    }
  }, [isStreaming, startStreaming, stopStreaming])

  if (!hasPermission || !device) {
    return <View style={styles.container} />
  }

  const resolution = getResolutionConfig(settings.resolution)

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        outputs={[photoOutput]}
      />

      <DetectionOverlay
        detections={detections}
        width={resolution.width}
        height={resolution.height}
      />

      <ControlBar
        isStreaming={isStreaming}
        connectionStatus={connectionStatus}
        currentFps={currentFps}
        onToggleStream={toggleStream}
        onOpenSettings={onOpenSettings}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
