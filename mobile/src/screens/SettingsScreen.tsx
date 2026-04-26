import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { AppSettings } from '../types'

interface Props {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
  onBack: () => void
}

export function SettingsScreen({ settings: initial, onSave, onBack }: Props) {
  const [settings, setSettings] = useState<AppSettings>({ ...initial })

  const handleSave = () => {
    onSave(settings)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>Server</Text>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={settings.serverAddress}
          onChangeText={(v) => setSettings({ ...settings, serverAddress: v })}
          placeholder="192.168.1.100"
          placeholderTextColor="#666"
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          value={String(settings.serverPort)}
          onChangeText={(v) =>
            setSettings({ ...settings, serverPort: parseInt(v) || 8080 })
          }
          keyboardType="number-pad"
          placeholder="8080"
          placeholderTextColor="#666"
        />

        <Text style={styles.sectionTitle}>Stream</Text>
        <Text style={styles.label}>Frame Rate</Text>
        <View style={styles.optionsRow}>
          {(['auto', 15, 20, 30] as const).map((fps) => (
            <TouchableOpacity
              key={String(fps)}
              style={[
                styles.option,
                settings.fps === fps && styles.optionActive,
              ]}
              onPress={() => setSettings({ ...settings, fps })}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.fps === fps && styles.optionTextActive,
                ]}
              >
                {fps === 'auto' ? 'Auto' : `${fps}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Resolution</Text>
        <View style={styles.optionsRow}>
          {(['480p', '720p', '1080p'] as const).map((res) => (
            <TouchableOpacity
              key={res}
              style={[
                styles.option,
                settings.resolution === res && styles.optionActive,
              ]}
              onPress={() => setSettings({ ...settings, resolution: res })}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.resolution === res && styles.optionTextActive,
                ]}
              >
                {res}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quality</Text>
        <TextInput
          style={styles.input}
          value={String(settings.quality)}
          onChangeText={(v) =>
            setSettings({ ...settings, quality: Math.min(100, Math.max(10, parseInt(v) || 80)) })
          }
          keyboardType="number-pad"
          placeholder="80"
          placeholderTextColor="#666"
        />

        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Auto Reconnect</Text>
          <Switch
            value={settings.autoReconnect}
            onValueChange={(v) => setSettings({ ...settings, autoReconnect: v })}
            trackColor={{ false: '#555', true: '#4CAF50' }}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 50,
  },
  backBtn: {
    color: '#00FF00',
    fontSize: 16,
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
  },
  label: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  optionActive: {
    borderColor: '#00FF00',
    backgroundColor: '#1a3a1a',
  },
  optionText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#00FF00',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: '#00FF00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 36,
  },
  saveText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
