import { useEffect, useRef, useState } from "react";
import "./App.css";

const messages = [
  "One task. One moment. You've got this.",
  "You're doing great. Keep going.",
  "Your effort matters.",
  "Someone is proud of how hard you're trying.",
  "Small steps create meaningful progress.",
];

const presets = [
  { label: "30 MIN", seconds: 1800 },
  { label: "1 HOUR", seconds: 3600 },
  { label: "2 HOURS", seconds: 7200 },
];

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function App() {
  const [duration, setDuration] = useState(3600);
  const [remaining, setRemaining] = useState(3600);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const endTimeRef = useRef(null);
  const timerRef = useRef(null);
  const messageRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    timerRef.current = window.setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );

      setRemaining(secondsLeft);

      if (secondsLeft === 0) {
        setRunning(false);
        setCompleted(true);
        endTimeRef.current = null;
        playCompletionSound();
      }
    }, 250);

    return () => window.clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    messageRef.current = window.setInterval(() => {
      setMessageIndex((previous) => (previous + 1) % messages.length);
    }, 60000);

    return () => window.clearInterval(messageRef.current);
  }, [running]);

  function playCompletionSound() {
    const audio = audioRef.current;
    if (!audio) return;

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 660;

    gain.gain.setValueAtTime(0.08, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.5);

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();
    oscillator.stop(audio.currentTime + 0.5);
  }

  function startPause() {
    if (running) {
      setRemaining(
        Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      );
      setRunning(false);
      endTimeRef.current = null;
      return;
    }

    if (remaining === 0) {
      setRemaining(duration);
      endTimeRef.current = Date.now() + duration * 1000;
    } else {
      endTimeRef.current = Date.now() + remaining * 1000;
    }

    if (!audioRef.current) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (AudioContextClass) {
        audioRef.current = new AudioContextClass();
      }
    }

    audioRef.current?.resume();

    setCompleted(false);
    setRunning(true);
  }

  function resetTimer() {
    setRunning(false);
    endTimeRef.current = null;
    setRemaining(duration);
    setCompleted(false);
    setMessageIndex(0);
  }

  function chooseDuration(seconds) {
    setRunning(false);
    endTimeRef.current = null;
    setDuration(seconds);
    setRemaining(seconds);
    setCompleted(false);
    setMessageIndex(0);
  }

  function applyCustomDuration(event) {
    event.preventDefault();

    const minutes = Number(customMinutes);

    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
      return;
    }

    chooseDuration(Math.round(minutes * 60));
    setCustomMinutes("");
  }

  function enterFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function nextMessage() {
    setMessageIndex((previous) => (previous + 1) % messages.length);
  }

  const progress = ((duration - remaining) / duration) * 100;

  return (
    <div className="app">
      <header className="header">
        <div className="logo"><span className="logo-icon">⌛</span> FocusFlow</div>

        <button className="fullscreen-btn" onClick={enterFullscreen} title="Toggle fullscreen">
          Focus mode
        </button>
      </header>

      <main className="timer-section">
        <p className="eyebrow">
          {completed ? "SESSION COMPLETE" : "TIME TO FOCUS"}
        </p>

        <div className="timer" role="timer" aria-label="Time remaining">
          {formatTime(remaining)}
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="motivation" aria-live="off">
          {completed
            ? "You did it. Be proud of your effort."
            : messages[messageIndex]}
        </p>

        <div className="presets">
          {presets.map((preset) => (
            <button
              key={preset.seconds}
              className={`preset ${
                duration === preset.seconds ? "selected" : ""
              }`}
              onClick={() => chooseDuration(preset.seconds)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form className="custom-form" onSubmit={applyCustomDuration}>
          <input
            type="number"
            min="1"
            max="1440"
            step="1"
            value={customMinutes}
            onChange={(event) => setCustomMinutes(event.target.value)}
            placeholder="Custom minutes"
            aria-label="Custom duration in minutes"
          />
          <button type="submit">Set Timer</button>
        </form>

        <div className="controls">
          <button className="start-btn" onClick={startPause}>
            {running
              ? "Ⅱ  Pause"
              : completed
                ? "▶  Start Again"
                : "▶  Start Focus"}
          </button>

          <button className="reset-btn" onClick={resetTimer}>
            ↻ Reset
          </button>
        </div>
      </main>

      <footer className="footer">
        <span>Motivation preview</span>
        <button className="next-message" onClick={nextMessage}>
          Next message <span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}

export default App;
