import { getFpsValue } from './camera'

export interface AdaptiveState {
  targetFps: number
  quality: number
  effectiveFps: number
  droppedFrames: number
  avgSendTimeMs: number
  queueDepth: number
  adaptiveMode: boolean
}

type FpsSetting = 'auto' | 15 | 20 | 30

export class AdaptiveFrameController {
  private readonly MIN_FPS = 5
  private readonly MAX_FPS = 30
  private readonly MIN_QUALITY = 30
  private readonly MAX_QUALITY = 95
  private readonly SEND_HISTORY_SIZE = 15
  private readonly MAX_QUEUE_DEPTH = 3
  private readonly QUALITY_STEP = 5
  private readonly FPS_STEP = 2

  private userFps: FpsSetting = 'auto'
  private currentFps = 20
  private currentQuality = 80
  private sendTimesMs: number[] = []
  private consecutiveFastSends = 0
  private consecutiveSlowSends = 0
  private _droppedFrames = 0
  private _effectiveFps = 0
  private _avgSendTimeMs = 0
  private _queueDepth = 0
  private frameCount = 0

  reset() {
    this.sendTimesMs = []
    this.consecutiveFastSends = 0
    this.consecutiveSlowSends = 0
    this._droppedFrames = 0
    this._effectiveFps = 0
    this._avgSendTimeMs = 0
    this._queueDepth = 0
    this.frameCount = 0
    this.currentFps = this.getBaseFps()
    this.currentQuality = 80
  }

  setUserFps(fps: FpsSetting) {
    this.userFps = fps
    this.currentFps = this.getBaseFps()
  }

  getBaseFps(): number {
    return getFpsValue(this.userFps)
  }

  get targetFps(): number {
    return this.currentFps
  }

  get quality(): number {
    return this.currentQuality
  }

  get droppedFrames(): number {
    return this._droppedFrames
  }

  get effectiveFps(): number {
    return this._effectiveFps
  }

  get avgSendTimeMs(): number {
    return this._avgSendTimeMs
  }

  get queueDepth(): number {
    return this._queueDepth
  }

  get adaptiveMode(): boolean {
    return this.userFps === 'auto'
  }

  setQueueDepth(depth: number) {
    this._queueDepth = depth
  }

  shouldSkipFrame(): boolean {
    if (this._queueDepth >= this.MAX_QUEUE_DEPTH) {
      this._droppedFrames++
      return true
    }
    return false
  }

  recordFrameSent(frameCount: number) {
    this.frameCount = frameCount
  }

  recordSendTime(durationMs: number) {
    this.sendTimesMs.push(durationMs)
    if (this.sendTimesMs.length > this.SEND_HISTORY_SIZE) {
      this.sendTimesMs.shift()
    }

    this._avgSendTimeMs =
      this.sendTimesMs.reduce((a, b) => a + b, 0) / this.sendTimesMs.length

    if (!this.adaptiveMode) return

    const slowThreshold = 200
    const fastThreshold = 80

    if (durationMs > slowThreshold) {
      this.consecutiveSlowSends++
      this.consecutiveFastSends = 0
    } else if (durationMs < fastThreshold) {
      this.consecutiveFastSends++
      this.consecutiveSlowSends = 0
    } else {
      this.consecutiveSlowSends = 0
      this.consecutiveFastSends = 0
    }

    if (this.consecutiveSlowSends >= 3) {
      this.degrade()
    } else if (this.consecutiveFastSends >= 5) {
      this.upgrade()
    }
  }

  setEffectiveFps(fps: number) {
    this._effectiveFps = fps
  }

  getState(): AdaptiveState {
    return {
      targetFps: this.currentFps,
      quality: this.currentQuality,
      effectiveFps: this._effectiveFps,
      droppedFrames: this._droppedFrames,
      avgSendTimeMs: this._avgSendTimeMs,
      queueDepth: this._queueDepth,
      adaptiveMode: this.adaptiveMode,
    }
  }

  private degrade() {
    if (this.currentQuality > this.MIN_QUALITY) {
      this.currentQuality = Math.max(this.MIN_QUALITY, this.currentQuality - this.QUALITY_STEP)
      return
    }
    if (this.currentFps > this.MIN_FPS) {
      this.currentFps = Math.max(this.MIN_FPS, this.currentFps - this.FPS_STEP)
    }
  }

  private upgrade() {
    if (this.currentFps < Math.min(this.getBaseFps(), this.MAX_FPS)) {
      this.currentFps = Math.min(this.getBaseFps(), this.MAX_FPS, this.currentFps + this.FPS_STEP)
      return
    }
    if (this.currentQuality < this.MAX_QUALITY) {
      this.currentQuality = Math.min(this.MAX_QUALITY, this.currentQuality + this.QUALITY_STEP)
    }
  }
}

export const adaptiveController = new AdaptiveFrameController()
