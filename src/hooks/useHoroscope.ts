import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/utils/apiBase';

export interface HoroscopeData {
  sign: string;
  text: string;
  date: string;
  weekRange?: string;
  monthRange?: string;
}

export function useHoroscope(zodiacSign: string, period: 'today' | 'week' | 'month' = 'today') {
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchHoroscope = async () => {
      if (!zodiacSign) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Маппинг русских названий знаков на английские для API
        const signMapping: Record<string, string> = {
          'Овен': 'aries',
          'Телец': 'taurus', 
          'Близнецы': 'gemini',
          'Рак': 'cancer',
          'Лев': 'leo',
          'Дева': 'virgo',
          'Весы': 'libra',
          'Скорпион': 'scorpio',
          'Стрелец': 'sagittarius',
          'Козерог': 'capricorn',
          'Водолей': 'aquarius',
          'Рыбы': 'pisces'
        };

        const englishSign = signMapping[zodiacSign] || zodiacSign.toLowerCase();
        
        // Определяем URL в зависимости от периода
        let apiUrl = buildApiUrl(`/api/horoscope/${englishSign}`);
        if (period === 'week') {
          apiUrl += '/weekly';
        } else if (period === 'month') {
          apiUrl += '/monthly';
        }
        
        // Добавляем timestamp чтобы избежать кеширования
        const timestamp = new Date().getTime();
        console.log('Fetching horoscope from:', apiUrl);
        const response = await fetch(`${apiUrl}?t=${timestamp}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('Сервер вернул не JSON ответ');
        }
        
        const data = await response.json();

        if (data.ok) {
          setHoroscope(data.horoscope); // API возвращает данные в поле horoscope
        } else {
          setError(data.error || 'Ошибка получения гороскопа');
        }
      } catch (err) {
        console.error('Ошибка при получении гороскопа:', err);
        setError(err instanceof Error ? err.message : 'Ошибка сети');
      } finally {
        setLoading(false);
      }
    };

    fetchHoroscope();
  }, [zodiacSign, period, reloadKey]);

  const refetch = () => setReloadKey((prev) => prev + 1);

  return { horoscope, loading, error, refetch };
}