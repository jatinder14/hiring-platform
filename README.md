# HireU — Tech Talent Platform

**Live:** [hiring-platform-azure.vercel.app](https://hiring-platform-azure.vercel.app)

A single-page hiring platform built with Next.js: WebGL aurora background, scroll-driven tree reveal, domain tech stacks (AI/ML, Full Stack, Data Science, DevOps, QA), and interactive hireU word.

## Features

- **Aurora WebGL** — Animated gradient background with scroll-linked shader
- **Tree layer** — Fixed tree + ground mesh that appears in the story section, brightens at Message 2, exits at end trigger
- **Hero nav** — Sticky nav with logo, links, CTA; burger menu on small screens; “Find a Job” scrolls to story
- **Domains** — Hover/click tabs to switch tech stacks; logo wall + tile grid with CDN icons (Simple Icons)
- **hireU** — Large word with per-letter hover/touch glow
- **Accessibility** — Skip link, focus-visible styles, keyboard nav on domain tabs (←/→), ARIA where needed
- **Responsive** — Layout adapts for mobile; smooth scroll and reduced-motion respected

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Deploy (Vercel)

- **Auto-deploy:** Pushing to `main` triggers a production deploy when the repo is connected in Vercel (Settings → Git).
- **PR previews:** Every pull request gets a unique Vercel preview URL. A GitHub Action posts that URL as a comment on the PR so you can test before merging.
- **Manual:**
  ```bash
  npm run deploy      # preview
  npm run deploy:prod # production
  ```

## Stack

- Next.js 14 (App Router), React, TypeScript
- WebGL (aurora), Canvas 2D (tree + ground)
- Vercel for hosting
