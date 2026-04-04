# Global Search

`global-search` is a React command palette package built around a single app-level provider.

It gives you:

- one modal mounted once at the app entry point
- standalone trigger components you can place anywhere
- hooks for opening the palette imperatively
- hooks for reacting to selected actions inside feature modules
- local or async search across actions, records, menu items, and recent searches

## Install

```bash
npm install global-search
```

Import the package styles once in your app entry:

```tsx
import 'global-search/styles.css';
```

## Recommended setup

Wrap your app with `GlobalSearchProvider`.

```tsx
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  GlobalSearchProvider,
  type GlobalSearchAction,
  type GlobalSearchMenuItem,
  type GlobalSearchRecord,
  type GlobalSearchRecentSearch,
  type GlobalSearchScope,
} from 'global-search';

const scopes: GlobalSearchScope[] = [
  {
    id: 'payments',
    label: 'Payments',
    description: 'Send money, review transfers, and manage cards.',
    icon: Wallet,
    keywords: ['money', 'transfer', 'card'],
  },
  {
    id: 'requests',
    label: 'Requests',
    description: 'Track reimbursements and funding requests.',
    icon: Receipt,
    keywords: ['approval', 'request', 'reimbursement'],
  },
];

const actions: GlobalSearchAction[] = [
  {
    id: 'ask-ai',
    title: 'Ask AI',
    description: 'Ask a product or finance question.',
    icon: Sparkles,
    shortcut: 'mod+q',
    pinned: true,
  },
  {
    id: 'create-card',
    title: 'Create card',
    description: 'Issue a new virtual card for team spend.',
    icon: CreditCard,
    scopeId: 'payments',
    shortcut: 'mod+d',
  },
];

const menuItems: GlobalSearchMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview of balances, activity, and approvals.',
    icon: LayoutDashboard,
    scopeId: 'payments',
  },
  {
    id: 'accounts',
    label: 'Accounts',
    description: 'Inspect wallets and linked bank accounts.',
    icon: Building2,
    scopeId: 'payments',
  },
];

const records: GlobalSearchRecord[] = [
  {
    id: 'req-001',
    title: 'Design team reimbursement',
    description: 'Figma and workshop expenses for March sprint.',
    scopeId: 'requests',
    entity: 'Request',
    amount: '$420.00',
    timestamp: '2 hours ago',
    status: { label: 'Pending', tone: 'amber' },
    tags: ['Request'],
  },
];

const recentSearches: GlobalSearchRecentSearch[] = [
  {
    id: 'recent-001',
    label: 'Virtual cards',
    description: 'Quick access to card management results.',
    query: 'virtual card',
    scopeId: 'payments',
    timestamp: 'Just now',
  },
];

export function AppRoot() {
  return (
    <GlobalSearchProvider
      scopes={scopes}
      actions={actions}
      menuItems={menuItems}
      records={records}
      recentSearches={recentSearches}
      onSelect={(selection) => {
        console.log('selected', selection);
      }}
    >
      <App />
    </GlobalSearchProvider>
  );
}
```

The provider renders the modal once and exposes a shared search API to the rest of the tree.

## Open the modal anywhere

Use `GlobalSearchTrigger` when you want a drop-in button:

```tsx
import { GlobalSearchTrigger } from 'global-search';

export function HeaderSearchButton() {
  return (
    <GlobalSearchTrigger className="search-trigger">
      Search everything
    </GlobalSearchTrigger>
  );
}
```

Use `useGlobalSearch()` when you need imperative control:

```tsx
import { useGlobalSearch } from 'global-search';

export function BudgetActions() {
  const { open } = useGlobalSearch();

  return (
    <button onClick={() => open({ scopeId: 'budgets', query: 'marketing' })}>
      Open budget search
    </button>
  );
}
```

Available methods:

- `open(options?)`
- `close()`
- `toggle(options?)`
- `isOpen`

Open options:

- `query`
- `scopeId`
- `browseMode`

## React to selected actions in features

Use `useGlobalSearchAction()` inside any feature that needs to respond to a search action without prop drilling.

```tsx
import { useGlobalSearchAction } from 'global-search';

export function RequestFundsFeature() {
  useGlobalSearchAction('request-funds', () => {
    // launch your feature flow here
  });

  return null;
}
```

For broader subscriptions, use `useGlobalSearchListener()`:

```tsx
import { useGlobalSearchListener } from 'global-search';

export function SearchAnalytics() {
  useGlobalSearchListener(
    (selection) => {
      console.log(selection.kind, selection.item.id);
    },
    { kinds: ['action', 'menu'] }
  );

  return null;
}
```

Listener filters:

- `kinds`
- `actionIds`
- `when`

## Async search

If your results should come from an API, pass `onSearch` to the provider.

```tsx
<GlobalSearchProvider
  scopes={scopes}
  onSearch={async ({ query, scopeId, apiKey }) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, scopeId }),
    });

    return response.json();
  }}
  apiKey={token}
>
  <App />
</GlobalSearchProvider>
```

## Low-level component

`GlobalSearch` is still exported if you want to mount and control the modal yourself.

```tsx
import { GlobalSearch } from 'global-search';

<GlobalSearch
  scopes={scopes}
  actions={actions}
  menuItems={menuItems}
  records={records}
  recentSearches={recentSearches}
  open={open}
  onOpenChange={setOpen}
/>
```

The provider API is the recommended public integration for app-wide usage.

## Package output

`npm run build` produces:

- `dist/index.js`
- `dist/index.cjs`
- `dist/index.d.ts`
- `dist/styles.css`

## Local development

- `npm run dev` starts the demo app
- `npm run check` runs Biome
- `npm run build` builds the library bundle
- `npm run build:demo` builds the demo app
