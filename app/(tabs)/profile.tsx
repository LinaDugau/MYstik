import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Crown, Calendar, LogOut, Bell, Globe, Info, HelpCircle, Phone, Mail, Sparkles } from "lucide-react-native";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useUser } from "@/providers/UserProvider";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { isPremium, setCardBack, cancelSubscription } = useSubscription();
  const { birthDate, clearUserData } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedCardBack, setSelectedCardBack] = useState("purple");

  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти? Все ваши данные будут удалены.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            clearUserData();
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      setSelectedCardBack("purple");
      Alert.alert("Успех", "Подписка успешно отменена");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось отменить подписку. Попробуйте снова.");
      console.error("Cancel subscription error:", error);
    }
  };

  const supportContacts = [
    { name: "Ангелина Дмитриева", phone: "+7 (902) 851-01-87", email: "ychebka337@mail.ru" },
    { name: "Вероника Сараева", phone: "+7 (982) 186-36-10", email: "ychebka337@mail.ru" },
    { name: "Феона Симеонидис", phone: "+7 (951) 978-71-03", email: "ychebka337@mail.ru" },
  ];

  const showAboutApp = () => {
    Alert.alert(
      "О приложении",
      "Приложение создано для хакатона\n\nВерсия: 1.0.0\nЯзык: Русский",
      [{ text: "ОК" }]
    );
  };

  const showSupport = () => {
    const contactsText = supportContacts
      .map(contact => `${contact.name}\nТел: ${contact.phone}\nEmail: ${contact.email}`)
      .join("\n\n");
    
    Alert.alert(
      "Поддержка",
      contactsText,
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Позвонить", 
          onPress: () => Linking.openURL(`tel:${supportContacts[2].phone}`) 
        },
      ]
    );
  };

  const handleCardBackChange = (back: string) => {
    if (!isPremium) {
      Alert.alert(
        "Премиум функция",
        "Выбор рубашки карт доступен только по подписке",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Подписка", onPress: () => router.push("/subscription") },
        ]
      );
      return;
    }
    setSelectedCardBack(back);
    setCardBack(back);
  };

  const cardBacks = [
    { id: "purple", name: "Фиолетовый", colors: ["#4a148c", "#7b1fa2", "#9c27b0"] },
    { id: "gold", name: "Золотистый", colors: ["#ffd700", "#ffed4e"] },
    { id: "black", name: "Черный", colors: ["#1a1a2e", "#333"] },
    { id: "red", name: "Красный", colors: ["#d32f2f", "#f44336"] },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e"]}
          style={styles.headerGradient}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>Мистический странник</Text>
          {birthDate && (
            <View style={styles.birthDateBadge}>
              <Calendar size={14} color="#ffd700" />
              <Text style={styles.birthDateText}>{birthDate}</Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {isPremium ? (
        <View style={styles.premiumCard}>
          <LinearGradient
            colors={["#ffd700", "#ffed4e"]}
            style={styles.premiumGradient}
          >
            <Crown size={24} color="#1a1a2e" />
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Премиум активен</Text>
              <Text style={styles.premiumSubtitle}>Безлимитный доступ</Text>
            </View>
          </LinearGradient>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                "Отмена подписки",
                "Вы уверены, что хотите отменить подписку?",
                [
                  { text: "Нет", style: "cancel" },
                  { text: "Да", onPress: handleCancelSubscription },
                ]
              );
            }}
          >
            <Text style={styles.cancelText}>Отменить подписку</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.subscribeCard}
          onPress={() => router.push("/subscription")}
        >
          <LinearGradient
            colors={["#9c27b0", "#673ab7"]}
            style={styles.subscribeGradient}
          >
            <Crown size={24} color="#fff" />
            <View style={styles.subscribeInfo}>
              <Text style={styles.subscribeTitle}>Получить премиум</Text>
              <Text style={styles.subscribeSubtitle}>990₽ в месяц</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Настройки</Text>

        {isPremium && (
          <View style={styles.menuItemCard}>
            <View style={styles.menuItemLeftCard}>
              <Sparkles size={20} color="#ffd700" />
              <Text style={styles.menuText}>Рубашка карт</Text>
            </View>
            <View style={styles.cardBackOptions}>
              {cardBacks.map((back) => (
                <TouchableOpacity
                  key={back.id}
                  style={[
                    styles.cardBackButton,
                    selectedCardBack === back.id && styles.cardBackButtonSelected,
                  ]}
                  onPress={() => handleCardBackChange(back.id)}
                >
                  <LinearGradient
                    colors={back.colors}
                    style={styles.cardBackPreview}
                  >
                    <Text style={styles.cardBackText}>{back.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Bell size={20} color="#ffd700" />
            <Text style={styles.menuText}>Уведомления</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#333", true: "#ffd700" }}
            thumbColor={notificationsEnabled ? "#fff" : "#666"}
          />
        </View>
        
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Globe size={20} color="#ffd700" />
            <Text style={styles.menuText}>Язык</Text>
          </View>
          <Text style={styles.menuValue}>Русский</Text>
        </View>
        
        <TouchableOpacity style={styles.menuItem} onPress={showAboutApp}>
          <View style={styles.menuItemLeft}>
            <Info size={20} color="#ffd700" />
            <Text style={styles.menuText}>О приложении</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={showSupport}>
          <View style={styles.menuItemLeft}>
            <HelpCircle size={20} color="#ffd700" />
            <Text style={styles.menuText}>Поддержка</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1e",
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 30,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  birthDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  birthDateText: {
    color: "#ffd700",
    fontSize: 12,
  },
  premiumCard: {
    margin: 20,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#4a148c",
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#ff4444",
    fontSize: 14,
  },
  subscribeCard: {
    margin: 20,
  },
  subscribeGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  subscribeInfo: {
    flex: 1,
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  subscribeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  menuContainer: {
    padding: 20,
  },
  menuItemCard: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemLeftCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
  },
  menuArrow: {
    fontSize: 20,
    color: "#666",
  },
  menuValue: {
    fontSize: 14,
    color: "#b8b8d0",
  },
  cardBackOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardBackButton: {
    width: "48%",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardBackButtonSelected: {
    borderColor: "#ffd700",
  },
  cardBackPreview: {
    padding: 12,
    alignItems: "center",
    borderRadius: 5,
  },
  cardBackText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 20,
    padding: 16,
    backgroundColor: "rgba(255,68,68,0.1)",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ff4444",
  },
});