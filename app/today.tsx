import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function TodayScreen() {
  const [answer, setAnswer] = useState("");
  const [todaysEntry, setTodaysEntry] = useState(null);
  const [question] = useState("Was there something positive today?");
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format for use as a key
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Check for today's entry whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkTodaysEntry();
      return () => {};
    }, [])
  );

  const checkTodaysEntry = async () => {
    setIsLoading(true);
    try {
      const todayKey = getTodayString();
      const result = await AsyncStorage.getItem(`@journal_${todayKey}`);
      if (result !== null) {
        setTodaysEntry(JSON.parse(result));
      } else {
        setTodaysEntry(null);
      }
    } catch (error) {
      console.error("Error checking today's entry:", error);
    }
    setIsLoading(false);
  };

  // Save today's journal entry
  const saveAnswer = async () => {
    if (answer.trim() === "") {
      Alert.alert("Error", "Please enter an answer");
      return;
    }

    const todayKey = getTodayString();
    const timestamp = new Date().toISOString();

    const entryData = {
      date: timestamp,
      answer: answer.trim()
    };

    try {
      // Save today's entry
      await AsyncStorage.setItem(`@journal_${todayKey}`, JSON.stringify(entryData));

      // Also update the master list of days with entries
      const daysWithEntries = await getDaysWithEntries();
      if (!daysWithEntries.includes(todayKey)) {
        daysWithEntries.push(todayKey);
        await AsyncStorage.setItem('@journal_days', JSON.stringify(daysWithEntries));
      }

      setTodaysEntry(entryData);
      setAnswer("");
      Alert.alert("Success", "Your journal entry for today has been saved!");
    } catch (error) {
      Alert.alert("Error", "Failed to save your entry");
      console.error("Error saving entry:", error);
    }
  };

  // Get list of days that have entries
  const getDaysWithEntries = async () => {
    try {
      const days = await AsyncStorage.getItem('@journal_days');
      return days ? JSON.parse(days) : [];
    } catch (error) {
      console.error("Error getting days with entries:", error);
      return [];
    }
  };

  // Allow user to edit today's entry
  const editEntry = () => {
    if (todaysEntry) {
      setAnswer(todaysEntry.answer);
      setTodaysEntry(null);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a86e8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Daily Reflection</Text>

      {todaysEntry ? (
        <View style={styles.todaysEntryContainer}>
          <Text style={styles.subHeaderText}>Today's Entry:</Text>
          <View style={styles.entryBox}>
            <Text style={styles.entryText}>{todaysEntry.answer}</Text>
            <Text style={styles.timeText}>
              {new Date(todaysEntry.date).toLocaleTimeString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={editEntry}>
            <Text style={styles.editButtonText}>Edit Today's Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.questionText}>{question}</Text>
          <TextInput
            placeholder="Your reflection for today..."
            value={answer}
            onChangeText={setAnswer}
            multiline={true}
            numberOfLines={4}
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveAnswer}>
            <Text style={styles.saveButtonText}>Save Today's Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {todaysEntry
            ? "You've completed your journal entry for today!"
            : "Take a moment to reflect on your day."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333'
  },
  subHeaderText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#444'
  },
  todaysEntryContainer: {
    width: '100%',
    marginBottom: 30
  },
  entryBox: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  entryText: {
    fontSize: 16,
    lineHeight: 24
  },
  timeText: {
    marginTop: 15,
    color: 'gray',
    fontSize: 12
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20
  },
  questionText: {
    fontSize: 20,
    marginBottom: 15,
    color: '#444'
  },
  textInput: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#4a86e8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  editButtonText: {
    color: '#555',
    fontSize: 16
  },
  footerContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666'
  }
});
