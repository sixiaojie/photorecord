import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface Props {
  isStreaming: boolean
  connectionStatus: ConnectionStatus
  currentFps: number
  onToggleStream: () => void
  onOpenSettings: () => void
}

export function ControlBar({
  isStreaming,
  connectionStatus,
  currentFps,
  onToggleStream,
  onOpenSettings,
}: Props) {
  const statusColor =
    connectionStatus === 'connected'
      ? '#00FF00'
      : connectionStatus === 'connecting'
      ? '#FFC107'
      : '#FF0000'

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'connecting'
      ? 'Connecting...'
      : 'Disconnected'

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.settingsBtn} onPress={onOpenSettings}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusLabel}</Text>
          {connectionStatus === 'connected' && (
            <Text style={styles.fpsText}>{currentFps} FPS</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.recordBtn, isStreaming && styles.recordBtnActive]}
          onPress={onToggleStream}
        >
          <View style={styles.recordInner} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    color: 'white',
    fontSize: 22,
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 13,
    marginRight: 12,
  },
  fpsText: {
    color: '#aaa',
    fontSize: 13,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordBtnActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  recordInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
  },
})
