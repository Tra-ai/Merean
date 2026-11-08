# TRA APP — Unified Study + Literature

This project merges the two uploaded TRA projects into one React/Vite app.

## Included
- TRA Study app: books, exams, universities, profile, search, favorites.
- TRA Literature Library: story library, search/filtering, story reader, audio support and secondary pages.
- One switch at the top to move between the two sections.
- Shared React/Vite/Tailwind setup.

## Run
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

The two original projects are kept under:
- `src/studyapp/`
- `src/libraryapp/`

The unified entry point is `src/App.tsx`.


## Deploy as a website (Vercel)
1. Upload this project to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. No environment variables are required for the current frontend.

The project also includes a web app manifest and a service worker for installable PWA support.
