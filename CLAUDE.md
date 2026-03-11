# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dashboard de finanzas personales built with React + Vite. Displays income, expenses, balance, savings rate, charts, and recent transactions using sample data.

## Commands

- `npm run dev` — Start dev server (Vite, hot reload)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally

## Tech Stack

- **React 19** with Vite
- **Recharts** — Bar and Pie charts
- **react-icons** — Icon set (using Feather icons via `fi` prefix)

## Architecture

```
src/
  App.jsx          — Main dashboard layout, assembles all sections
  App.css          — Layout grid styles (stats, charts, responsive)
  index.css        — Global styles, dark theme base
  components/
    StatCard.jsx   — Reusable metric card (icon, value, trend indicator)
    TransactionList.jsx — List of recent transactions with color-coded amounts
  data/
    sampleData.js  — Mock data: monthlyData, categorias, transacciones
```

## Conventions

- UI language is **Spanish** (labels, categories, months)
- Currency format: `toLocaleString('es-ES')` with `€` symbol
- Dark theme: background `#12121a`, cards `#1e1e2e`, borders `#2e2e3e`
- Colors: green `#10b981` (income/positive), red `#ef4444` (expenses/negative)
- Each component has a co-located `.css` file with the same name
