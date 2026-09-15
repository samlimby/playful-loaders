"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clipboard, Code2, Layers3, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Switch, Tabs, Tooltip } from "radix-ui";
import { GameLoadingSplash, type LoaderGame, type LoaderTone } from "@/components/playful-loaders";

const games: Array<{ value: LoaderGame; label: string; short: string }> = [
  { value: "snake", label: "Snake", short: "01" },
  { value: "tetris", label: "Tetris", short: "02" },
  { value: "pong", label: "Pong", short: "03" },
  { value: "space-invaders", label: "Space Invaders", short: "04" },
];

const palette = [
  ["Ink", "#111111"], ["Paper", "#FFFFFF"], ["Blue", "#146EF5"],
  ["Violet", "#6550B9"], ["Ruby", "#E5484D"], ["Green", "#16A36A"],
];

const breakpoints = [
  { value: "mobile", label: "Mobile", width: 390, height: 844 },
  { value: "tablet", label: "Tablet", width: 768, height: 1024 },
  { value: "laptop", label: "Laptop", width: 1280, height: 800 },
  { value: "desktop", label: "Desktop", width: 1536, height: 1003 },
] as const;

type Breakpoint = (typeof breakpoints)[number];

function BreakpointViewport({ viewport, game, tone, showStatus }: {
  viewport: Breakpoint;
  game: LoaderGame;
  tone: LoaderTone;
  showStatus: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const mobile = viewport.width <= 620;
  const playArea = Math.min(768, viewport.width - (mobile ? 24 : 32), viewport.height - (mobile ? 120 : 136));
  const cell = playArea * 42.9312 / 768;
  const gap = playArea * 13.2096 / 768;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const updateScale = () => setScale(frame.clientWidth / viewport.width);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [viewport.width]);

  return (
    <div className="breakpoint-preview">
      <div className="breakpoint-preview__meta">
        <div><span>{viewport.label}</span><strong>{viewport.width} × {viewport.height}</strong></div>
        <dl>
          <div><dt>Play area</dt><dd>{Math.round(playArea)}px</dd></div>
          <div><dt>Block</dt><dd>{cell.toFixed(1)}px</dd></div>
          <div><dt>Gap</dt><dd>{gap.toFixed(1)}px</dd></div>
        </dl>
      </div>
      <div className="breakpoint-preview__stage">
        <div
          ref={frameRef}
          className="breakpoint-preview__frame"
          style={{ height: viewport.height * scale }}
        >
          <div
            className="breakpoint-preview__viewport"
            style={{
              width: viewport.width,
              height: viewport.height,
              transform: `scale(${scale})`,
            }}
          >
            <GameLoadingSplash
              game={game}
              tone={tone}
              active={false}
              showStatus={showStatus}
              fullscreen={false}
              previewViewport={{ width: viewport.width, height: viewport.height }}
              ready
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const codeSample = `import { GameLoadingSplash } from "@/components/playful-loaders";

<GameLoadingSplash
  game="snake"
  tone="paper"
  readyAfterMs={4500}
  onDismiss={() => showPage()}
/>`;

export default function Home() {
  const [game, setGame] = useState<LoaderGame>("snake");
  const [tone, setTone] = useState<LoaderTone>("ink");
  const [showStatus, setShowStatus] = useState(true);
  const [copied, setCopied] = useState(false);
  const [splashRevision, setSplashRevision] = useState(0);
  const [breakpoint, setBreakpoint] = useState("desktop");

  const displayedCode = codeSample
    .replace('game="snake"', `game="${game}"`)
    .replace('tone="paper"', `tone="${tone}"`);
  const copyCode = async () => {
    await navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <GameLoadingSplash
      key={splashRevision}
      game={game}
      tone={tone}
      readyAfterMs={3800}
    >
    <Tooltip.Provider delayDuration={180}>
      <div className="site-shell">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Playful Loaders home">
            <img className="wordmark-mark" src="/brand-mark.png" alt="" aria-hidden="true" />
            <span>Playful Loaders</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#specimens">Specimens</a><a href="#responsive">Responsive</a><a href="#tokens">Tokens</a><a href="#usage">Usage</a>
          </nav>
          <span className="version-badge">v0.1</span>
        </header>

        <main id="top">
          <section className="intro" aria-labelledby="page-title">
            <div><p className="eyebrow">A tiny React arcade for the in-between</p><h1 id="page-title">Waiting has<br />a score.</h1></div>
            <p className="intro-copy">The complete portfolio loading experience—shimmer field, game, score, ready state, and exit transition—packaged as one shareable React component.</p>
          </section>

          <section className="workbench" id="specimens" aria-label="Interactive loader workbench">
            <Tabs.Root className="game-tabs" value={game} onValueChange={(value) => setGame(value as LoaderGame)}>
              <Tabs.List className="game-tabs__list" aria-label="Choose a loading game">
                {games.map((item) => <Tabs.Trigger className="game-tabs__trigger" value={item.value} key={item.value}><span>{item.short}</span>{item.label}</Tabs.Trigger>)}
              </Tabs.List>
              {games.map((item) => <Tabs.Content value={item.value} key={item.value} className="game-tabs__content"><GameLoadingSplash key={`${item.value}-${splashRevision}`} game={item.value} tone={tone} showStatus={showStatus} fullscreen={false} readyAfterMs={3800} onDismiss={() => window.setTimeout(() => setSplashRevision((value) => value + 1), 420)} /></Tabs.Content>)}
            </Tabs.Root>

            <aside className="control-rail" aria-label="Component controls">
              <div className="rail-heading"><SlidersHorizontal size={16} /><span>Props</span></div>
              <div className="control-row"><span>tone</span><div className="segmented" aria-label="Tone">
                {(["paper", "ink"] as LoaderTone[]).map((option) => <button key={option} type="button" data-active={tone === option} onClick={() => setTone(option)}>{option}</button>)}
              </div></div>
              <div className="control-row"><span>status</span><Switch.Root className="switch-root" checked={showStatus} onCheckedChange={setShowStatus} aria-label="Show loader status"><Switch.Thumb className="switch-thumb" /></Switch.Root></div>
              <div className="control-row"><span>transition</span><button type="button" className="replay-button" onClick={() => setSplashRevision((value) => value + 1)}><RotateCcw size={13} />Replay full screen</button></div>
              <div className="rail-heading rail-heading--tokens"><Layers3 size={16} /><span>Active tokens</span></div>
              <div className="active-tokens">
                <div><i style={{ background: "var(--pl-blue-9)" }} /><span>accent</span><code>blue.9</code></div>
                <div><i style={{ background: tone === "paper" ? "#fff" : "#111" }} /><span>surface</span><code>{tone}</code></div>
                <div><i className="radius-token" /><span>radius</span><code>16px</code></div>
              </div>
              <button type="button" className="copy-button" onClick={copyCode}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? "Copied" : "Copy component"}</button>
            </aside>
          </section>

          <section className="specimen-section" aria-labelledby="specimen-title">
            <div className="section-heading"><p className="eyebrow">The set</p><h2 id="specimen-title">Four ways to pass the time.</h2></div>
            <div className="specimen-grid">
              {games.map((item) => <article className="specimen-card" key={item.value}>
                <div className="specimen-meta"><span>{item.short}</span><h3>{item.label}</h3></div>
                <GameLoadingSplash game={item.value} active={false} showStatus={false} fullscreen={false} readyAfterMs={-1} />
                <button type="button" onClick={() => { setGame(item.value); document.querySelector("#specimens")?.scrollIntoView({ behavior: "smooth" }); }}>Open specimen <span aria-hidden="true">↗</span></button>
              </article>)}
            </div>
          </section>

          <section className="responsive-section" id="responsive" aria-labelledby="responsive-title">
            <div className="section-heading section-heading--responsive">
              <div><p className="eyebrow">Full loading screen</p><h2 id="responsive-title">One splash.<br />Every viewport.</h2></div>
              <p>The complete loading screen is rendered at the selected device size, then scaled to fit this page. Its 12 × 12 field keeps the portfolio’s exact 7% padding and 2% gap geometry.</p>
            </div>
            <Tabs.Root className="breakpoint-tabs" value={breakpoint} onValueChange={setBreakpoint}>
              <Tabs.List className="breakpoint-tabs__list" aria-label="Preview loading screen at a breakpoint">
                {breakpoints.map((item) => (
                  <Tabs.Trigger key={item.value} value={item.value}>
                    <span>{item.label}</span><small>{item.width} × {item.height}</small>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {breakpoints.map((item) => (
                <Tabs.Content key={item.value} value={item.value} className="breakpoint-tabs__content">
                  <BreakpointViewport viewport={item} game={game} tone={tone} showStatus={showStatus} />
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </section>

          <section className="tokens-section" id="tokens" aria-labelledby="tokens-title">
            <div className="section-heading section-heading--tokens"><div><p className="eyebrow">Foundation</p><h2 id="tokens-title">Radix-minded tokens.</h2></div><p>Small scales, semantic aliases, and enough color for every game to keep its own personality.</p></div>
            <Tabs.Root defaultValue="color" className="token-tabs">
              <Tabs.List className="token-tabs__list" aria-label="Token categories"><Tabs.Trigger value="color">Color</Tabs.Trigger><Tabs.Trigger value="type">Type</Tabs.Trigger><Tabs.Trigger value="space">Space & radius</Tabs.Trigger></Tabs.List>
              <Tabs.Content value="color" className="token-panel">
                {palette.map(([name, value]) => <Tooltip.Root key={name}><Tooltip.Trigger asChild><button type="button" className="swatch" aria-label={`${name} ${value}`}><i style={{ background: value }} /><span>{name}</span><code>{value}</code></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="tooltip-content" sideOffset={8}>--pl-{name.toLowerCase()}<Tooltip.Arrow className="tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>)}
              </Tabs.Content>
              <Tabs.Content value="type" className="type-panel"><p className="type-display">Inter Display / 64</p><p className="type-heading">Inter Semibold / 24</p><p className="type-body">Inter Regular / 16 — built for clear status, controls, and scores.</p></Tabs.Content>
              <Tabs.Content value="space" className="space-panel">{[4, 8, 12, 16, 24, 32, 48].map((value) => <div key={value}><i style={{ width: value }} /><span>{value}px</span></div>)}</Tabs.Content>
            </Tabs.Root>
          </section>

          <section className="usage-section" id="usage" aria-labelledby="usage-title">
            <div className="usage-copy"><p className="eyebrow">Use it</p><h2 id="usage-title">One component.<br />Four games.</h2><p>Drop the generic component into any loading boundary, or import a named loader when the game never changes.</p></div>
            <div className="code-card"><div><Code2 size={16} /><span>Example.tsx</span><button type="button" onClick={copyCode}>{copied ? "Copied" : "Copy"}</button></div><pre><code>{displayedCode}</code></pre></div>
          </section>
        </main>

        <footer className="site-footer"><span>Playful Loaders</span><span>React · Radix UI · Inter</span><a href="#top">Back to top ↑</a></footer>
      </div>
    </Tooltip.Provider>
    </GameLoadingSplash>
  );
}
