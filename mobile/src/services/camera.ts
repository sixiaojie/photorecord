import RNFS from 'react-native-fs'
import type { Camera } from 'react-native-vision-camera'
import { wsService } from './websocket'
import { adaptiveController } from './adaptiveController'

export interface CameraConfig {
  fps: 'auto' | 15 | 20 | 30
  resolution: '480p' | '720p' | '1080p'
  quality: number
}

export function getResolutionConfig(resolution: CameraConfig['resolution']) {
  switch (resolution) {
    case '480p':
      return { width: 640, height: 480 }
    case '720p':
      return { width: 1280, height: 720 }
    case '1080p':
      return { width: 1920, height: 1080 }
  }
}

export function getFpsValue(fps: CameraConfig['fps']): number {
  if (fps === 'auto') return 20
  return fps
}

export async function captureAndSendFrame(
  camera: React.RefObject<Camera | null>,
) {
  if (adaptiveController.shouldSkipFrame()) return

  try {
    const snapshot = await camera.current?.takeSnapshot({
      quality: Math.round(adaptiveController.quality),
    })

    if (!snapshot?.path) return

    const base64 = await RNFS.readFile(snapshot.path, 'base64')
    await RNFS.unlink(snapshot.path).catch(() => {})
    wsService.sendFrame(base64)
  } catch {}
}
