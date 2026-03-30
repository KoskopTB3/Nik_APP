import React, { useState, useEffect } from "react";
import bg from "./assets/bg.png";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function App() {
  const [mode, setMode] = useState("single");
  const [fixedNumber, setFixedNumber] = useState("");
  const [useTimer, setUseTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState("");
  const [count, setCount] = useState("");

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState([]);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!useTimer || !started || feedback) return;

    if (timeLeft <= 0) {
      processAnswer(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, started, useTimer, feedback]);

  const generateTasks = () => {
    const arr = [];
    const cnt = Number(count) || 0;

    if (mode === "single") {
      const num = Number(fixedNumber) || 0;
      let possible = Array.from({ length: 10 }, (_, i) => i + 1);
      possible = shuffle(possible).slice(0, cnt);

      possible.forEach((b) => {
        arr.push({ a: num, b });
      });
    } else {
      const all = [];
      for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= 10; b++) {
          all.push({ a, b });
        }
      }
      const unique = shuffle(all).slice(0, cnt);
      return unique;
    }

    return arr;
  };

  const normalizeCount = (val) => {
    let num = Number(val) || 0;

    if (mode === "single") {
      if (num > 10) num = 10;
    }

    if (num < 1) num = 1;
    return num;
  };

  const normalizeTime = (val) => {
    let num = Number(val) || 1;
    if (num < 1) num = 1;
    if (num > 15) num = 15;
    return num;
  };

  const startTest = () => {
    const normalizedCount = normalizeCount(count);
    const t = generateTasks();

    setTasks(t);
    setStarted(true);
    setCurrent(0);
    setResults([]);
    setAnswer("");

    if (useTimer) setTimeLeft(normalizeTime(timeLimit));
  };

  const processAnswer = (timeout = false) => {
    if (feedback) return;

    const task = tasks[current];
    const correct = task.a * task.b;
    const userAnswer = timeout ? null : Number(answer);
    const isCorrect = userAnswer === correct;

    setResults((prev) => [
      ...prev,
      { ...task, correct, userAnswer, isCorrect },
    ]);

    setFeedback({
      message: isCorrect
        ? "Відповідь вірна"
        : `Відповідь не вірна. Правильна: ${correct}`,
      isCorrect,
    });

    setAnswer("");

    setTimeout(() => {
      setFeedback(null);

      if (current + 1 < tasks.length) {
        setCurrent((prev) => prev + 1);
        if (useTimer) setTimeLeft(normalizeTime(timeLimit));
      } else {
        setStarted(false);
      }
    }, 3000);
  };

  const Card = ({ children }) => (
    <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full mx-auto mt-6">
      {children}
    </div>
  );

  const Button = ({ children, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl mt-4 w-full text-white ${
        disabled ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {children}
    </button>
  );

  if (!started && results.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <Card>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Таблиця множення
          </h2>

          <div className="space-y-2">
            <label className="block">
              <input
                type="radio"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />{" "}
              Множення на конкретне число
            </label>
            <label className="block">
              <input
                type="radio"
                checked={mode === "random"}
                onChange={() => setMode("random")}
              />{" "}
              Випадкові числа
            </label>
          </div>

          {mode === "single" && (
            <input
              type="number"
              value={fixedNumber}
              placeholder="Введіть число (1-10)"
              onChange={(e) => setFixedNumber(e.target.value)}
              className="border p-2 rounded w-full mt-3"
            />
          )}

          <input
            type="number"
            value={count}
            placeholder="Введіть кількість прикладів"
            onChange={(e) => setCount(normalizeCount(e.target.value))}
            className="border p-2 rounded w-full mt-3"
          />

          <label className="block mt-3">
            <input
              type="checkbox"
              checked={useTimer}
              onChange={() => setUseTimer(!useTimer)}
            />{" "}
            Таймер
          </label>

          {useTimer && (
            <input
              type="number"
              value={timeLimit}
              placeholder="Час на відповідь (1-15 сек)"
              onChange={(e) => setTimeLimit(normalizeTime(e.target.value))}
              className="border p-2 rounded w-full mt-2"
            />
          )}

          <Button onClick={startTest}>Почати</Button>
        </Card>
      </div>
    );
  }

  if (started) {
    const task = tasks[current];

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <Card>
          <h3 className="text-center mb-2">
            {current + 1} / {tasks.length}
          </h3>

          <h1 className="text-4xl text-center font-bold mb-4">
            {task.a} × {task.b}
          </h1>

          {useTimer && (
            <div className="text-center text-red-500 mb-2">⏳ {timeLeft}</div>
          )}

          <input
            autoFocus
            disabled={!!feedback}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") processAnswer(false);
            }}
            className="border p-3 rounded w-full text-center text-xl"
          />

          {feedback && (
            <div
              className={`text-center mt-3 font-semibold ${
                feedback.isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <Button onClick={() => processAnswer(false)} disabled={!!feedback}>
            Перевірити
          </Button>
        </Card>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.isCorrect).length;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card>
        <h2 className="text-xl font-bold text-center">Результат</h2>
        <p className="text-center mt-2">
          Правильних: {correctCount} з {results.length}
        </p>

        <div className="mt-4 max-h-60 overflow-auto">
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex justify-between p-2 rounded mb-1 ${
                r.isCorrect ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <span>
                {r.a}×{r.b}
              </span>
              <span>Ваш: {r.userAnswer ?? "—"}</span>
              <span>Правильно: {r.correct}</span>
            </div>
          ))}
        </div>

        <Button onClick={() => window.location.reload()}>Ще раз</Button>
      </Card>
    </div>
  );
}
