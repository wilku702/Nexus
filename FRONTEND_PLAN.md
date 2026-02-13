# Nexus: Frontend Implementation Plan

> Complete blueprint for building the React frontend — from architecture to pixel-level decisions.

---

## Table of Contents

1. [Information Architecture & Navigation](#1-information-architecture--navigation)
2. [User Flows](#2-user-flows)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Project Structure](#4-project-structure)
5. [TypeScript Type System](#5-typescript-type-system)
6. [API Layer](#6-api-layer)
7. [State Management (Zustand)](#7-state-management-zustand)
8. [Custom Hooks](#8-custom-hooks)
9. [Routing](#9-routing)
10. [Layout System](#10-layout-system)
11. [Component Architecture](#11-component-architecture)
12. [Styling Strategy & Design Tokens](#12-styling-strategy--design-tokens)
13. [Page-by-Page Implementation Details](#13-page-by-page-implementation-details)
14. [Accessibility](#14-accessibility)
15. [Responsive Strategy](#15-responsive-strategy)
16. [Implementation Order](#16-implementation-order)
17. [Dependency Map](#17-dependency-map)

---

## 1. Information Architecture & Navigation

### Navigation Model: Sidebar + Top Header

The app uses a persistent left sidebar for navigation and a top header for global controls. This gives each major view its own route while keeping role/health status always visible.

```
┌──────────────────────────────────────────────────────────────┐
│  Header: [NEXUS]                    [●DB ●LLM]  [Role ▼]    │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │          Page Content (<Outlet />)                │
│          │                                                   │
│ 💬 Chat  │                                                   │
│ 📁 Catalog│                                                  │
│ 📊 Evals │                                                   │
│ 📋 Audit │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### Page Hierarchy

| Route | Page | Description |
|-------|------|-------------|
| `/` | redirect | Redirects to `/chat` |
| `/chat` | ChatPage | Natural language Q&A — **default/primary** route |
| `/catalog` | CatalogPage | Table & column browser with governance info |
| `/eval` | EvalPage | Evaluation dashboard with metrics & charts |
| `/audit` | AuditPage | Query audit log viewer |

**Design rationale:** `/chat` is the default because non-technical business users — the primary persona — should land directly on the conversational interface. Catalog, Evaluations, and Audit are secondary views for analysts and admins.

---

## 2. User Flows

### Flow 1: Business User Asks a Question (Primary)

```
Land on /chat
  → See empty state with suggested example questions
  → Type question in bottom input bar
  → Press Enter or click Send
  → User message bubble appears immediately (optimistic)
  → Typing indicator shows ("Thinking...")
  → Assistant response card appears with:
      - Natural language answer (primary, prominent)
      - Collapsible SQL panel (collapsed by default)
      - Tables-used citation chips
      - Latency badge
  → User can ask follow-up questions
```

**Key decision:** SQL panel is **collapsed by default**. Business users don't care about SQL. Analysts/admins expand it on demand.

### Flow 2: Analyst Browses the Catalog

```
Click [Catalog] in sidebar
  → See table list (left panel) with governance badges
  → Click a table row
  → Right panel shows table detail: description, owner, governance level
  → Column table below: name, type, description, PII badge, sample values
  → PII columns have visual accent (rose left-border)
```

### Flow 3: Admin Runs Evaluations

```
Click [Evaluations] in sidebar
  → See latest eval results (or empty state if none)
  → Click [Run Evaluation] button
  → Button shows loading state (eval takes 30-120 seconds)
  → Results appear in-place:
      - Summary metric cards (pass rate, latency, governance compliance)
      - Difficulty breakdown bar chart
      - Expandable test case table
```

### Flow 4: Admin Reviews Audit Log

```
Click [Audit Log] in sidebar
  → See paginated table of all queries, newest first
  → Filter by: role, date range, PII filtered status
  → Sort by any column (especially latency to find slow queries)
  → Click a row → modal shows full SQL and metadata
```

### Flow 5: Role Switch (Cross-Cutting)

```
User clicks role toggle in header (any page)
  → Switches between Analyst and Admin
  → Affects all subsequent API calls
  → If on Chat page: banner updates to reflect role
  → Persisted in localStorage across sessions
```

---

## 3. Tech Stack & Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3 | UI framework |
| `react-dom` | ^18.3 | DOM renderer |
| `react-router-dom` | ^6.26 | Client-side routing |
| `zustand` | ^4.5 | State management |
| `typescript` | ^5.5 | Type safety |
| `vite` | ^5.4 | Build tool & dev server |
| `tailwindcss` | ^3.4 | Utility-first CSS |

### UI Libraries

| Package | Purpose |
|---------|---------|
| `react-syntax-highlighter` | SQL code highlighting in chat & modals |
| `recharts` | Bar charts in evaluation dashboard |
| `lucide-react` | Consistent SVG icon set (tree-shakable) |
| `clsx` | Conditional class name composition |
| `tailwind-merge` | Resolve Tailwind class conflicts in reusable components |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `@vitejs/plugin-react` | Vite React plugin |
| `autoprefixer` | PostCSS vendor prefixing |
| `postcss` | CSS processing |
| `@types/react` | React type definitions |
| `@types/react-dom` | ReactDOM type definitions |
| `@types/react-syntax-highlighter` | Syntax highlighter types |

**No heavy libraries needed:** No form library (forms are simple enough for controlled state), no date library (native `<input type="date">` suffices), no table library (custom generic `Table` component covers all cases).

---

## 4. Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── package.json
└── src/
    ├── main.tsx                        # React entry point
    ├── App.tsx                         # Router + route definitions
    ├── vite-env.d.ts
    │
    ├── types/
    │   ├── api.ts                      # All API request/response interfaces
    │   ├── store.ts                    # Zustand store state shapes
    │   └── common.ts                   # Shared enums & utility types
    │
    ├── api/
    │   ├── client.ts                   # Base fetch wrapper with error handling
    │   ├── chat.ts                     # POST /api/chat
    │   ├── catalog.ts                  # GET /api/catalog/tables, /tables/:name
    │   ├── health.ts                   # GET /api/health
    │   ├── audit.ts                    # GET /api/audit
    │   └── evaluate.ts                 # POST /api/evaluate, GET /api/evaluate/results
    │
    ├── stores/
    │   ├── useAppStore.ts              # Role, health, global UI state
    │   ├── useChatStore.ts             # Message history, loading state
    │   ├── useCatalogStore.ts          # Table list, selected table detail
    │   ├── useAuditStore.ts            # Audit entries, filters, pagination
    │   └── useEvalStore.ts             # Eval results, running state
    │
    ├── hooks/
    │   ├── useHealth.ts                # Polls /api/health on interval
    │   ├── useAutoScroll.ts            # Auto-scrolls chat to bottom
    │   └── useDebounce.ts              # Debounce for filter inputs
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx            # Root layout: sidebar + header + <Outlet />
    │   │   ├── Header.tsx              # App name, RoleSwitcher, HealthIndicator
    │   │   ├── Sidebar.tsx             # Nav links with icons + active state
    │   │   └── PageWrapper.tsx         # Consistent page title + padding
    │   │
    │   ├── shared/
    │   │   ├── Badge.tsx               # Universal pill badge (governance, PII, status, etc.)
    │   │   ├── Button.tsx              # Primary/secondary/ghost variants
    │   │   ├── Card.tsx                # Surface container with optional title
    │   │   ├── LoadingSpinner.tsx      # Animated spinner, size variants
    │   │   ├── ErrorBanner.tsx         # Dismissible error message bar
    │   │   ├── EmptyState.tsx          # Zero-data placeholder with icon + CTA
    │   │   ├── MetricCard.tsx          # Single KPI: number + label + color
    │   │   ├── Table.tsx               # Generic sortable/paginated table
    │   │   └── Tooltip.tsx             # Hover tooltip wrapper
    │   │
    │   ├── chat/
    │   │   ├── ChatWindow.tsx          # Chat page root — wires store + API
    │   │   ├── MessageList.tsx         # Scrollable message container
    │   │   ├── UserMessage.tsx         # Right-aligned user question bubble
    │   │   ├── AssistantMessage.tsx    # Left-aligned answer card + metadata
    │   │   ├── SqlBlock.tsx            # Syntax-highlighted SQL + copy button
    │   │   ├── TablesUsedPill.tsx      # Row of table name chips
    │   │   ├── LatencyBadge.tsx        # Formatted latency display
    │   │   ├── ChatInput.tsx           # Textarea + send button (fixed bottom)
    │   │   └── TypingIndicator.tsx     # Animated "thinking" dots
    │   │
    │   ├── catalog/
    │   │   ├── CatalogBrowser.tsx      # Catalog page root — two-panel layout
    │   │   ├── TableList.tsx           # Left panel: scrollable table list
    │   │   ├── TableListItem.tsx       # Single table row
    │   │   ├── TableDetail.tsx         # Right panel: table + column detail
    │   │   ├── ColumnRow.tsx           # Single column with all metadata
    │   │   ├── GovernanceBadge.tsx     # public/internal/restricted badge
    │   │   ├── PiiBadge.tsx            # "PII" red badge (renders null if not PII)
    │   │   └── SampleValues.tsx        # Inline sample value code chips
    │   │
    │   ├── eval/
    │   │   ├── EvalDashboard.tsx       # Eval page root
    │   │   ├── EvalSummaryCards.tsx    # Row of KPI metric cards
    │   │   ├── DifficultyBreakdown.tsx # Recharts bar chart: easy/med/hard
    │   │   ├── TestCaseTable.tsx       # Expandable test case results table
    │   │   ├── TestCaseRow.tsx         # Single test case with expand toggle
    │   │   ├── RunEvalButton.tsx       # Triggers POST /api/evaluate
    │   │   └── EvalStatusBanner.tsx    # Running/complete/error banner
    │   │
    │   └── audit/
    │       ├── AuditLogViewer.tsx      # Audit page root
    │       ├── AuditFilters.tsx        # Role, date, PII filter controls
    │       ├── AuditTable.tsx          # Sortable/paginated log table
    │       ├── AuditRow.tsx            # Single log entry row
    │       └── SqlPreviewModal.tsx     # Modal showing full SQL on row click
    │
    └── pages/
        ├── ChatPage.tsx                # Wraps ChatWindow in PageWrapper
        ├── CatalogPage.tsx             # Wraps CatalogBrowser in PageWrapper
        ├── EvalPage.tsx                # Wraps EvalDashboard in PageWrapper
        └── AuditPage.tsx               # Wraps AuditLogViewer in PageWrapper
```

---

## 5. TypeScript Type System

### `src/types/common.ts` — Shared Enums & Utility Types

```typescript
export type UserRole = 'analyst' | 'admin';
export type GovernanceLevel = 'public' | 'internal' | 'restricted';
export type GovernanceTag = 'public' | 'pii' | 'sensitive';
export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T extends string = string> {
  column: T;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}
```

### `src/types/api.ts` — API Request/Response Contracts

```typescript
import type { GovernanceLevel, GovernanceTag, HealthStatus, Difficulty, UserRole } from './common';

// ── Chat ──────────────────────────────────────────────

export interface ChatRequest {
  question: string;
  role: UserRole;
}

export interface ChatResponse {
  answer: string;
  sql: string;
  tables_used: string[];
  latency_ms: number;
}

// ── Catalog ───────────────────────────────────────────

export interface TableSummary {
  table_name: string;
  description: string;
  owner: string;
  governance_level: GovernanceLevel;
  column_count: number;
}

export interface ColumnMetadata {
  column_name: string;
  data_type: string;
  description: string;
  is_pii: boolean;
  sample_values: string[];
  governance_tag: GovernanceTag;
}

export interface TableDetail extends TableSummary {
  columns: ColumnMetadata[];
}

// ── Health ────────────────────────────────────────────

export interface HealthResponse {
  status: HealthStatus;
  database: string;
  llm: string;
}

// ── Audit ─────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_role: UserRole;
  original_question: string;
  generated_sql: string;
  was_pii_filtered: boolean;
  result_row_count: number;
  latency_ms: number;
  llm_model_used: string;
}

// ── Evaluate ──────────────────────────────────────────

export interface EvalSummary {
  total_tests: number;
  passed: number;
  failed: number;
  pass_rate: number;
  avg_latency_ms: number;
  governance_compliance_rate: number;
}

export interface DifficultyResult {
  total: number;
  passed: number;
  pass_rate: number;
}

export interface TestCaseResult {
  question: string;
  difficulty: Difficulty;
  generated_sql: string;
  sql_correct: boolean;
  sql_accuracy: number;
  answer_accuracy: number;
  latency_ms: number;
  governance_compliant: boolean;
  passed: boolean;
}

export interface EvalReport {
  run_id: string;
  timestamp: string;
  summary: EvalSummary;
  by_difficulty: Record<Difficulty, DifficultyResult>;
  test_cases: TestCaseResult[];
}

// ── Errors ────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}
```

### `src/types/store.ts` — Zustand Store Shapes

```typescript
import type { UserRole, HealthStatus, SortConfig, PaginationConfig } from './common';
import type { ChatResponse, TableSummary, TableDetail, AuditLogEntry, EvalReport } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  response?: ChatResponse;    // only on assistant messages
  isError?: boolean;
}

export interface AuditFilters {
  role: UserRole | 'all';
  piiFiltered: boolean | null;
  dateFrom: string;
  dateTo: string;
}

// Individual store state interfaces defined in each store file
```

---

## 6. API Layer

### Base Client — `src/api/client.ts`

```typescript
const BASE_URL = '/api';

export class NexusApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(err: { status: number; message: string; detail?: string }) {
    super(err.message);
    this.status = err.status;
    this.detail = err.detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new NexusApiError({
      status: res.status,
      message: body.message ?? `HTTP ${res.status}`,
      detail: body.detail,
    });
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<T>(res);
}

export async function apiPost<TBody, TResponse>(path: string, body: TBody): Promise<TResponse> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<TResponse>(res);
}
```

### Endpoint Modules

Each is a thin typed wrapper — one function per endpoint:

| File | Function | Endpoint |
|------|----------|----------|
| `api/chat.ts` | `sendChatMessage(req)` | `POST /api/chat` |
| `api/catalog.ts` | `fetchTables()` | `GET /api/catalog/tables` |
| `api/catalog.ts` | `fetchTableDetail(name)` | `GET /api/catalog/tables/:name` |
| `api/health.ts` | `fetchHealth()` | `GET /api/health` |
| `api/audit.ts` | `fetchAuditLog()` | `GET /api/audit` |
| `api/evaluate.ts` | `runEvaluation()` | `POST /api/evaluate` |
| `api/evaluate.ts` | `fetchEvalResults()` | `GET /api/evaluate/results` |

---

## 7. State Management (Zustand)

### Store Overview

| Store | State | Key Actions |
|-------|-------|-------------|
| `useAppStore` | `currentRole`, `healthStatus`, `databaseStatus`, `llmStatus` | `setRole()`, `setHealth()` |
| `useChatStore` | `messages[]`, `isLoading`, `error` | `addUserMessage()`, `addAssistantMessage()`, `setLoading()`, `clearMessages()` |
| `useCatalogStore` | `tables[]`, `selectedTable`, `isLoadingList`, `isLoadingDetail` | `setTables()`, `setSelectedTable()` |
| `useAuditStore` | `entries[]`, `filters`, `sort`, `pagination` | `setEntries()`, `setFilters()`, `setSort()`, `setPage()` |
| `useEvalStore` | `report`, `isRunning`, `error` | `setReport()`, `setRunning()`, `setError()` |

### Key Design Decisions

- **`currentRole` lives in `useAppStore`** — single source of truth read by all other stores and components
- **`currentRole` is persisted** in `localStorage` via Zustand's `persist` middleware (page refresh preserves selected role)
- **Health data is never persisted** — always fresh from the polling hook
- **Local UI state** (expanded rows, modal open/close) lives in component `useState`, NOT in Zustand
- **Chat messages use optimistic UI** — user message appears instantly before API call completes

---

## 8. Custom Hooks

### `useHealth` — Health Status Polling

Polls `GET /api/health` every 30 seconds. Called once in `AppShell` so polling runs for the entire app lifetime. Updates `useAppStore.setHealth()`.

### `useAutoScroll` — Chat Auto-Scroll

Returns a `ref` to attach to the scrollable `MessageList` container. Scrolls to bottom when `messages.length` or `isLoading` changes.

### `useDebounce` — Filter Input Debounce

Generic debounce hook for audit log filter inputs. Prevents excessive re-renders during typing.

---

## 9. Routing

**`src/App.tsx`** — React Router v6

```
<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppShell />}>
      <Route index element={<Navigate to="/chat" replace />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="eval" element={<EvalPage />} />
      <Route path="audit" element={<AuditPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

All routes render inside `AppShell`, so the sidebar and header persist across navigation.

---

## 10. Layout System

### AppShell Structure

```
┌──────────────────────────────────────────────────────┐
│  Header (h-14, full-width, bg-white, border-bottom)  │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Main content area                        │
│ (w-60)   │  (flex-1, overflow-y-auto, bg-slate-50)   │
│ bg-slate │                                           │
│ -900     │  <PageWrapper>                            │
│          │    <h1> Page Title                        │
│          │    {children}                             │
│          │  </PageWrapper>                           │
│          │                                           │
└──────────┴───────────────────────────────────────────┘
```

- **Header:** Fixed top, `z-10`, contains app name (left), health indicator (center-right), role switcher (right)
- **Sidebar:** Fixed left, `w-60` (240px), dark background (`bg-slate-900`), nav items with `lucide-react` icons, active state highlight
- **Main area:** `flex-1`, scrollable, light background (`bg-slate-50`)
- **PageWrapper:** Applies consistent `max-w-7xl mx-auto px-6 py-8` and renders page `<h1>` title

---

## 11. Component Architecture

### 11.1 Shared Components

#### `Badge` — Universal Colored Pill

```typescript
type BadgeVariant =
  | 'governance-public' | 'governance-internal' | 'governance-restricted'
  | 'tag-pii' | 'tag-sensitive' | 'tag-public'
  | 'status-healthy' | 'status-degraded' | 'status-down'
  | 'difficulty-easy' | 'difficulty-medium' | 'difficulty-hard'
  | 'role-analyst' | 'role-admin'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}
```

Every colored chip in the entire app routes through this single component.

#### `Table` — Generic Sortable Table

```typescript
interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[];
  data: T[];
  onSort?: (column: string) => void;
  sortConfig?: SortConfig;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

Handles loading skeleton rows, sort chevrons, and empty state. Used by `AuditTable` and `TestCaseTable`.

#### `MetricCard` — Single KPI Display

```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
}
```

### 11.2 Chat Components

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `ChatWindow` | none (reads stores) | Page root. Wires API calls + store dispatches |
| `MessageList` | `messages`, `isLoading` | Scrollable container, renders messages + typing indicator |
| `UserMessage` | `content`, `timestamp` | Right-aligned blue bubble |
| `AssistantMessage` | `content`, `response?`, `isError?`, `timestamp` | Left-aligned card: answer + metadata + collapsible SQL |
| `SqlBlock` | `sql` | `react-syntax-highlighter` with `vscDarkPlus` theme + copy button |
| `TablesUsedPill` | `tables` | Row of grey chips showing table names |
| `LatencyBadge` | `latencyMs` | Formatted latency (green <2s, yellow 2-5s, red >5s) |
| `ChatInput` | `onSubmit`, `isDisabled` | Textarea (Enter to send, Shift+Enter for newline) + send button |
| `TypingIndicator` | none | Three animated dots with staggered CSS keyframes |

### 11.3 Catalog Components

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `CatalogBrowser` | none (reads stores) | Two-panel layout, fetches data on mount |
| `TableList` | `tables`, `selectedTableName`, `onSelect`, `isLoading` | Scrollable left panel, skeleton during load |
| `TableListItem` | `table`, `isSelected`, `onClick` | Name + description + governance badge + column count |
| `TableDetail` | `table`, `isLoading` | Right panel: header info + column table |
| `ColumnRow` | `column` | `<tr>`: name (mono), type, description, PII badge, samples |
| `GovernanceBadge` | `level` | Thin wrapper around `Badge` for governance levels |
| `PiiBadge` | `isPii` | Returns `Badge variant="tag-pii"` or `null` |
| `SampleValues` | `values` | Inline `<code>` chips (max 3 shown) |

### 11.4 Evaluation Components

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `EvalDashboard` | none (reads stores) | Page root, fetches results on mount |
| `EvalSummaryCards` | `summary` | Grid of 5-6 `MetricCard` components |
| `DifficultyBreakdown` | `byDifficulty` | `recharts` stacked bar chart (easy/med/hard) |
| `TestCaseTable` | `testCases` | Expandable table, click row to see SQL |
| `TestCaseRow` | `testCase`, `isExpanded`, `onToggle` | Pass/fail icon, difficulty badge, metrics |
| `RunEvalButton` | `onRun`, `isRunning` | Primary CTA with loading spinner state |
| `EvalStatusBanner` | `isRunning`, `report`, `error` | Info/success/error banner |

### 11.5 Audit Components

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `AuditLogViewer` | none (reads stores) | Page root, fetches + applies client-side filtering |
| `AuditFilters` | `filters`, `onChange` | Role dropdown, date pickers, PII toggle, reset button |
| `AuditTable` | `entries`, `sort`, `onSort`, `pagination`, `onPageChange`, `isLoading` | Uses shared `Table`, footer pagination |
| `AuditRow` | `entry` | Timestamp, role badge, question, PII icon, latency |
| `SqlPreviewModal` | `entry`, `onClose` | Accessible modal with full SQL + metadata grid |

---

## 12. Styling Strategy & Design Tokens

### Tailwind Configuration

```typescript
// tailwind.config.ts — key extensions
{
  extend: {
    colors: {
      governance: {
        public:     { bg: '#dcfce7', text: '#166534' },  // green
        internal:   { bg: '#dbeafe', text: '#1e40af' },  // blue
        restricted: { bg: '#fee2e2', text: '#991b1b' },  // red
      },
      tag: {
        pii:       { bg: '#fef2f2', text: '#dc2626' },   // red/rose
        sensitive: { bg: '#fff7ed', text: '#c2410c' },    // amber
        public:    { bg: '#f0fdf4', text: '#16a34a' },    // green
      },
      status: {
        healthy:  '#22c55e',   // green
        degraded: '#f59e0b',   // yellow
        down:     '#ef4444',   // red
      },
      difficulty: {
        easy:   { bg: '#f0fdf4', text: '#16a34a' },  // green
        medium: { bg: '#fef9c3', text: '#854d0e' },   // yellow
        hard:   { bg: '#fef2f2', text: '#dc2626' },   // red
      }
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    }
  }
}
```

### Badge Color Mapping

```typescript
const BADGE_CLASSES: Record<BadgeVariant, string> = {
  'governance-public':     'bg-green-100 text-green-800 border-green-200',
  'governance-internal':   'bg-blue-100 text-blue-800 border-blue-200',
  'governance-restricted': 'bg-red-100 text-red-800 border-red-200',
  'tag-pii':               'bg-red-50 text-red-700 border-red-200 font-semibold',
  'tag-sensitive':         'bg-orange-50 text-orange-700 border-orange-200',
  'tag-public':            'bg-green-50 text-green-700 border-green-200',
  'status-healthy':        'bg-green-100 text-green-800',
  'status-degraded':       'bg-yellow-100 text-yellow-800',
  'status-down':           'bg-red-100 text-red-800',
  'difficulty-easy':       'bg-green-50 text-green-700',
  'difficulty-medium':     'bg-yellow-50 text-yellow-700',
  'difficulty-hard':       'bg-red-50 text-red-700',
  'role-analyst':          'bg-purple-100 text-purple-800',
  'role-admin':            'bg-indigo-100 text-indigo-800',
  'neutral':               'bg-neutral-100 text-neutral-600',
};
```

### Visual Language

| Element | Style |
|---------|-------|
| Body font | Inter (system fallback) |
| Code font | JetBrains Mono / Fira Code |
| Sidebar | `bg-slate-900`, nav items `text-slate-300`, active `text-white bg-slate-700` |
| Header | `bg-white border-b border-slate-200` |
| Main background | `bg-slate-50` |
| Cards/panels | `bg-white rounded-lg border border-slate-200 shadow-sm` |
| Primary button | `bg-blue-600 hover:bg-blue-700 text-white` |
| User message bubble | Right-aligned, `bg-blue-600 text-white rounded-2xl` |
| Assistant message | Left-aligned, `bg-white border border-slate-200 rounded-lg shadow-sm` |

### Dark Mode

Deferred to a later iteration. The token system and Badge component make this a systematic migration when needed. Add `darkMode: 'class'` to Tailwind config and toggle via header.

---

## 13. Page-by-Page Implementation Details

### 13.1 Chat Page

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│     [Empty state / scrollable messages]              │
│                                                      │
│     ┌──────────────────────────────────────┐         │
│     │ USER: How many customers in Brazil?  │  ●      │
│     └──────────────────────────────────────┘         │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ NEXUS: There are 5 customers in Brazil.        │  │
│  │                                                │  │
│  │ [▶ Show SQL]   Customer   1.2s                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [Ask anything about your data...]       [Send ▶]   │
└──────────────────────────────────────────────────────┘
```

**SQL Syntax Highlighting:** `react-syntax-highlighter` with Prism renderer, `vscDarkPlus` theme, SQL language. Dark code block. Single-line SQL uses horizontal scroll; multi-line has max-height ~200px with overflow.

**Auto-scroll:** `useAutoScroll` hook with dependency on `[messages.length, isLoading]`.

**Loading indicator:** `TypingIndicator` with three dots using staggered CSS keyframes:
```css
@keyframes typing-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
```

**Empty state:** Centered hero with:
- "Ask anything about your data"
- "Powered by the Chinook music database"
- 3-4 clickable suggested question chips that pre-fill (not auto-submit) the input

**Role-aware banner:** Above chat input — yellow for Analyst ("PII columns will be masked"), blue for Admin ("Full access enabled").

**Submit flow:**
1. `addUserMessage(text)` — optimistic, appears instantly
2. `setLoading(true)` — typing indicator appears
3. `await sendChatMessage({ question, role: currentRole })`
4. `addAssistantMessage(response)` or `setError(message)`
5. `setLoading(false)`

### 13.2 Catalog Page

**Layout:** Two-panel split — `grid-cols-[320px_1fr]`

Left panel scrolls independently (`overflow-y-auto`). Selecting a table triggers `fetchTableDetail(name)`.

**Table list items show:** table name (bold), description (1-line truncated), governance badge, column count.

**Active table:** Left blue border accent + light blue background.

**Column table:** Sticky header, alternating row backgrounds (`even:bg-slate-50`), `font-mono` on column name cell. PII columns have a 3px rose left-border accent.

**Empty detail state:** "Select a table to view its schema"

### 13.3 Evaluation Dashboard

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Evaluations                    [▶ Run Evaluation]    │
│  Last run: Feb 27, 2026 at 15:00                      │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Pass Rate│  │Avg Latency│ │Governance │            │
│  │  72%     │  │  1.85s    │ │  100%     │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                       │
│  Pass Rate by Difficulty (stacked bar chart)          │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Easy   ████████████████████ 100%                 │ │
│  │ Medium ████████████████░░░░  83%                 │ │
│  │ Hard   ███████░░░░░░░░░░░░░  33%                │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Test Cases (expandable table)                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │ ✓ easy   How many customers?          0.98s     │ │
│  │ ✓ medium Which artist has most albums? 1.4s     │ │
│  │ ✗ hard   Revenue by country 2013      3.2s     │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Chart:** `recharts` `BarChart` with `ResponsiveContainer`. Data: 3 grouped bars (easy/medium/hard). Stacked: passed (green) + failed (red). Reference line at 80% (target threshold, dashed yellow).

**MetricCard highlight rules:**

| Card | Green | Yellow | Red |
|------|-------|--------|-----|
| Pass Rate | >= 80% | 60-80% | < 60% |
| Avg Latency | < 2s | 2-5s | > 5s |
| Governance | 100% | — | < 100% |

**Test case expansion:** Local `useState<string | null>` tracks `expandedRowId`. Click toggles. Expanded area shows `SqlBlock` with generated SQL + score details.

**Run eval flow:** Button shows spinner + "Running..." text. POST may take 60-120s. On success, report replaces in-place.

### 13.4 Audit Log Page

**Layout:** Full-width data table with filter bar above.

**Filters:** Role dropdown (All/Analyst/Admin), Date From/To inputs, PII Filtered toggle (Any/Yes/No), Reset button.

**Table columns:** Timestamp, Role (badge), Question (truncated 80 chars), PII Filtered (lock icon amber for yes, grey dash for no), Row Count, Latency, Model.

**All filtering, sorting, and pagination is client-side** (data volume is small enough for Chinook).

**Sort logic:** Click column header toggles asc/desc. Default: timestamp desc.

**Pagination:** 25 rows per page. Footer: "Showing X-Y of Z entries", prev/next buttons.

**Row click:** Opens `SqlPreviewModal` with full question, SQL in `SqlBlock`, and metadata grid.

---

## 14. Accessibility

### Keyboard Navigation

- Chat input focused on page load (`useEffect` + `ref.focus()`)
- All nav tabs reachable via Tab, activated via Enter/Space
- SQL panel toggle is a real `<button>` element (not a styled div)
- Role switcher uses ARIA listbox pattern or native `<select>`
- Catalog table rows use `<a>` elements for proper navigation history
- Escape key closes modals

### ARIA Requirements

| Element | ARIA |
|---------|------|
| Typing indicator | `role="status"` + `aria-live="polite"` |
| Error messages | `role="alert"` + `aria-live="assertive"` |
| Health status dots | `aria-label="Database: connected"` (descriptive, not just color) |
| Badge elements | Text content readable by screen readers (never color-only) |
| Data tables | Proper `<table>`, `<thead>`, `<th scope="col">` (not divs) |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap |

### Color Contrast

- All badge text meets WCAG AA (4.5:1 for normal text)
- Muted secondary text (latency, citations) meets 3:1 ratio
- Governance level communicated via text AND color (never color alone)

### Focus Indicators

Use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500` — focus rings only appear for keyboard users, not mouse users.

---

## 15. Responsive Strategy

### Breakpoints (Tailwind Defaults)

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px (`sm`) | Sidebar collapses to bottom tab bar, tables become cards |
| Tablet | 640-1024px (`md`) | Sidebar icon-only mode, catalog single-column |
| Desktop | > 1024px (`lg`) | Full layout as designed |

### Per-Page Responsive Behavior

| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| **Chat** | Full-width messages, SQL expands as bottom sheet, bottom nav | Reduced padding | Max-width 780px centered |
| **Catalog** | Table list → single column. Click navigates to detail (back button). No split pane | Collapsible sidebar overlay | Full two-panel split |
| **Eval** | Stat cards stack vertically. Chart with min-height. Test cases as card-per-row | 3-col grid for cards | Full dashboard grid |
| **Audit** | Card-per-row format (each log as a card). SQL modal as bottom sheet | Full table layout | Full table layout |

### Navigation on Mobile

Top nav tabs become a **bottom tab bar** with icons + labels (Chat, Catalog, Evals, Audit). Role switcher and health indicator move to a settings overflow.

---

## 16. Implementation Order

Build in this sequence. Each phase produces a working, demo-able increment.

### Phase A — Foundation (Day 1)

| # | Task | Files |
|---|------|-------|
| 1 | Scaffold Vite + TypeScript + Tailwind | Config files |
| 2 | Install all dependencies | `package.json` |
| 3 | Write all types | `src/types/*` |
| 4 | Build API client + all 5 endpoint modules | `src/api/*` |
| 5 | Create all 5 Zustand stores | `src/stores/*` |
| 6 | Build layout: `AppShell`, `Header`, `Sidebar`, `PageWrapper` | `src/components/layout/*` |
| 7 | Set up routing in `App.tsx` | `src/App.tsx` |
| 8 | Build shared components: `Badge`, `Button`, `Card`, `EmptyState`, `LoadingSpinner` | `src/components/shared/*` |

### Phase B — Chat Page (Day 2) — *Highest value, build first*

| # | Task | Files |
|---|------|-------|
| 9 | Build `ChatInput` | `src/components/chat/ChatInput.tsx` |
| 10 | Build `UserMessage`, `TypingIndicator` | `src/components/chat/` |
| 11 | Build `SqlBlock` (verify syntax highlighting works) | `src/components/chat/SqlBlock.tsx` |
| 12 | Build `TablesUsedPill`, `LatencyBadge` | `src/components/chat/` |
| 13 | Build `AssistantMessage` (composes above) | `src/components/chat/AssistantMessage.tsx` |
| 14 | Build `MessageList` with `useAutoScroll` | `src/components/chat/MessageList.tsx` |
| 15 | Wire `ChatWindow` to store + API | `src/components/chat/ChatWindow.tsx` |
| 16 | Add `RoleSwitcher` in header + role banner in chat | `src/components/layout/Header.tsx` |

### Phase C — Catalog Page (Day 3)

| # | Task | Files |
|---|------|-------|
| 17 | Build `GovernanceBadge`, `PiiBadge`, `SampleValues` | `src/components/catalog/` |
| 18 | Build `TableListItem`, `TableList` with skeleton | `src/components/catalog/` |
| 19 | Build `ColumnRow`, `TableDetail` | `src/components/catalog/` |
| 20 | Wire `CatalogBrowser` to store + API | `src/components/catalog/CatalogBrowser.tsx` |

### Phase D — Shared Table + Audit Page (Day 4)

| # | Task | Files |
|---|------|-------|
| 21 | Build generic `Table` shared component | `src/components/shared/Table.tsx` |
| 22 | Build `AuditFilters` | `src/components/audit/AuditFilters.tsx` |
| 23 | Build `AuditRow`, `AuditTable` | `src/components/audit/` |
| 24 | Build `SqlPreviewModal` (a11y compliant) | `src/components/audit/SqlPreviewModal.tsx` |
| 25 | Wire `AuditLogViewer` + client-side filter/sort/pagination | `src/components/audit/AuditLogViewer.tsx` |

### Phase E — Evaluation Dashboard (Day 5)

| # | Task | Files |
|---|------|-------|
| 26 | Build `MetricCard`, `EvalSummaryCards` | `src/components/shared/`, `src/components/eval/` |
| 27 | Build `DifficultyBreakdown` with recharts | `src/components/eval/DifficultyBreakdown.tsx` |
| 28 | Build `TestCaseTable` with expandable rows | `src/components/eval/TestCaseTable.tsx` |
| 29 | Build `RunEvalButton`, `EvalStatusBanner` | `src/components/eval/` |
| 30 | Wire `EvalDashboard` to store + API | `src/components/eval/EvalDashboard.tsx` |

### Phase F — Polish (Day 6)

| # | Task | Files |
|---|------|-------|
| 31 | Build `HealthIndicator` with `useHealth` polling | `src/hooks/useHealth.ts`, Header |
| 32 | Add `ErrorBanner` to all pages | `src/components/shared/ErrorBanner.tsx` |
| 33 | Add empty states for all zero-data scenarios | All page components |
| 34 | Add keyboard navigation (Escape closes modal, Enter submits chat) | All interactive components |
| 35 | Add ARIA labels on all interactive elements | All components |
| 36 | Responsive breakpoints (sidebar collapse, table→card on mobile) | Layout + page components |

---

## 17. Dependency Map

```
App.tsx
  └─ AppShell.tsx
       ├─ Header.tsx
       │    ├─ useAppStore (currentRole, healthStatus)
       │    ├─ useHealth hook (polls /api/health)
       │    ├─ RoleSwitcher → useAppStore.setRole()
       │    └─ HealthIndicator → useAppStore.healthStatus
       │
       ├─ Sidebar.tsx (NavLinks with lucide-react icons)
       │
       └─ <Outlet />
            │
            ├─ ChatPage → ChatWindow
            │    ├─ useChatStore (messages, isLoading, error)
            │    ├─ useAppStore (currentRole)
            │    ├─ api/chat.ts → sendChatMessage()
            │    ├─ MessageList → UserMessage / AssistantMessage
            │    │    └─ AssistantMessage → SqlBlock, TablesUsedPill, LatencyBadge
            │    ├─ ChatInput
            │    └─ TypingIndicator
            │
            ├─ CatalogPage → CatalogBrowser
            │    ├─ useCatalogStore (tables, selectedTable)
            │    ├─ api/catalog.ts → fetchTables(), fetchTableDetail()
            │    ├─ TableList → TableListItem → GovernanceBadge
            │    └─ TableDetail → ColumnRow → PiiBadge, SampleValues, GovernanceBadge
            │
            ├─ EvalPage → EvalDashboard
            │    ├─ useEvalStore (report, isRunning)
            │    ├─ api/evaluate.ts → runEvaluation(), fetchEvalResults()
            │    ├─ EvalSummaryCards → MetricCard (shared)
            │    ├─ DifficultyBreakdown (recharts BarChart)
            │    ├─ TestCaseTable → TestCaseRow → SqlBlock
            │    ├─ RunEvalButton
            │    └─ EvalStatusBanner
            │
            └─ AuditPage → AuditLogViewer
                 ├─ useAuditStore (entries, filters, sort, pagination)
                 ├─ api/audit.ts → fetchAuditLog()
                 ├─ AuditFilters
                 ├─ AuditTable → Table (shared) → AuditRow
                 └─ SqlPreviewModal → SqlBlock
```

---

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

The `/api` proxy means all `fetch('/api/...')` calls in development are forwarded to Flask on port 5000. No CORS issues during development.

---

## Error Handling Strategy

### Three Error Categories

| Category | Display | Behavior |
|----------|---------|----------|
| **Query error** (agent can't generate SQL) | Agent message card with amber border | "I couldn't generate a valid query. Try rephrasing." |
| **Connection error** (backend unreachable) | Non-dismissable banner below header | Disable send button, show "Backend unavailable" in input area |
| **PII access notice** (analyst + restricted data) | Agent message with amber lock icon | "Results filtered for PII. Switch to Admin for full access." — This is expected behavior, not an error |

### Empty State Messages

| Page | Message | CTA |
|------|---------|-----|
| Chat (no messages) | "Ask anything about your data" + suggested questions | Click a question chip |
| Catalog (loading) | "Loading catalog metadata..." | None (spinner) |
| Catalog (no selection) | "Select a table to view its schema" | None |
| Eval (no runs) | "No evaluation runs yet" | "Run Evaluation" button |
| Audit (no entries) | "No queries logged yet. Start a conversation in Chat." | Link to /chat |

---

*This document is the single source of truth for the Nexus frontend implementation. Every file, component, type, and styling decision is specified above. Build in the order listed in Section 16.*
