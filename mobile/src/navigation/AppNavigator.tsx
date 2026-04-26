import React, { useState } from 'react'
import { CameraScreen } from '../screens/CameraScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { AppSettings } from '../types'

const defaultSettings: AppSettings = {
  serverAddress: '192.168.1.100',
  serverPort: 8080,
  fps: 'auto',
  resolution: '720p',
  quality: 80,
  autoReconnect: true,
}

export function AppNavigator() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [showSettings, setShowSettings] = useState(false)

  if (showSettings) {
    return (
      <SettingsScreen
        settings={settings}
        onSave={(s) => {
          setSettings(s)
          setShowSettings(false)
        }}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  return (
    <CameraScreen
      settings={settings}
      onOpenSettings={() => setShowSettings(true)}
    />
  )
}
