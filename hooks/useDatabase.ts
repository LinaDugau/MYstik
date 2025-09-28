import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Предполагаем, что uuid используется для deviceId

const DB_NAME = "mystic.db";
const DEVICE_ID_KEY = "device_id";

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        // Инициализация базы данных
        const database = await SQLite.openDatabaseAsync(DB_NAME);
        setDb(database);

        // Получение или создание deviceId
        let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!storedDeviceId) {
          storedDeviceId = uuidv4();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
        }
        setDeviceId(storedDeviceId);
      } catch (error) {
        console.error("Error initializing database or deviceId:", error);
      }
    }
    initDb();
    return () => {
      if (db) {
        db.closeAsync();
      }
    };
  }, []);

  const logTarotClick = async (spreadId: string) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO tarot_clicks (spread_id, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [spreadId, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging tarot click:", error);
    }
  };

  const logHoroscopeClick = async (type: string) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO horoscope_clicks (type, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [type, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging horoscope click:", error);
    }
  };

  const logTestClick = async (testId: string) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO test_clicks (test_id, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [testId, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging test click:", error);
    }
  };

  const logSubscription = async (amount: number) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO subscriptions (amount, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [amount, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging subscription:", error);
    }
  };

  const logTabClick = async (section: string) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO section_clicks (section, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [section, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging tab click:", error);
    }
  };

  const logAction = async (action: string) => {
    if (!db || !deviceId) return;
    try {
      await db.execAsync(`
        INSERT INTO actions (action, timestamp, device_id)
        VALUES (?, ?, ?)
      `, [action, new Date().toISOString(), deviceId]);
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  return {
    logTarotClick,
    logHoroscopeClick,
    logTestClick,
    logSubscription,
    logTabClick,
    logAction,
    deviceId,
  };
};