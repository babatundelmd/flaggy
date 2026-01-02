import { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RefreshCw, Globe2, Timer as TimerIcon, Brain, Github, User as UserIcon, LogOut, Flag, Play, Pause } from 'lucide-react';
import { useFlags } from './hooks/useFlags';
import { generateQuestion } from './logic/game';
import { FlagCard } from './components/FlagCard';
import { OptionButton } from './components/OptionButton';
import { DifficultySelector } from './components/DifficultySelector';
import { RegionSelector } from './components/RegionSelector';
import type { Difficulty, Question, Country } from './types/country';
import { initPostHog, trackGameStart, trackGuess, trackDifficultyChange, trackRegionChange } from './logic/analytics';
import { ResultsModal } from './components/ResultsModal';
import { useAuth } from './contexts/AuthContext';
import { LoginModal } from './components/LoginModal';
import { Leaderboard } from './components/Leaderboard';
import { detectUserCountry, submitScore } from './logic/leaderboard';

const DIFFICULTIES: Difficulty[] = ['beginner', 'medium', 'hard', 'genius'];

initPostHog();

const TIMER_LIMITS: Record<Difficulty, number> = {
  beginner: 15,
  medium: 10,
  hard: 7,
  genius: 2
};

type GameState = 'idle' | 'playing' | 'paused';

function App() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('US');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [region, setRegion] = useState('all');
  const [subregion, setSubregion] = useState('all');

  const [gameState, setGameState] = useState<GameState>('idle');

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<Country | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_LIMITS[difficulty]);
  const [showResults, setShowResults] = useState(false);

  // Speed Tracking
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const questionStartTimeRef = useRef<number | null>(null);

  const [seenCount, setSeenCount] = useState(0);
  const queueRef = useRef<Country[]>([]);
  const lastCorrectCca3Ref = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Ref for local access in callbacks to avoid dependency cycles
  const handleOptionClickRef = useRef<(option: Country | null) => void>(() => { });

  useEffect(() => {
    detectUserCountry().then(setUserCountry);
  }, []);

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
          handleOptionClickRef.current(null);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [stopTimer, currentLimit]);

  const refillQueue = useCallback((flags: Country[]) => {
    const shuffled = [...flags].sort(() => Math.random() - 0.5);
    if (lastCorrectCca3Ref.current && shuffled[shuffled.length - 1].cca3 === lastCorrectCca3Ref.current && shuffled.length > 2) {
      const last = shuffled.pop()!;
      shuffled.unshift(last);
    }
    queueRef.current = shuffled;
  }, []);

  const nextQuestion = useCallback(() => {
    if (!countries || countries.length < 3) return;

    if (queueRef.current.length === 0) {
      refillQueue(countries);
    }

    const nextFlag = queueRef.current.pop()!;
    const q = generateQuestion(countries, nextFlag);

    lastCorrectCca3Ref.current = nextFlag.cca3;
    setCurrentQuestion(q);
    setSelectedOption(null);
    setIsCorrect(null);

    setSeenCount(countries.length - queueRef.current.length);

    questionStartTimeRef.current = Date.now();

    // Only start timer if user is logged in AND game is playing
    if (user && gameState === 'playing') {
      startTimer();
    }
  }, [countries, startTimer, refillQueue, user, gameState]);

  // Reset/Init Game Logic
  useEffect(() => {
    if (countries && countries.length >= 3) {
      queueRef.current = [];
      lastCorrectCca3Ref.current = null;
      setScore(0);
      setTotalQuestions(0);
      setTotalTimeTaken(0);
      setSeenCount(0);

      if (user) {
        setGameState('paused');
        // Do not call nextQuestion here which might start timer? 
        // Actually nextQuestion is needed to init the Question, 
        // but we must ensure startTimer inside nextQuestion respects paused logic.
        nextQuestion();
        trackGameStart(difficulty, region, subregion);
      } else {
        setGameState('idle');
        nextQuestion();
      }
    }
    return () => stopTimer();
  }, [countries, stopTimer, difficulty, region, subregion, user]);

  // Watch for user login to start game if not already playing
  useEffect(() => {
    if (user && gameState === 'idle' && !showResults && countries && countries.length >= 3) {
      // Changed to 'paused' instead of 'playing' to wait for user to click Play
      setGameState('paused');
      if (currentQuestion && !timerRef.current) {
        questionStartTimeRef.current = Date.now();
        // Do NOT startTimer() here. Wait for Play button.
        // startTimer(); 
        trackGameStart(difficulty, region, subregion);
      } else if (!currentQuestion) {
        nextQuestion();
        trackGameStart(difficulty, region, subregion);
      }
    }

    if (!user && gameState === 'playing') {
      stopTimer();
      setGameState('idle');
      setScore(0);
      setTotalQuestions(0);
      setTotalTimeTaken(0);
    }
  }, [user, gameState, showResults, countries, startTimer, nextQuestion, stopTimer, difficulty, region, subregion, currentQuestion]);



  /* New Handler */
  const handlePauseGame = () => {
    stopTimer();
    setGameState('paused');
  };

  const handleResumeGame = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setGameState('playing');
    // Adjust start time to account for pause duration
    const timeElapsed = (currentLimit - timeLeft) * 1000;
    questionStartTimeRef.current = Date.now() - timeElapsed;
    startTimer();
  };

  const handleOptionClick = (option: Country | null) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (gameState !== 'playing') {
      // User must press Play button to resume/start
      return;
    }

    if (selectedOption !== null && option !== null) return;
    if (!currentQuestion) return;

    stopTimer();

    // Calculate time taken
    const now = Date.now();
    let timeTaken = 0;
    if (questionStartTimeRef.current) {
      timeTaken = (now - questionStartTimeRef.current) / 1000;
      if (timeTaken > currentLimit) timeTaken = currentLimit;
    }
    setTotalTimeTaken(prev => prev + timeTaken);

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
    if (queueRef.current.length === 0) {
      setTimeout(() => {
        setSeenCount(0);
      }, 750);
    }

    // Wait exactly 1.5s to show the next flag.
    setTimeout(() => {
      if (queueRef.current.length === 0) {
        setShowResults(true);
        setGameState('idle');
        if (user) {
          const finalScore = (option && option.cca3 === currentQuestion?.correctCountry.cca3) ? score + 1 : score;
          const finalTotal = totalQuestions + 1;
          const finalAccuracy = (finalScore / finalTotal) * 100;
          const finalTime = totalTimeTaken + timeTaken;
          const avgTime = finalTime / finalTotal;

          submitScore(user, finalScore, finalAccuracy, avgTime, difficulty, userCountry).catch(console.error);
        }
      } else {
        nextQuestion();
      }
    }, 1500);
  };

  // Update ref for timer access
  handleOptionClickRef.current = handleOptionClick;

  const handleRepeat = () => {
    setShowResults(false);
    queueRef.current = [];
    setScore(0);
    setTotalQuestions(0);
    setTotalTimeTaken(0);
    setSeenCount(0);

    if (user) {
      setGameState('playing');
      nextQuestion();
    } else {
      setGameState('idle');
      nextQuestion();
    }
  };

  const handleNextLevel = () => {
    const currentIndex = DIFFICULTIES.indexOf(difficulty);
    if (currentIndex < DIFFICULTIES.length - 1) {
      const nextDiff = DIFFICULTIES[currentIndex + 1];
      setDifficulty(nextDiff);
      trackDifficultyChange(nextDiff);
      setShowResults(false);
    }
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

  if (authLoading || isLoading) {
    return (
      <div className="split-layout" style={{ justifyContent: 'center', alignItems: 'center', background: 'var(--bg-gradient)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2>{authLoading ? 'Signing in...' : 'Loading Flags...'}</h2>
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
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="left-panel">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Flag Master</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p className="subtitle">Learn all the flags of the world</p>
              {/* {gameState === 'playing' && (
                <button
                  onClick={handlePauseGame}
                  style={{
                    background: 'none',
                    border: '1px solid var(--text-muted)',
                    borderRadius: '8px',
                    padding: '0.2rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Pause size={12} /> Pause
                </button>
              )} */}
            </div>
          </div>
          <div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.5)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  ) : (
                    <UserIcon size={20} />
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.displayName?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setIsLoginModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Flag size={16} />
                Sign In
              </button>
            )}
          </div>
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

        <div className="flag-display-section" style={{ position: 'relative' }}>
          {/* Game Overlay Removed as requested */}
          {currentQuestion && (
            <FlagCard
              flagUrl={currentQuestion.correctCountry.flags.svg}
              altText={currentQuestion.correctCountry.flags.alt}
            />
          )}
          {!currentQuestion && gameState === 'idle' && (
            <div style={{ width: '100%', aspectRatio: '3/2', background: 'rgba(0,0,0,0.05)', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
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
          <div className="timer-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={gameState === 'playing' ? handlePauseGame : handleResumeGame}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={gameState === 'playing' ? 'Pause Game' : 'Start Game'}
            >
              {gameState === 'playing' ? (
                <Pause size={10} fill="currentColor" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
            </button>
            <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                className="timer-fill"
                style={{
                  height: '100%',
                  width: `${(timeLeft / currentLimit) * 100}%`,
                  background: timeLeft < (currentLimit * 0.3) ? 'var(--error)' : 'var(--primary)',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
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

          {/* Stats Grid Commented Out as requested
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
          */}

          <Leaderboard key={`${difficulty}-${userCountry}`} difficulty={difficulty} userCountry={userCountry} />
        </div>
      </div>

      {showResults && countries && (
        <ResultsModal
          score={score}
          totalQuestions={totalQuestions}
          accuracy={totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}
          onRepeat={handleRepeat}
          onNextLevel={handleNextLevel}
          hasNextLevel={DIFFICULTIES.indexOf(difficulty) < DIFFICULTIES.length - 1}
        />
      )}
    </div>
  );
}

export default App;
