import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh entries whenever this tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadEntries();
      return () => {};
    }, [])
  );

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

  // Load all journal entries
  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const daysWithEntries = await getDaysWithEntries();
      const allEntries = [];

      for (const day of daysWithEntries) {
        const entryJson = await AsyncStorage.getItem(`@journal_${day}`);
        if (entryJson) {
          const entry = JSON.parse(entryJson);
          // Add the date key for easy reference
          entry.dateKey = day;
          allEntries.push(entry);
        }
      }

      // Sort entries by date (newest first)
      allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
    }
    setIsLoading(false);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Render individual journal entry
  const renderEntry = ({ item }) => (
    <View style={styles.entryContainer}>
      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      <View style={styles.entryContent}>
        <Text style={styles.entryText}>{item.answer}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Journal History</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a86e8" />
        </View>
      ) : entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.dateKey}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No journal entries yet.</Text>
          <Text style={styles.emptySubText}>Your daily reflections will appear here once you create them.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    paddingBottom: 20
  },
  entryContainer: {
    marginBottom: 20
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444'
  },
  entryContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  entryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666'
  },
  emptySubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: '80%'
  }
});
