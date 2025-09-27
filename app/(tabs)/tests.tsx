import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Lock, CheckCircle } from "lucide-react-native";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useQuizResults } from "@/hooks/useQuizResults";
import { router, useFocusEffect } from "expo-router";
import { QUIZZES } from "@/constants/quiz";

export default function TestsScreen() {
  const { isPremium } = useSubscription();
  const [quizResults, setQuizResults] = useState<Record<string, any>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch results for all quizzes at the top level
  const quizResultsData: Record<string, any> = {};
  Object.keys(QUIZZES).forEach((quizId) => {
    const { result } = useQuizResults(quizId);
    quizResultsData[quizId] = result;
  });

  // Update quizResults when quizResultsData or refreshKey changes
  useEffect(() => {
    setQuizResults(quizResultsData);
  }, [refreshKey, JSON.stringify(quizResultsData)]); // Use JSON.stringify for object comparison

  // Refresh results when the screen is focused
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Тесты</Text>
        </View>

        <Text style={styles.subtitle}>Выберите тест для прохождения</Text>

        <FlatList
          data={Object.values(QUIZZES)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.testRow}
          renderItem={({ item }) => {
            const isLocked = item.isPremium && !isPremium;
            const isPassed = quizResults[item.id] && !isLocked;
            return (
              <TouchableOpacity
                style={[
                  styles.testCard,
                  isLocked && styles.testCardLocked,
                ]}
                onPress={() => router.push(`/quiz/${item.id}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isLocked
                      ? ["#333", "#555"]
                      : ["#4a148c", "#7b1fa2"]
                  }
                  style={styles.testCardGradient}
                >
                  {isLocked && (
                    <Lock size={20} color="#ffd700" style={styles.lockIcon} />
                  )}
                  {isPassed && (
                    <CheckCircle
                      size={20}
                      color="#ffd700"
                      style={isLocked ? styles.passedIconLeft : styles.passedIcon}
                    />
                  )}
                  <BookOpen size={24} color="#fff" style={styles.testIcon} />
                  <Text style={styles.testTitle}>{item.title}</Text>
                  <Text style={styles.testDescription}>{item.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }}
          scrollEnabled={false}
          contentContainerStyle={styles.testsGrid}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    color: "#b8b8d0",
    textAlign: "center",
    marginBottom: 20,
  },
  testsGrid: {
    paddingHorizontal: 20,
  },
  testRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  testCard: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  testCardLocked: {
    opacity: 0.7,
  },
  testCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  lockIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  passedIcon: {
    position: "absolute",
    top: 12,
    right: 12, // Position on the right as requested
  },
  passedIconLeft: {
    position: "absolute",
    top: 12,
    left: 12, // Shift to left when lock icon is present
  },
  testIcon: {
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 11,
    color: "#b8b8d0",
    textAlign: "center",
    lineHeight: 16,
  },
});