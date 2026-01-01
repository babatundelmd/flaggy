import { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RefreshCw, Globe2, Timer as TimerIcon, Brain, Github } from 'lucide-react';
import { useFlags } from './hooks/useFlags';
import { generateQuestion } from './logic/game';
import { FlagCard } from './components/FlagCard';
import { OptionButton } from './components/OptionButton';
import { DifficultySelector } from './components/DifficultySelector';
import { RegionSelector } from './components/RegionSelector';
import type { Difficulty, Question, Country } from './types/country';
import { initPostHog, trackGameStart, trackGuess, trackDifficultyChange, trackRegionChange } from './logic/analytics';

// Initialize PostHog
initPostHog();

const TIMER_LIMITS: Record<Difficulty, number> = {
  beginner: 15,
  medium: 10,
  hard: 7,
  genius: 2
};

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [region, setRegion] = useState('all');
  const [subregion, setSubregion] = useState('all');

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_LIMITS[difficulty]);

  // SESSION LOGIC: How many flags have we presented in the current set?
  const [seenCount, setSeenCount] = useState(0);
  const queueRef = useRef<Country[]>([]);
  const lastCorrectCca3Ref = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const { data: countries, isLoading, error, refetch } = useFlags(difficulty, region, subregion);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const currentLimit = TIMER_LIMITS[difficulty];

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(currentLimit);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          stopTimer();
          handleOptionClick(null);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [stopTimer, currentLimit]);

  const refillQueue = useCallback((flags: Country[]) => {
    const shuffled = [...flags].sort(() => Math.random() - 0.5);
    // Safety: ensure the next flag isn't a repeat of the one we JUST saw before reset
    if (lastCorrectCca3Ref.current && shuffled[shuffled.length - 1].cca3 === lastCorrectCca3Ref.current && shuffled.length > 2) {
      const last = shuffled.pop()!;
      shuffled.unshift(last);
    }
    queueRef.current = shuffled;
  }, []);

  const nextQuestion = useCallback(() => {
    if (!countries || countries.length < 3) return;

    // Refill the collection if we finished the previous one
    if (queueRef.current.length === 0) {
      refillQueue(countries);
    }

    const nextFlag = queueRef.current.pop()!;
    const q = generateQuestion(countries, nextFlag);

    lastCorrectCca3Ref.current = nextFlag.cca3;
    setCurrentQuestion(q);
    setSelectedOption(null);
    setIsCorrect(null);

    // UI Update: Progress is (Total Flags - Flags left to show)
    setSeenCount(countries.length - queueRef.current.length);

    startTimer();
  }, [countries, startTimer, refillQueue]);

  useEffect(() => {
    if (countries && countries.length >= 3) {
      queueRef.current = [];
      lastCorrectCca3Ref.current = null;
      setScore(0);
      setTotalQuestions(0);
      setSeenCount(0); // Show 0 initially while loading the first flag
      nextQuestion();
      trackGameStart(difficulty, region, subregion);
    }
    return () => stopTimer();
  }, [countries, nextQuestion, stopTimer, difficulty, region, subregion]);

  const handleOptionClick = (option: Country | null) => {
    if (selectedOption !== null && option !== null) return;
    if (!currentQuestion) return;

    stopTimer();

    if (option === null) {
      setIsCorrect(false);
      setSelectedOption({} as Country);
      trackGuess({
        country: currentQuestion.correctCountry.name.common,
        cca3: currentQuestion.correctCountry.cca3,
        isCorrect: false,
        difficulty,
        region,
        subregion,
        isTimeout: true
      });
    } else {
      setSelectedOption(option);
      const correct = option.cca3 === currentQuestion.correctCountry.cca3;
      setIsCorrect(correct);
      if (correct) {
        setScore((prev) => prev + 1);
      }
      trackGuess({
        country: currentQuestion.correctCountry.name.common,
        cca3: currentQuestion.correctCountry.cca3,
        isCorrect: correct,
        difficulty,
        region,
        subregion,
        isTimeout: false
      });
    }

    setTotalQuestions((prev) => prev + 1);

    // CYCLE RESET FEEDBACK:
    // If the queue is now empty, we've just answered the final flag of the set.
    if (queueRef.current.length === 0) {
      // 1. Maintain the "Total/Total" view (e.g. 50/50) briefly so they see it.
      // 2. Set to 0 after 750ms so they see the count reset to zero.
      setTimeout(() => {
        setSeenCount(0);
      }, 750);
    }

    // Wait exactly 1.5s to show the next flag.
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    trackDifficultyChange(d);
  };

  const handleRegionChange = (r: string) => {
    setRegion(r);
    setSubregion('all');
    trackRegionChange(r, 'all');
  };

  const handleSubregionChange = (s: string) => {
    setSubregion(s);
    trackRegionChange(region, s);
  };

  if (isLoading) {
    return (
      <div className="split-layout" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-gradient)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2>Loading Flags...</h2>
        </div>
      </div>
    );
  }

  if (error || (countries && countries.length < 3)) {
    return (
      <div className="split-layout" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-gradient)' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem', background: 'white', borderRadius: '24px' }}>
          <Globe2 size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
          <h2>Not enough flags found</h2>
          <p className="subtitle">Try changing the filters or level.</p>
          <button onClick={() => refetch()} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="split-layout">
      <div className="left-panel">
        <header>
          <h1>Flag Master</h1>
          <p className="subtitle">Learn all the flags of the world</p>
        </header>

        <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</span>
              <DifficultySelector current={difficulty} onSelect={handleDifficultyChange} />
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region & Subregion</span>
              <RegionSelector
                region={region}
                subregion={subregion}
                onRegionChange={handleRegionChange}
                onSubregionChange={handleSubregionChange}
              />
            </div>
          </div>
        </div>

        <div className="flag-display-section">
          {currentQuestion && (
            <FlagCard
              flagUrl={currentQuestion.correctCountry.flags.svg}
              altText={currentQuestion.correctCountry.flags.alt}
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 'auto', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TimerIcon size={16} />
            <span>Limit: {currentLimit}s</span>
          </div>
          <span>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={16} />
            <span>Seen: {seenCount} / {countries?.length}</span>
          </div>
          <span>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={16} />
            <span>Level: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </div>
          <span>|</span>
          <a
            href="https://github.com/babatundelmd/flaggy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.4rem 0.8rem',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '10px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Github size={16} />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>

      <div className="right-panel">
        <div className="controls-section">
          <div className="timer-bar">
            <div
              className="timer-fill"
              style={{
                width: `${(timeLeft / currentLimit) * 100}%`,
                background: timeLeft < (currentLimit * 0.3) ? 'var(--error)' : 'var(--primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block', textTransform: 'uppercase' }}>Pick the correct country</span>
            {currentQuestion?.options.map((option) => (
              <OptionButton
                key={option.cca3}
                text={option.name.common}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                status={
                  selectedOption?.cca3 === option.cca3
                    ? isCorrect ? 'correct' : 'wrong'
                    : selectedOption !== null && option.cca3 === currentQuestion.correctCountry.cca3
                      ? 'correct'
                      : 'idle'
                }
              />
            ))}
            {selectedOption !== null && isCorrect === false && !selectedOption.cca3 && (
              <p style={{ color: 'var(--error)', textAlign: 'center', fontWeight: '700', marginTop: '0.5rem' }}>Time's Up!</p>
            )}
          </div>

          <div className="stats-grid" style={{ marginTop: '1rem' }}>
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">
                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Global rankings coming soon!
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
