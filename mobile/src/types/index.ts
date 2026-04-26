export interface Detection {
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
}

export interface DetectionResult {
  frame_id: number
  timestamp: number
  detections: Detection[]
}

export interface AppSettings {
  serverAddress: string
  serverPort: number
  fps: 'auto' | 15 | 20 | 30
  resolution: '480p' | '720p' | '1080p'
  quality: number
  autoReconnect: boolean
}

export interface FrameMessage {
  frame_id: number
  timestamp: number
  data: string
}
