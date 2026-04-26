import { DetectionResult, AppSettings } from '../types'
import { adaptiveController } from './adaptiveController'

export type WSStatus = 'disconnected' | 'connecting' | 'connected'
type MessageHandler = (result: DetectionResult) => void
type StatusHandler = (status: WSStatus) => void

interface PendingFrame {
  timer: ReturnType<typeof setTimeout>
}

class WebSocketService {
  private ws: WebSocket | null = null
  private frameId = 0
  private messageHandler: MessageHandler | null = null
  private statusHandler: StatusHandler | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private settings: AppSettings | null = null
  private status: WSStatus = 'disconnected'
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private pendingFrames: Map<number, PendingFrame> = new Map()
  private readonly SEND_TIMEOUT_MS = 10000

  connect(settings: AppSettings) {
    this.disconnect()
    this.settings = settings
    this.setStatus('connecting')
    this.pendingFrames.clear()
    adaptiveController.reset()
    adaptiveController.setUserFps(settings.fps)

    const url = `ws://${settings.serverAddress}:${settings.serverPort}/ws/video`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.setStatus('connected')
      this.startPing()
    }

    this.ws.onclose = () => {
      this.setStatus('disconnected')
      this.stopPing()
      this.pendingFrames.clear()
      if (this.settings?.autoReconnect) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      if (this.status === 'connecting') {
        this.setStatus('disconnected')
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const result: DetectionResult = JSON.parse(event.data)

        const pending = this.pendingFrames.get(result.frame_id)
        if (pending) {
          clearTimeout(pending.timer)
          this.pendingFrames.delete(result.frame_id)
        }

        adaptiveController.setQueueDepth(this.pendingFrames.size)
        this.messageHandler?.(result)
      } catch {}
    }
  }

  disconnect() {
    this.stopPing()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.pendingFrames.forEach((p) => clearTimeout(p.timer))
    this.pendingFrames.clear()
    this.ws?.close()
    this.ws = null
    this.setStatus('disconnected')
  }

  sendFrame(base64Data: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return

    const sendStart = Date.now()
    this.frameId++
    const frameId = this.frameId

    const timer = setTimeout(() => {
      this.pendingFrames.delete(frameId)
      adaptiveController.setQueueDepth(this.pendingFrames.size)
    }, this.SEND_TIMEOUT_MS)

    this.pendingFrames.set(frameId, { timer })
    adaptiveController.setQueueDepth(this.pendingFrames.size)

    try {
      this.ws.send(JSON.stringify({
        frame_id: frameId,
        timestamp: Date.now(),
        data: base64Data,
      }))
    } catch {
      this.pendingFrames.delete(frameId)
      adaptiveController.setQueueDepth(this.pendingFrames.size)
      return
    }

    const sendDuration = Date.now() - sendStart
    adaptiveController.recordSendTime(sendDuration)
    adaptiveController.recordFrameSent(frameId)
  }

  onMessage(handler: MessageHandler) {
    this.messageHandler = handler
  }

  onStatusChange(handler: StatusHandler) {
    this.statusHandler = handler
  }

  getStatus(): WSStatus {
    return this.status
  }

  get pendingCount(): number {
    return this.pendingFrames.size
  }

  private setStatus(status: WSStatus) {
    this.status = status
    this.statusHandler?.(status)
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }))
        } catch {}
      }
    }, 30000)
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect() {
    this.reconnectTimer = setTimeout(() => {
      if (this.settings) {
        this.connect(this.settings)
      }
    }, 3000)
  }
}

export const wsService = new WebSocketService()
