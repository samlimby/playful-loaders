"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LoaderGame = "snake" | "tetris" | "pong" | "space-invaders";
export type LoaderTone = "paper" | "ink";

export type PlayfulLoaderProps = {
  game?: LoaderGame;
  tone?: LoaderTone;
  accent?: string;
  active?: boolean;
  showStatus?: boolean;
  label?: string;
  onScoreChange?: (score: number) => void;
};

export type GameLoadingSplashProps = PlayfulLoaderProps & {
  children?: React.ReactNode;
  fullscreen?: boolean;
  ready?: boolean;
  readyAfterMs?: number;
  onDismiss?: () => void;
};

type Point = { x: number; y: number };
type GameCanvasProps = {
  active: boolean;
  accent: string;
  onScoreChange: (score: number) => void;
};

const SIZE = 360;
const GRID = 12;
const PADDING = 24;
const GAP = 4;
const CELL = (SIZE - PADDING * 2 - GAP * (GRID - 1)) / GRID;

const GAME_LABELS: Record<LoaderGame, string> = {
  snake: "Snake",
  tetris: "Tetris",
  pong: "Pong",
  "space-invaders": "Space Invaders",
};

const GAME_HELP: Record<LoaderGame, string> = {
  snake: "Arrow keys or WASD to steer",
  tetris: "Arrows or WASD to move and rotate",
  pong: "Up/down or W/S to move",
  "space-invaders": "Left/right to move · Space to fire",
};

const RESOLUTION_CELLS = Array.from({ length: GRID ** 2 }, (_, index) => {
  const x = index % GRID;
  const y = Math.floor(index / GRID);
  return {
    index,
    delay: (Math.abs(x - 5.5) + Math.abs(y - 5.5) - 12) * 0.055,
    tone: Math.min(100, (28 + ((x * 13 + y * 9) % 34)) * 1.38),
  };
});

function pixel(
  context: CanvasRenderingContext2D,
  point: Point,
  color: string,
  scale = 1,
) {
  const size = CELL * scale;
  const inset = (CELL - size) / 2;
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(
    PADDING + point.x * (CELL + GAP) + inset,
    PADDING + point.y * (CELL + GAP) + inset,
    size,
    size,
    Math.max(2, size * 0.18),
  );
  context.fill();
}

function prepareCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, SIZE, SIZE);
  return context;
}

function useWindowKeys(
  active: boolean,
  handler: (event: KeyboardEvent) => boolean,
) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!handler(event)) return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, handler]);
}

function SnakeCanvas({ active, accent, onScoreChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const direction = useRef<Point>({ x: 1, y: 0 });
  const [snake, setSnake] = useState<Point[]>([
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ]);
  const [food, setFood] = useState<Point>({ x: 9, y: 6 });
  const [score, setScore] = useState(0);

  const handleKey = useCallback((event: KeyboardEvent) => {
    const moves: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
    };
    const next = moves[event.code];
    if (!next) return false;
    if (next.x !== -direction.current.x || next.y !== -direction.current.y) {
      direction.current = next;
    }
    return true;
  }, []);
  useWindowKeys(active, handleKey);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const next = {
          x: (head.x + direction.current.x + GRID) % GRID,
          y: (head.y + direction.current.y + GRID) % GRID,
        };
        const hit = current.some((part) => part.x === next.x && part.y === next.y);
        if (hit) {
          setScore(0);
          setFood({ x: 9, y: 6 });
          direction.current = { x: 1, y: 0 };
          return [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
        }
        const ate = next.x === food.x && next.y === food.y;
        if (ate) {
          setScore((value) => value + 10);
          setFood({ x: (food.x + 5) % GRID, y: (food.y + 7) % GRID });
        }
        return [next, ...current].slice(0, ate ? current.length + 1 : current.length);
      });
    }, 145);
    return () => window.clearInterval(timer);
  }, [active, food]);

  useEffect(() => onScoreChange(score), [onScoreChange, score]);
  useEffect(() => {
    const context = canvasRef.current && prepareCanvas(canvasRef.current);
    if (!context) return;
    snake.forEach((part, index) => pixel(context, part, accent, index ? 0.9 : 1));
    pixel(context, food, "#16a36a", 0.68);
  }, [accent, food, snake]);

  return <canvas ref={canvasRef} className="pl-canvas" role="img" aria-label="Interactive Snake loader" />;
}

const SHAPES: Point[][] = [
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
];
const PIECE_COLORS = ["#146ef5", "#6550b9", "#e5484d", "#12a594"];

function TetrisCanvas({ active, onScoreChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settled, setSettled] = useState<Array<Point & { color: string }>>([
    { x: 4, y: 11, color: "#12a594" }, { x: 5, y: 11, color: "#12a594" },
    { x: 6, y: 11, color: "#6550b9" }, { x: 7, y: 11, color: "#6550b9" },
  ]);
  const [pieceIndex, setPieceIndex] = useState(0);
  const [piece, setPiece] = useState({ x: 4, y: 0, rotation: 0 });
  const [score, setScore] = useState(0);

  const cells = useCallback((candidate = piece) => {
    let points = SHAPES[pieceIndex].map((point) => ({ ...point }));
    for (let turn = 0; turn < candidate.rotation % 4; turn += 1) {
      points = points.map(({ x, y }) => ({ x: 2 - y, y: x }));
    }
    return points.map(({ x, y }) => ({ x: x + candidate.x, y: y + candidate.y }));
  }, [piece, pieceIndex]);

  const valid = useCallback((candidate: typeof piece) => cells(candidate).every((point) => (
    point.x >= 0 && point.x < GRID && point.y >= 0 && point.y < GRID
    && !settled.some((fixed) => fixed.x === point.x && fixed.y === point.y)
  )), [cells, settled]);

  const move = useCallback((dx: number, dy: number, rotate = false) => {
    setPiece((current) => {
      const next = { x: current.x + dx, y: current.y + dy, rotation: current.rotation + (rotate ? 1 : 0) };
      return valid(next) ? next : current;
    });
  }, [valid]);

  const handleKey = useCallback((event: KeyboardEvent) => {
    if (["ArrowLeft", "KeyA"].includes(event.code)) move(-1, 0);
    else if (["ArrowRight", "KeyD"].includes(event.code)) move(1, 0);
    else if (["ArrowDown", "KeyS"].includes(event.code)) move(0, 1);
    else if (["ArrowUp", "KeyW"].includes(event.code)) move(0, 0, true);
    else return false;
    return true;
  }, [move]);
  useWindowKeys(active, handleKey);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setPiece((current) => {
        const next = { ...current, y: current.y + 1 };
        if (valid(next)) return next;
        const locked = cells(current).map((point) => ({ ...point, color: PIECE_COLORS[pieceIndex] }));
        setSettled((fixed) => [...fixed, ...locked].filter((point) => point.y > 1).slice(-64));
        setScore((value) => value + 25);
        setPieceIndex((value) => (value + 1) % SHAPES.length);
        return { x: 4, y: 0, rotation: 0 };
      });
    }, 430);
    return () => window.clearInterval(timer);
  }, [active, cells, pieceIndex, valid]);

  useEffect(() => onScoreChange(score), [onScoreChange, score]);
  useEffect(() => {
    const context = canvasRef.current && prepareCanvas(canvasRef.current);
    if (!context) return;
    settled.forEach((point) => pixel(context, point, point.color));
    cells().forEach((point) => pixel(context, point, PIECE_COLORS[pieceIndex]));
  }, [cells, pieceIndex, settled]);

  return <canvas ref={canvasRef} className="pl-canvas" role="img" aria-label="Interactive Tetris loader" />;
}

function PongCanvas({ active, accent, onScoreChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerY, setPlayerY] = useState(5);
  const [ball, setBall] = useState({ x: 6, y: 5, vx: 1, vy: 1 });
  const [score, setScore] = useState(0);

  const handleKey = useCallback((event: KeyboardEvent) => {
    if (["ArrowUp", "KeyW", "ArrowLeft", "KeyA"].includes(event.code)) setPlayerY((y) => Math.max(1, y - 1));
    else if (["ArrowDown", "KeyS", "ArrowRight", "KeyD"].includes(event.code)) setPlayerY((y) => Math.min(8, y + 1));
    else return false;
    return true;
  }, []);
  useWindowKeys(active, handleKey);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setBall((current) => {
        let { x, y, vx, vy } = current;
        let nextX = x + vx;
        let nextY = y + vy;
        if (nextY <= 0 || nextY >= 11) { vy *= -1; nextY = y + vy; }
        const opponentY = Math.round(y);
        if (nextX >= 10 && Math.abs(nextY - opponentY) <= 2) { vx = -1; nextX = 9; }
        if (nextX <= 1 && Math.abs(nextY - playerY) <= 2) { vx = 1; nextX = 2; setScore((v) => v + 10); }
        if (nextX < 0 || nextX > 11) { nextX = 6; nextY = 5; vx = nextX < 0 ? 1 : -1; }
        return { x: nextX, y: nextY, vx, vy };
      });
    }, 105);
    return () => window.clearInterval(timer);
  }, [active, playerY]);

  useEffect(() => onScoreChange(score), [onScoreChange, score]);
  useEffect(() => {
    const context = canvasRef.current && prepareCanvas(canvasRef.current);
    if (!context) return;
    [playerY - 1, playerY, playerY + 1].forEach((y) => pixel(context, { x: 0, y }, accent));
    const opponentY = Math.max(1, Math.min(10, Math.round(ball.y)));
    [opponentY - 1, opponentY, opponentY + 1].forEach((y) => pixel(context, { x: 11, y }, "#6550b9"));
    pixel(context, { x: Math.round(ball.x), y: Math.round(ball.y) }, "#e5484d", 0.72);
  }, [accent, ball, playerY]);

  return <canvas ref={canvasRef} className="pl-canvas" role="img" aria-label="Interactive Pong loader" />;
}

function InvadersCanvas({ active, accent, onScoreChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerX, setPlayerX] = useState(5);
  const [invaders, setInvaders] = useState<Point[]>(() => (
    Array.from({ length: 12 }, (_, index) => ({ x: 2 + (index % 4) * 2, y: 1 + Math.floor(index / 4) * 2 }))
  ));
  const [shot, setShot] = useState<Point | null>(null);
  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);

  const handleKey = useCallback((event: KeyboardEvent) => {
    if (["ArrowLeft", "KeyA"].includes(event.code)) setPlayerX((x) => Math.max(1, x - 1));
    else if (["ArrowRight", "KeyD"].includes(event.code)) setPlayerX((x) => Math.min(9, x + 1));
    else if (["Space", "ArrowUp", "KeyW", "ArrowDown", "KeyS"].includes(event.code)) setShot((current) => current || { x: playerX + 1, y: 9 });
    else return false;
    return true;
  }, [playerX]);
  useWindowKeys(active, handleKey);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setOffset((current) => {
        const next = current + direction;
        if (next > 1 || next < -1) { setDirection((value) => -value); return current - direction; }
        return next;
      });
      setShot((current) => {
        if (!current) return null;
        const next = { ...current, y: current.y - 1 };
        const hit = invaders.findIndex((invader) => invader.x + offset === next.x && invader.y === next.y);
        if (hit >= 0) {
          setInvaders((currentInvaders) => currentInvaders.filter((_, index) => index !== hit));
          setScore((value) => value + 20);
          return null;
        }
        return next.y < 0 ? null : next;
      });
    }, 155);
    return () => window.clearInterval(timer);
  }, [active, direction, invaders, offset]);

  useEffect(() => {
    if (invaders.length === 0) {
      setInvaders(Array.from({ length: 12 }, (_, index) => ({ x: 2 + (index % 4) * 2, y: 1 + Math.floor(index / 4) * 2 })));
      setOffset(0);
    }
  }, [invaders.length]);
  useEffect(() => onScoreChange(score), [onScoreChange, score]);
  useEffect(() => {
    const context = canvasRef.current && prepareCanvas(canvasRef.current);
    if (!context) return;
    const colors = [accent, "#6550b9", "#e5484d"];
    invaders.forEach((point, index) => pixel(context, { x: point.x + offset, y: point.y }, colors[index % colors.length], 0.78));
    [{ x: playerX, y: 11 }, { x: playerX + 1, y: 10 }, { x: playerX + 1, y: 11 }, { x: playerX + 2, y: 11 }]
      .forEach((point) => pixel(context, point, accent));
    if (shot) pixel(context, shot, "#16a36a", 0.36);
  }, [accent, invaders, offset, playerX, shot]);

  return <canvas ref={canvasRef} className="pl-canvas" role="img" aria-label="Interactive Space Invaders loader" />;
}

const GAME_COMPONENTS = {
  snake: SnakeCanvas,
  tetris: TetrisCanvas,
  pong: PongCanvas,
  "space-invaders": InvadersCanvas,
};

function ResolutionField({ paused, intro }: { paused: boolean; intro: boolean }) {
  return (
    <div className="pl-splash__resolution" data-paused={paused} aria-hidden="true">
      {RESOLUTION_CELLS.map(({ delay, index, tone }) => (
        <i
          key={index}
          style={{
            "--pl-cell-delay": `${delay}s`,
            "--pl-cell-tone": `${Math.min(100, tone * (intro ? 1.5 : 1))}%`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="pl-splash__spinner" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="50.27" strokeDashoffset="14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="pl-splash__arrow" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M8 5h7v7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.2v4M8 4.7v.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GameLoadingSplash({
  children,
  game = "snake",
  tone = "paper",
  accent = "#146ef5",
  active = true,
  showStatus = true,
  fullscreen = true,
  ready: controlledReady,
  readyAfterMs = 4500,
  onScoreChange,
  onDismiss,
}: GameLoadingSplashProps) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const [introComplete, setIntroComplete] = useState(false);
  const [autoReady, setAutoReady] = useState(false);
  const [score, setScore] = useState(0);
  const Game = GAME_COMPONENTS[game];
  const ready = controlledReady ?? autoReady;

  const updateScore = useCallback((value: number) => {
    setScore(value);
    onScoreChange?.(value);
  }, [onScoreChange]);

  useEffect(() => {
    const introTimer = window.setTimeout(() => setIntroComplete(true), 800);
    const readyTimer = readyAfterMs >= 0
      ? window.setTimeout(() => setAutoReady(true), Math.max(800, readyAfterMs))
      : undefined;
    return () => {
      window.clearTimeout(introTimer);
      if (readyTimer) window.clearTimeout(readyTimer);
    };
  }, [readyAfterMs]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => {
      setPhase("done");
      onDismiss?.();
    }, 220);
    return () => window.clearTimeout(timer);
  }, [onDismiss, phase]);

  if (phase === "done") return children ? <>{children}</> : null;

  return (
    <>
    {children && <div className="pl-splash__content" aria-hidden="true" inert>{children}</div>}
    <section
      className="pl-splash"
      data-state={phase}
      data-game={game}
      data-tone={tone}
      data-mode={fullscreen ? "fullscreen" : "contained"}
      style={{ "--pl-accent": accent } as React.CSSProperties}
      role="region"
      aria-label={`${GAME_LABELS[game]} loading splash`}
      aria-busy={!ready}
    >
      {showStatus && (
        <>
          <div className="pl-splash__score" aria-live="polite"><span>Score:</span><strong>{score}</strong></div>
          <button
            type="button"
            className="pl-splash__status"
            data-ready={ready}
            disabled={!ready}
            onClick={() => setPhase("leaving")}
            aria-label={ready ? "View page" : "Loading page"}
          >
            <span className="pl-splash__status-label" aria-hidden="true"><span>Loading</span><span>View page</span></span>
            <span className="pl-splash__status-icon" aria-hidden="true"><span><LoadingSpinner /></span><span><ArrowIcon /></span></span>
          </button>
        </>
      )}

      <div className="pl-splash__game">
        <ResolutionField paused={phase !== "loading"} intro={!introComplete} />
        <div className="pl-splash__game-canvas" data-visible={introComplete}>
          {introComplete && <Game active={active && phase === "loading"} accent={accent} onScoreChange={updateScore} />}
        </div>
        {ready && showStatus && (
          <div className="pl-splash__ready" role="status"><InfoIcon /><span>The page is ready to view, but play for as long as you want!</span></div>
        )}
      </div>
      <p className="sr-only">{GAME_HELP[game]}</p>
    </section>
    </>
  );
}

export function PlayfulLoader({
  game = "snake",
  tone = "paper",
  accent = "#146ef5",
  active = true,
  showStatus = true,
  label = "Loading",
  onScoreChange,
}: PlayfulLoaderProps) {
  const [score, setScore] = useState(0);
  const updateScore = useCallback((value: number) => {
    setScore(value);
    onScoreChange?.(value);
  }, [onScoreChange]);
  const Game = useMemo(() => GAME_COMPONENTS[game], [game]);

  return (
    <section className="pl-loader" data-tone={tone} style={{ "--pl-accent": accent } as React.CSSProperties}>
      {showStatus && (
        <header className="pl-loader__status">
          <span>{GAME_LABELS[game]}</span>
          <span className="pl-loader__score">Score {score.toString().padStart(3, "0")}</span>
        </header>
      )}
      <div className="pl-loader__stage">
        <div className="pl-loader__resolution" aria-hidden="true" />
        <Game active={active} accent={accent} onScoreChange={updateScore} />
      </div>
      {showStatus && (
        <footer className="pl-loader__footer">
          <span><i className="pl-loader__pulse" />{label}</span>
          <span>{GAME_HELP[game]}</span>
        </footer>
      )}
    </section>
  );
}

export function SnakeLoader(props: Omit<PlayfulLoaderProps, "game">) {
  return <PlayfulLoader {...props} game="snake" />;
}
export function TetrisLoader(props: Omit<PlayfulLoaderProps, "game">) {
  return <PlayfulLoader {...props} game="tetris" />;
}
export function PongLoader(props: Omit<PlayfulLoaderProps, "game">) {
  return <PlayfulLoader {...props} game="pong" />;
}
export function SpaceInvadersLoader(props: Omit<PlayfulLoaderProps, "game">) {
  return <PlayfulLoader {...props} game="space-invaders" />;
}
