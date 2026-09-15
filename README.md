# Playful Loaders

Four interactive game loading states extracted from a personal portfolio and rebuilt as reusable React components. The complete splash includes the shimmering resolution field, playable game, score, loading-to-ready transition, ready notice, and exit effect. The public specimen site uses Radix UI primitives, a shared CSS token system, and Inter.

## Components

- `GameLoadingSplash` — the full-screen loading experience with a `game` prop
- `PlayfulLoader` — compact card treatment for embedded placements
- `SnakeLoader`
- `TetrisLoader`
- `PongLoader`
- `SpaceInvadersLoader`

```tsx
import { GameLoadingSplash } from "@/components/playful-loaders";

<GameLoadingSplash
  game="snake"
  readyAfterMs={4500}
  onDismiss={() => showPage()}
/>;
```

The splash defaults to full-screen and can wrap the page it is preparing. Set `fullscreen={false}` for a contained specimen, or control completion with the `ready` prop. Shared props include `tone`, `accent`, `active`, `showStatus`, `ready`, `readyAfterMs`, `onDismiss`, and `onScoreChange`.

## Development

```sh
npm install
npm run dev
```

Build the production site with `npm run build`.
