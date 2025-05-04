import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const [isReady, setIsReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsTime, setNotificationsTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings and check permissions when component mounts
  useEffect(() => {
    try {
      loadSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsReady(true); // loading finished
    }
  }, []);

  const loadSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('@notifications');
      const parsedValue = value !== null ? JSON.parse(value) : null; // parse string to boolean
      if (parsedValue) {
        setNotificationsEnabled(parsedValue);
        const dateValue = await AsyncStorage.getItem('@notificationsTime');
        if (dateValue) {
          const date = new Date(dateValue);
          setNotificationsTime(date);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('@notifications', JSON.stringify(notificationsEnabled));
      await AsyncStorage.setItem('@notificationsTime', notificationsTime.toISOString());
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onNotificationsEnabledChange = async (value) => {
    if (value !== notificationsEnabled) {
    setNotificationsEnabled(value);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    const date = new Date(selectedTime)
    setNotificationsTime(date);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  if (!isReady) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Daily Reminders</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={onNotificationsEnabledChange}
              trackColor={{ false: '#767577', true: '#4a86e8' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {notificationsEnabled && (
            <View style={styles.timePickerSection}>
              <Text style={styles.settingLabel}>Reminder Time</Text>
              <TouchableOpacity 
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
              <Text style={styles.timeText}>{formatTime(notificationsTime)}</Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#444',
  },
  timePickerSection: {
    marginTop: 10,
  },
  timeSelector: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4a86e8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
