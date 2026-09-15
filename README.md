# Playful Loaders

Four interactive game loading states extracted from a personal portfolio and rebuilt as reusable React components. The public specimen site uses Radix UI primitives, a shared CSS token system, and Inter.

## Components

- `PlayfulLoader` — generic loader with a `game` prop
- `SnakeLoader`
- `TetrisLoader`
- `PongLoader`
- `SpaceInvadersLoader`

```tsx
import { PlayfulLoader } from "@/components/playful-loaders";

<PlayfulLoader game="snake" tone="paper" accent="#146EF5" />;
```

The shared props include `tone`, `accent`, `active`, `showStatus`, `label`, and `onScoreChange`.

## Development

```sh
npm install
npm run dev
```

Build the production site with `npm run build`.
