import { Link } from 'react-router-dom';
import { BookOpen, Lock, Loader, CheckCircle2 } from 'lucide-react';
import { useSubscription } from '@/providers/SubscriptionProvider';
import { useQuizzes } from '@/hooks/useQuizzes';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/utils/apiBase';

export default function Tests() {
  const { isPremium } = useSubscription();
  const { quizzes, loading, error } = useQuizzes();
  const { user } = useAuth();
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPassedQuizzes = async () => {
      if (!user?.id) {
        setPassedQuizIds(new Set());
        return;
      }

      if (Object.keys(quizzes).length === 0) return;

      try {
        const response = await fetch(buildApiUrl(`/api/user/${encodeURIComponent(user.id)}/quiz-results`));
        const data = await response.json();

        if (!response.ok || !data?.ok || !Array.isArray(data.results)) {
          setPassedQuizIds(new Set());
          return;
        }

        const passedIds = data.results
          .map((item: { quizId?: string }) => item.quizId)
          .filter((id: string | undefined): id is string => Boolean(id));

        setPassedQuizIds(new Set(passedIds));
      } catch (e) {
        console.warn('Failed to load passed quizzes:', e);
      }
    };

    loadPassedQuizzes();
  }, [user?.id, quizzes]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Loader size={32} color="var(--accent)" className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', marginBottom: 16 }}>Ошибка загрузки тестов: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const quizzesArray = Object.values(quizzes);

  return (
    <div style={{ paddingBottom: 24 }}>
      <header style={{ padding: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Тесты</h1>
      </header>
      <p style={{ fontSize: 18, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
        Выберите тест для прохождения
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          padding: '0 20px',
        }}
      >
        {quizzesArray.map(quiz => {
          const locked = quiz.isPremium && !isPremium;
          const isPassed = passedQuizIds.has(quiz.id);
          return (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              style={{
                height: 160,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                opacity: locked ? 0.7 : 1,
                textDecoration: 'none',
                color: 'inherit',
                border: isPassed ? '2px solid #ffd700' : '2px solid transparent',
              }}
            >
              <div
                style={{
                  height: '100%',
                  padding: 16,
                  background: locked
                    ? 'linear-gradient(135deg, #333 0%, #555 100%)'
                    : 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {isPassed && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255, 215, 0, 0.15)',
                    }}
                  />
                )}
                {isPassed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      background: 'rgba(255, 215, 0, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={20} color="#ffd700" />
                  </div>
                )}
                {locked && (
                  <Lock
                    size={20}
                    color="#ffd700"
                    style={{ position: 'absolute', top: 12, right: 12 }}
                  />
                )}
                <BookOpen size={24} style={{ marginBottom: 8, zIndex: 1 }} />
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, zIndex: 1 }}>{quiz.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, zIndex: 1 }}>
                  {quiz.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
