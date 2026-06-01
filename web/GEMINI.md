# Web Frontend (Next.js)

This directory contains the Next.js frontend for CodeFlip.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI / Shadcn UI
- **API Client**: Axios / SWR

## Development Standards

- **Components**: Use functional components with TypeScript interfaces for props.
- **Styling**: Prefer utility classes from Tailwind CSS. Use `cn` helper for conditional classes.
- **State Management**: Use React Hooks (`useState`, `useEffect`, `useMemo`) and `swr` for data fetching.
- **UI System**: Follow the patterns in `components/ui` for new components.
- **Linting**: Ensure `npm run lint` passes before committing.

## Run Commands

- `npm run dev` (local dev)
- `npm run build` (production build)
