import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";

export default function AdminPanel() {
  const { getStats } = useDatabase();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Загрузка статистики...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Crown size={32} color="#ffd700" />
        <Text style={styles.title}>Админ-панель</Text>
      </View>

      {/* Выручка */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Выручка</Text>
        <LinearGradient colors={["#ffd700", "#ffed4e"]} style={styles.statValue}>
          <Text style={styles.statNumber}>{stats.totalRevenue.toFixed(2)} ₽</Text>
        </LinearGradient>
      </View>

      {/* Соотношение пользователей */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Пользователи</Text>
        <View style={styles.ratioContainer}>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>Платные: {stats.premiumCount}</Text>
            <View style={[styles.ratioBar, { width: `${(stats.premiumCount / stats.totalUsers) * 100}%` }]} />
          </View>
          <View style={styles.ratioItem}>
            <Text style={styles.ratioLabel}>Бесплатные: {stats.freeCount}</Text>
            <View style={[styles.ratioBar, { width: `${(stats.freeCount / stats.totalUsers) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Клики по табам */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по разделам</Text>
        {Object.entries(stats.tabClicks).map(([tab, count]) => (
          <View key={tab} style={styles.clickItem}>
            <Text style={styles.clickLabel}>{tab}</Text>
            <Text style={styles.clickCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Клики по тестам */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по тестам</Text>
        {Object.entries(stats.testClicks).map(([test, count]) => (
          <View key={test} style={styles.clickItem}>
            <Text style={styles.clickLabel}>{test}</Text>
            <Text style={styles.clickCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Клики по таро */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по гаданиям (Таро)</Text>
        {Object.entries(stats.tarotClicks).map(([spread, count]) => (
          <View key={spread} style={styles.clickItem}>
            <Text style={styles.clickLabel}>{spread}</Text>
            <Text style={styles.clickCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* Клики по гороскопу */}
      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Клики по эзотерике</Text>
        {Object.entries(stats.horoscopeClicks).map(([section, count]) => (
          <View key={section} style={styles.clickItem}>
            <Text style={styles.clickLabel}>{section}</Text>
            <Text style={styles.clickCount}>{count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  statTitle: {
    fontSize: 18,
    color: '#ffd700',
    marginBottom: 10,
  },
  statValue: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  ratioContainer: {
    gap: 10,
  },
  ratioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratioLabel: {
    color: '#fff',
    flex: 1,
  },
  ratioBar: {
    height: 10,
    backgroundColor: '#ffd700',
    borderRadius: 5,
  },
  clickItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  clickLabel: {
    color: '#b8b8d0',
    flex: 1,
  },
  clickCount: {
    color: '#ffd700',
    fontWeight: '600',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});