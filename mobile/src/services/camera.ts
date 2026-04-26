import RNFS from 'react-native-fs'
import type { CameraPhotoOutput } from 'react-native-vision-camera'
import type { PhotoFile } from 'react-native-vision-camera'
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
  photoOutput: CameraPhotoOutput,
) {
  if (adaptiveController.shouldSkipFrame()) return

  const quality = adaptiveController.quality
  const photoQuality = Math.max(0.1, Math.min(1.0, quality / 100))

  try {
    const result: PhotoFile = await photoOutput.capturePhotoToFile(
      { enableShutterSound: false },
      {},
    )

    const base64 = await RNFS.readFile(result.filePath, 'base64')

    await RNFS.unlink(result.filePath).catch(() => {})

    wsService.sendFrame(base64)
  } catch {}
}

export async function cleanupTempFile(filePath: string) {
  try {
    await RNFS.unlink(filePath)
  } catch {}
}
