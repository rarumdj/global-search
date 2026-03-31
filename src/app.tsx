import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  CircleDollarSign,
  Command,
  CreditCard,
  LayoutDashboard,
  MoveRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GlobalSearch,
  demoScopes,
  demoSearchData,
  type GlobalSearchSelection,
} from '@/lib/global-search';

const statCards = [
  {
    label: 'Searchable items',
    value: '28',
    detail: 'Actions, menu routes, records, and dashboard insights',
    icon: Sparkles,
  },
  {
    label: 'Keyboard shortcuts',
    value: '8',
    detail: 'Global shortcuts fire actions instantly from anywhere',
    icon: Command,
  },
  {
    label: 'Mock data sources',
    value: '4',
    detail: 'Payments, accounts, budgets, and requests are wired in',
    icon: CircleDollarSign,
  },
];

const overviewCards = [
  {
    label: 'Treasury coverage',
    value: 'NGN + USD',
    detail: 'Bank accounts, wallets, and statements appear in search.',
    icon: Wallet,
  },
  {
    label: 'Instant actions',
    value: 'Create + run',
    detail: 'Request funds, create a card, or hand off to AI.',
    icon: Zap,
  },
  {
    label: 'Guardrails ready',
    value: 'Scoped access',
    detail: 'Next step is swapping mock results for api-key backed permissions.',
    icon: ShieldCheck,
  },
];

function createActivityMessage(selection: GlobalSearchSelection) {
  switch (selection.kind) {
    case 'action':
      return {
        title: selection.item.title,
        description: `Shortcut or command action triggered from the search component.`,
      };
    case 'menu':
      return {
        title: selection.item.label,
        description: `Navigation target selected from the searchable menu index.`,
      };
    case 'record':
      return {
        title: selection.item.title,
        description: `${selection.item.entity} opened from mocked searchable dashboard data.`,
      };
    case 'recent':
      return {
        title: selection.item.label,
        description: `Recent query restored into the command palette.`,
      };
    case 'scope':
      return {
        title: selection.item.label,
        description: `Search narrowed to a specific workspace domain.`,
      };
  }
}

export default function App() {
  const nextActivityId = useRef(3);
  const [searchOpen, setSearchOpen] = useState(true);
  const [activity, setActivity] = useState([
    {
      id: 1,
      title: 'Command palette live',
      description: 'The demo opens by default so you can start testing immediately.',
    },
    {
      id: 2,
      title: 'Shortcuts enabled',
      description: 'Try Cmd/Ctrl + K, Q, R, A, P, D, S, or G.',
    },
  ]);

  const handleSelection = (selection: GlobalSearchSelection) => {
    const nextActivity = createActivityMessage(selection);
    setActivity((currentActivity) =>
      [{ id: nextActivityId.current++, ...nextActivity }, ...currentActivity].slice(0, 6)
    );
    toast.success(nextActivity.title, {
      description: nextActivity.description,
    });
  };

  const featuredRecords = demoSearchData.records?.slice(0, 4) ?? [];
  const sidebarItems = demoSearchData.menuItems?.slice(0, 8) ?? [];

  return (
    <div className="min-h-screen overflow-hidden bg-[#ece9e2] px-4 py-5 text-[#201f1c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(179,219,180,0.26),transparent_28%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1380px] gap-4 rounded-[34px] border border-white/75 bg-[rgba(246,244,238,0.86)] p-4 shadow-[0_32px_90px_rgba(27,25,20,0.18)] backdrop-blur-xl lg:grid-cols-[260px_minmax(0,1fr)_320px]"
      >
        <aside className="flex min-h-[760px] flex-col rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(244,242,236,0.98),rgba(237,234,227,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[28px] font-black tracking-[-0.05em]">Bujeti</div>
              <p className="text-sm text-[#7c796f]">Global search package playground</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full border border-[#e6e0d5] bg-white/70 text-[#737168]"
            >
              <Bell className="size-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mt-6 flex items-center justify-between rounded-[18px] border border-[#e5dfd4] bg-white px-4 py-3 text-left shadow-[0_16px_34px_rgba(36,31,23,0.08)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#f4f1ea]">
                <Sparkles className="size-4 text-[#5f5d54]" />
              </div>
              <div>
                <div className="text-sm font-semibold">Find anything</div>
                <div className="text-xs text-[#8b887e]">
                  Search menu, records, and actions
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-[#e2ddcf] bg-[#faf8f4] px-2 py-1 text-[11px] text-[#6d6a62]"
            >
              ⌘K
            </Badge>
          </button>

          <div className="mt-6 space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[#e9e6dc] text-[#23221d]'
                      : 'text-[#66645d] hover:bg-white/70'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {active ? (
                    <span className="rounded-full bg-[#daf199] px-2 py-0.5 text-[11px] font-semibold text-[#527500]">
                      30%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-auto rounded-[24px] border border-[#e4ddd0] bg-white/70 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="bg-[#e9efe5] text-[#546259] after:hidden">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-semibold">Adewale</div>
                <div className="text-xs text-[#8b887e]">Owner • The Bayt Company</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(248,246,241,0.98),rgba(242,239,233,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#8a867d]">
                Search-first dashboard demo
              </p>
              <h1 className="mt-1 text-[42px] font-semibold tracking-[-0.05em]">
                Welcome, <span className="text-[#a57d24]">Adewale!</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-[#ded7cb] bg-white/70 px-3 py-1 text-xs text-[#67655e]"
              >
                Reusable component surface
              </Badge>
              <Button
                variant="outline"
                className="rounded-full border-[#dfd8cb] bg-white px-4 text-[#43413b]"
                onClick={() => setSearchOpen(true)}
              >
                Open search
                <MoveRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[28px] border border-[#e4ddd0] bg-[linear-gradient(135deg,#fbfaf7,#efeadd)] p-5 shadow-[0_24px_50px_rgba(38,33,24,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="rounded-full bg-[#23211d] px-3 py-1 text-xs text-white">
                    Test harness
                  </Badge>
                  <h2 className="mt-4 text-[28px] font-semibold tracking-[-0.04em]">
                    Search everything your users can access
                  </h2>
                  <p className="mt-2 max-w-[40rem] text-sm leading-6 text-[#6d6a61]">
                    The component is already set up to search menu entries, actions, and
                    dashboard records from one surface. For now it uses mock results, but
                    the API key and resolver hook can replace that when you are ready.
                  </p>
                </div>

                <div className="hidden rounded-[24px] border border-[#e2dccf] bg-white/85 p-3 shadow-[0_20px_40px_rgba(39,33,23,0.08)] md:block">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Command className="size-4" />
                    Keyboard-first
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-[#726f66]">
                    <div>Cmd/Ctrl + K opens search</div>
                    <div>Cmd/Ctrl + R requests funds</div>
                    <div>Cmd/Ctrl + Q opens AI assist</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {statCards.map((card, index) => {
                  const Icon = card.icon;

                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.06 }}
                      className="rounded-[24px] border border-white/80 bg-white/75 p-4 shadow-[0_12px_30px_rgba(36,31,23,0.06)]"
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f5f2ec] text-[#4f4d46]">
                        <Icon className="size-5" />
                      </div>
                      <div className="mt-4 text-sm text-[#7d7a71]">{card.label}</div>
                      <div className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                        {card.value}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#8c897f]">
                        {card.detail}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e4ddd0] bg-white/72 p-5 shadow-[0_24px_50px_rgba(38,33,24,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#807d74]">Preview data</p>
                  <h2 className="text-xl font-semibold tracking-[-0.04em]">
                    Dashboard records in search
                  </h2>
                </div>
                <TrendingUp className="size-5 text-[#817e74]" />
              </div>

              <div className="mt-5 space-y-3">
                {featuredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[22px] border border-[#e6dfd2] bg-[#faf8f4] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{record.title}</div>
                        <div className="mt-1 text-xs text-[#87847b]">
                          {record.description}
                        </div>
                      </div>
                      {record.amount ? (
                        <div className="text-sm font-semibold text-[#4c4a44]">
                          {record.amount}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-[#e3ddd1] bg-white px-2 py-0.5 text-[11px] text-[#706d65]"
                      >
                        {record.entity}
                      </Badge>
                      {record.status ? (
                        <Badge
                          variant="outline"
                          className="rounded-full border-[#d6ebdb] bg-[#eef9ee] px-2 py-0.5 text-[11px] text-[#246447]"
                        >
                          {record.status.label}
                        </Badge>
                      ) : null}
                      <span className="text-xs text-[#8d897f]">{record.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-[#e4ddd0] bg-white/72 p-4 shadow-[0_18px_34px_rgba(39,33,23,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f4f0e6] text-[#5b584f]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm text-[#7a776e]">{card.label}</div>
                      <div className="text-lg font-semibold tracking-[-0.03em]">
                        {card.value}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#8a877d]">{card.detail}</p>
                </div>
              );
            })}
          </div>
        </main>

        <aside className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(246,244,239,0.98),rgba(239,236,229,0.98))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="rounded-[24px] border border-[#e4ddd0] bg-[#23211d] p-5 text-white shadow-[0_22px_48px_rgba(17,14,10,0.24)]">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                <CreditCard className="size-6" />
              </div>
              <div>
                <div className="text-sm text-white/70">Component state</div>
                <div className="text-xl font-semibold tracking-[-0.04em]">
                  Search overlay ready
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/72">
              The app is now acting like a package demo surface. The global search
              component is the product here, and this page simply showcases it.
            </p>

            <Button
              className="mt-5 w-full rounded-full bg-white text-[#23211d] hover:bg-white/90"
              onClick={() => setSearchOpen(true)}
            >
              Reopen search
              <MoveRight className="size-4" />
            </Button>
          </div>

          <div className="mt-4 rounded-[24px] border border-[#e4ddd0] bg-white/72 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#807d74]">Interaction log</p>
                <h2 className="text-lg font-semibold tracking-[-0.04em]">
                  Latest test events
                </h2>
              </div>
              <LayoutDashboard className="size-5 text-[#79766e]" />
            </div>

            <div className="mt-4 space-y-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[20px] border border-[#e7e0d3] bg-[#faf8f4] p-3"
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <p className="mt-1 text-xs leading-5 text-[#8b887e]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </motion.div>

      <GlobalSearch
        scopes={demoScopes}
        actions={demoSearchData.actions}
        menuItems={demoSearchData.menuItems}
        records={demoSearchData.records}
        recentSearches={demoSearchData.recentSearches}
        featuredScopeIds={demoSearchData.featuredScopeIds}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSelection}
        apiKey="demo-api-key"
      />
    </div>
  );
}
