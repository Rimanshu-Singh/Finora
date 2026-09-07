# Finora

A complete monochrome personal expense tracking frontend built with Next.js 16, React, TypeScript, Tailwind CSS and Lucide icons. No authentication, API, database, external financial services, or persistence is configured.

## Run

```sh
npm install
npm run dev
```

On Windows with PowerShell execution restrictions, use `npm.cmd`. To use another port: `npm run dev -- --port 3100`.

```sh
npm run build
npm run start
npm run lint
npx playwright install chromium
npm test
```

The browser suite uses port 3100 and the production build. Run the build before testing.

## Routes

| Route                | Experience                                                                      |
| -------------------- | ------------------------------------------------------------------------------- |
| `/`                  | Spending overview, period selection, trend, recent expenses, category breakdown |
| `/transactions`      | Search, date groups, category/payment/amount/date filters, sorting              |
| `/transactions/[id]` | Expense details, edit, duplicate and confirmed deletion                         |
| `/analytics`         | Period totals, monochrome trend, ranked categories, weekday patterns            |
| `/budgets`           | Overall and category budgets with editable limits                               |
| `/categories`        | Create, rename, choose icons, archive/restore and set budgets                   |
| `/recurring`         | Create/edit schedules, pause/resume and delete                                  |
| `/calendar`          | Monthly navigation, date totals and daily expenses                              |
| `/settings`          | General settings, preferences, theme and data-control previews                  |
| `/more`              | Secondary mobile navigation                                                     |

Expense entry and global search are available throughout the app. Search opens with Ctrl/Cmd K; arrow keys move through results, Enter opens a result, and Escape closes the dialog.

## Architecture and integration boundaries

- `data/mock/`: 38 realistic transactions across September and a full preceding month; categories, budgets, recurring expenses, analytics metadata and settings in separate typed fixtures.
- `lib/types.ts`: Domain contracts for expenses, categories, budgets, recurring payments and settings.
- `lib/data/index.ts`: Data-access boundary. Replace these fixture reads with your future database/API queries. UI components never import mock fixtures.
- `app/layout.tsx`: Server-rendered initial data loading and the integration point for future session/auth context.
- `components/provider.tsx`: Shared **in-memory** demo state, theme, expense sheet and search. Replace local mutations with calls to your future authenticated data service. No browser storage is used.
- `lib/format.ts`: INR formatting and deterministic demo-date calculations.
- `components/`: Reusable navigation, amount formatting, transaction rows/lists/details, expense form, category picker, charts, progress indicators, editors, calendar, search, dialogs and feedback states.
- `app/globals.css`: Light/dark semantic tokens, responsive layouts, typography, spacing and reduced-motion treatment. Tailwind is configured and available for utility extensions.
- `tests/ledger.spec.ts`: Route, responsive, expense lifecycle, keyboard, theme and editor smoke tests.

Routes and initial data are Server Components. Interactive sections are Client Components. Charts are lightweight native SVG/CSS with no chart dependency or external assets. Native modal dialogs provide focus containment, Escape handling and focus restoration.

## Demo behavior

The reference date is **7 September 2026** so the demo stays deterministic. All displayed spending and category/budget usage derives from the same transaction state. Changes survive client-side navigation but reset on refresh. Currency is INR; locale affects formatting without pretending to convert values.

Desktop uses a flat sidebar; tablet has an icon rail; mobile has Home, Activity, Add, Insights and More bottom navigation with safe-area spacing. Expense entry becomes a full-screen mobile sheet with a sticky save action. Light, Dark and System themes are session-only; System follows operating-system appearance changes.

Quick entry recognizes simple demo patterns such as `450 uber`, `320 dinner` and `1200 clothes`. It uses deterministic local string matching, not AI. Optional receipt selection retains the filename only, and split details show each person's share without changing the original expense total. Recurring entries represent schedules and never create transactions automatically. Budget carry-forward and start-screen settings are captured as preferences for later integration.

Import, export, CSV and delete-all controls are explicitly preview-only. Their dialogs do not read/write expense data. Future integrations can connect those handlers in `components/settings.tsx`.

## Verification

Production build and ESLint pass. All 11 Playwright tests pass, covering every route, expense creation/edit/duplicate/delete, keyboard search, light/dark themes, category and budget creation, recurring pause, calendar navigation, and quick entry. Layouts were checked at 320, 375, 390, 430, 768, 1024 and 1440 pixels with no horizontal overflow. Browser checks report no hydration or runtime errors. Visual previews are in `docs/previews/`.
