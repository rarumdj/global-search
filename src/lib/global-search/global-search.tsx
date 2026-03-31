import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Command as CommandIcon,
  CornerDownLeft,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import type {
  GlobalSearchAction,
  GlobalSearchProps,
  GlobalSearchRecentSearch,
  GlobalSearchResultPayload,
  GlobalSearchScope,
  GlobalSearchSelection,
  GlobalSearchStatus,
} from './types';

const statusToneClasses: Record<GlobalSearchStatus['tone'], string> = {
  green: 'bg-[#eef9ee] text-[#236f4c] ring-[#cde9d2]',
  amber: 'bg-[#fff4dd] text-[#8f6615] ring-[#f5d89f]',
  red: 'bg-[#fde8e6] text-[#b33d30] ring-[#f4c4bd]',
  blue: 'bg-[#eaf2ff] text-[#2d5fbe] ring-[#c3d6fb]',
  slate: 'bg-[#efefed] text-[#626660] ring-[#d8d8d2]',
};

function isMacLike() {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return /Mac|iPhone|iPad/i.test(navigator.platform);
}

function getShortcutTokens(shortcut?: string) {
  if (!shortcut) {
    return [];
  }

  const macLike = isMacLike();
  const tokenMap = new Map<string, string>([
    ['mod', macLike ? '⌘' : 'Ctrl'],
    ['cmd', '⌘'],
    ['meta', '⌘'],
    ['ctrl', 'Ctrl'],
    ['shift', '⇧'],
    ['alt', macLike ? '⌥' : 'Alt'],
    ['enter', 'Enter'],
    ['esc', 'Esc'],
  ]);

  return shortcut
    .split('+')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .map((token) => tokenMap.get(token) ?? token.toUpperCase());
}

function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  const macLike = isMacLike();
  const tokens = shortcut
    .split('+')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const mainKey = tokens.at(-1);
  if (!mainKey) {
    return false;
  }

  const expectsShift = tokens.includes('shift');
  const expectsAlt = tokens.includes('alt');
  const expectsMeta =
    tokens.includes('meta') ||
    tokens.includes('cmd') ||
    (macLike && tokens.includes('mod'));
  const expectsCtrl = tokens.includes('ctrl') || (!macLike && tokens.includes('mod'));

  if (event.shiftKey !== expectsShift) {
    return false;
  }

  if (event.altKey !== expectsAlt) {
    return false;
  }

  if (event.metaKey !== expectsMeta) {
    return false;
  }

  if (event.ctrlKey !== expectsCtrl) {
    return false;
  }

  const eventKey = event.key.toLowerCase();
  if (mainKey === 'esc') {
    return eventKey === 'escape';
  }

  return eventKey === mainKey;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

function createSearchText(...values: Array<string | string[] | undefined>) {
  return values
    .flatMap((value) => {
      if (!value) {
        return [];
      }

      return Array.isArray(value) ? value : [value];
    })
    .join(' ')
    .toLowerCase();
}

function matchesQuery(query: string, ...values: Array<string | string[] | undefined>) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const haystack = createSearchText(...values);

  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function matchesScope(activeScopeId: string | null, scopeId?: string) {
  if (!activeScopeId) {
    return true;
  }

  if (!scopeId) {
    return true;
  }

  return scopeId === activeScopeId;
}

function ShortcutKeys({ shortcut }: { shortcut?: string }) {
  const tokens = getShortcutTokens(shortcut);

  if (!tokens.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {tokens.map((token, index) => (
        <Kbd
          key={`${shortcut ?? 'shortcut'}-${token}-${index}`}
          className="h-6 min-w-6 rounded-full bg-[#f4f2ed] px-1.5 text-[11px] font-semibold text-[#6c6a63]"
        >
          {token}
        </Kbd>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status?: GlobalSearchStatus }) {
  if (!status) {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ring-1',
        statusToneClasses[status.tone]
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status.label}
    </span>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="px-3 pb-2 text-[11px] font-semibold tracking-[0.16em] text-[#8c8a83] uppercase">
      {children}
    </div>
  );
}

function QuickActionChip({
  action,
  onSelect,
}: {
  action: GlobalSearchAction;
  onSelect: () => void;
}) {
  if (!action) {
    return null;
  }

  const Icon = action.icon;

  return (
    <CommandItem
      value={`action-${action.id}`}
      keywords={action.keywords}
      onSelect={onSelect}
      className="h-auto rounded-[18px] border border-[#e7e1d6] bg-white px-4 py-3 data-[selected=true]:border-[#ddd5c7] data-[selected=true]:bg-[#f7f4ee]"
    >
      <div className="flex w-full items-center gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5f2ec] text-[#7d7a71]',
            action.accent && 'bg-[#f1fff0] text-[#53be7a]'
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div
            className={cn(
              'truncate text-sm font-semibold text-[#383731]',
              action.accent && 'text-[#4bb876]'
            )}
          >
            {action.title}
          </div>
        </div>
        <ShortcutKeys shortcut={action.shortcut} />
      </div>
    </CommandItem>
  );
}

function SearchItemRow({
  icon: Icon,
  avatarFallback,
  title,
  description,
  shortcut,
  status,
  tags,
  amount,
  timestamp,
  accent,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  avatarFallback?: string;
  title: string;
  description: string;
  shortcut?: string;
  status?: GlobalSearchStatus;
  tags?: string[];
  amount?: string;
  timestamp?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#e9e4da] bg-white text-[#4f514a] shadow-[0_8px_24px_rgba(31,28,20,0.06)]',
          accent && 'border-[#dff1d9] bg-[#f4fff2] text-[#4cb874]'
        )}
      >
        {avatarFallback ? (
          <Avatar className="size-10 bg-[#f7eefe] text-[#8f6aaf] ring-0 after:hidden">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        ) : Icon ? (
          <Icon className="size-4" />
        ) : (
          <Sparkles className="size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'truncate text-sm font-semibold text-[#262620]',
              accent && 'text-[#49b879]'
            )}
          >
            {title}
          </span>
          {amount ? (
            <span className="text-sm font-semibold text-[#78766d]">{amount}</span>
          ) : null}
          {tags?.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-full border-[#e6e1d8] bg-[#faf8f4] px-2 py-0.5 text-[11px] text-[#7f7d74]"
            >
              {tag}
            </Badge>
          ))}
          <StatusPill status={status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8b887f]">
          <span className="truncate">{description}</span>
          {timestamp ? <span>{timestamp}</span> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ShortcutKeys shortcut={shortcut} />
        <ChevronRight className="size-4 text-[#b0ada5]" />
      </div>
    </div>
  );
}

function RecentSearchCompactRow({
  item,
  index,
}: {
  item: GlobalSearchRecentSearch;
  index: number;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e8e2d7] bg-[#faf8f4] text-[#908d84]">
        <Clock3 className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#32312b]">{item.label}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-[#939087]">
          <span className="truncate">{item.timestamp}</span>
        </div>
      </div>
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#e7e1d6] bg-white text-[11px] font-semibold text-[#9a968d]">
        {index + 1}
      </div>
    </div>
  );
}

function FooterHint({
  label,
  shortcut,
  icon,
}: {
  label: string;
  shortcut?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const Icon = icon;

  return (
    <div className="flex items-center gap-2 text-xs text-[#8b887f]">
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{label}</span>
      <ShortcutKeys shortcut={shortcut} />
    </div>
  );
}

export function GlobalSearch({
  scopes,
  actions = [],
  menuItems = [],
  records = [],
  recentSearches = [],
  featuredScopeIds = [],
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  onSearch,
  placeholder = 'Search data, ask a question, or run a command...',
  apiKey,
  className,
  enableGlobalShortcuts = true,
}: GlobalSearchProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [activeScopeId, setActiveScopeId] = useState<string | null>(null);
  const [browseMode, setBrowseMode] = useState(false);
  const [asyncResults, setAsyncResults] = useState<GlobalSearchResultPayload | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const open = openProp ?? internalOpen;
  const deferredQuery = useDeferredValue(query.trim());

  const updateOpenState = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);

    if (openProp === undefined) {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      setQuery('');
      setActiveScopeId(null);
      setBrowseMode(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
    };
  }, [open]);

  useEffect(() => {
    if (!onSearch) {
      setAsyncResults(null);
      return;
    }

    let ignore = false;
    setIsLoading(true);

    Promise.resolve(
      onSearch({
        query: deferredQuery,
        scopeId: activeScopeId ?? undefined,
        apiKey,
      })
    )
      .then((results) => {
        if (!ignore) {
          setAsyncResults(results);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeScopeId, apiKey, deferredQuery, onSearch]);

  const resolvedActions = asyncResults?.actions ?? actions;
  const resolvedMenuItems = asyncResults?.menuItems ?? menuItems;
  const resolvedRecords = asyncResults?.records ?? records;
  const resolvedRecentSearches = asyncResults?.recentSearches ?? recentSearches;
  const resolvedFeaturedScopeIds =
    asyncResults?.featuredScopeIds ??
    (featuredScopeIds.length
      ? featuredScopeIds
      : scopes.slice(0, 4).map((scope) => scope.id));

  const activeScope = scopes.find((scope) => scope.id === activeScopeId) ?? null;
  const featuredScopes = resolvedFeaturedScopeIds
    .map((scopeId) => scopes.find((scope) => scope.id === scopeId))
    .filter((scope): scope is GlobalSearchScope => Boolean(scope));

  const matchingActions = resolvedActions.filter(
    (action) =>
      matchesScope(activeScopeId, action.scopeId) &&
      matchesQuery(deferredQuery, action.title, action.description, action.keywords)
  );

  const matchingMenuItems = resolvedMenuItems.filter(
    (item) =>
      matchesScope(activeScopeId, item.scopeId) &&
      matchesQuery(deferredQuery, item.label, item.description, item.keywords)
  );

  const matchingRecords = resolvedRecords.filter(
    (item) =>
      matchesScope(activeScopeId, item.scopeId) &&
      matchesQuery(
        deferredQuery,
        item.title,
        item.description,
        item.amount,
        item.entity,
        item.tags,
        item.keywords
      )
  );

  const scopedActions = resolvedActions
    .filter((action) => matchesScope(activeScopeId, action.scopeId))
    .slice(0, 6);
  const scopedMenuItems = resolvedMenuItems
    .filter((item) => matchesScope(activeScopeId, item.scopeId))
    .slice(0, 5);
  const scopedRecords = resolvedRecords
    .filter((item) => matchesScope(activeScopeId, item.scopeId))
    .slice(0, 6);
  const quickActions = resolvedActions.filter((action) => action.pinned).slice(0, 4);

  const askAiAction = resolvedActions.find((action) => action.id === 'ask-ai');
  const actionResults = deferredQuery
    ? [
        ...(askAiAction
          ? [
              {
                ...askAiAction,
                description: `Ask Bujeti AI about "${deferredQuery}".`,
              },
            ]
          : []),
        ...matchingActions.filter((action) => action.id !== 'ask-ai'),
      ].slice(0, 5)
    : matchingActions;

  const totalQueryResults = matchingMenuItems.length + matchingRecords.length;
  const currentView = deferredQuery
    ? 'results'
    : activeScope
      ? `scope-${activeScope.id}`
      : browseMode
        ? 'browse'
        : 'home';

  const commitSelection = useEffectEvent((selection: GlobalSearchSelection) => {
    onSelect?.(selection);
    updateOpenState(false);
  });

  const runRecentSearch = useEffectEvent((item: GlobalSearchRecentSearch) => {
    onSelect?.({ kind: 'recent', item });
    setBrowseMode(false);
    setActiveScopeId(item.scopeId ?? null);
    startTransition(() => {
      setQuery(item.query);
    });
  });

  const chooseScope = useEffectEvent((scope: GlobalSearchScope) => {
    setBrowseMode(false);
    setActiveScopeId(scope.id);
    startTransition(() => {
      setQuery('');
    });
  });

  const resetToHome = useEffectEvent(() => {
    setBrowseMode(false);
    setActiveScopeId(null);
    startTransition(() => {
      setQuery('');
    });
  });

  const globalKeyHandler = useEffectEvent((event: KeyboardEvent) => {
    const editableTarget = isEditableTarget(event.target);

    if (!open) {
      if (!editableTarget && (matchesShortcut(event, 'mod+k') || event.key === '/')) {
        event.preventDefault();
        updateOpenState(true);
        return;
      }
    }

    if (!enableGlobalShortcuts) {
      return;
    }

    if (!open && editableTarget) {
      return;
    }

    const shortcutAction = resolvedActions.find(
      (action) => action.shortcut && matchesShortcut(event, action.shortcut)
    );

    if (!shortcutAction) {
      return;
    }

    event.preventDefault();
    commitSelection({ kind: 'action', item: shortcutAction });
  });

  useEffect(() => {
    window.addEventListener('keydown', globalKeyHandler);

    return () => {
      window.removeEventListener('keydown', globalKeyHandler);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={updateOpenState}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'top-1/2 h-[min(640px,78vh)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-[75vw] sm:max-w-[75vw] xl:w-[1100px] xl:max-w-[1100px] overflow-hidden rounded-[24px] border border-[rgba(223,217,205,0.9)] bg-[rgba(252,250,246,0.97)] p-0 text-[#262620] shadow-[0_30px_90px_rgba(28,24,18,0.24)] supports-backdrop-filter:bg-[rgba(252,250,246,0.86)]',
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.99 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Command shouldFilter={false} loop className="bg-transparent p-0">
            <div className="border-b border-[#ebe6dc] px-4 pt-4 pb-2">
              <div className="flex items-center gap-3 rounded-[16px] border border-[#ebe5d9] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(42,36,24,0.05)]">
                <Search className="size-5 text-[#76746d]" />
                {activeScope ? (
                  <button
                    type="button"
                    onClick={resetToHome}
                    className="inline-flex items-center gap-1 rounded-full border border-[#e8e2d7] bg-[#f8f6f1] px-2.5 py-1 text-xs font-semibold text-[#5c5a54]"
                  >
                    {activeScope.label}
                    <ArrowLeft className="size-3.5" />
                  </button>
                ) : null}
                <label htmlFor={inputId} className="sr-only">
                  Search
                </label>
                <CommandPrimitive.Input
                  ref={inputRef}
                  id={inputId}
                  value={query}
                  onValueChange={(value) => {
                    startTransition(() => {
                      setQuery(value);
                      setBrowseMode(false);
                    });
                  }}
                  placeholder={
                    activeScope
                      ? `Search in ${activeScope.label.toLowerCase()}...`
                      : placeholder
                  }
                  className="h-7 min-w-0 flex-1 bg-transparent text-[15px] text-[#292822] outline-none placeholder:text-[#b8b3a8]"
                />
                {isLoading ? (
                  <LoaderCircle className="size-4 animate-spin text-[#9f9a91]" />
                ) : null}
                {(query || activeScope || browseMode) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full text-[#7e7c74] hover:bg-[#f3f0ea]"
                    onClick={resetToHome}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-[#7e7c74] hover:bg-[#f3f0ea]"
                  onClick={() => {
                    setBrowseMode((currentValue) => !currentValue);
                    setActiveScopeId(null);
                    startTransition(() => {
                      setQuery('');
                    });
                  }}
                >
                  <SlidersHorizontal className="size-4" />
                  <span className="sr-only">Browse categories</span>
                </Button>
              </div>
            </div>

            {!deferredQuery && !activeScope && !browseMode ? (
              <div className="flex flex-wrap gap-2 px-4 pt-3">
                {featuredScopes.map((scope) => {
                  const Icon = scope.icon;

                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => chooseScope(scope)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#e9e3d8] bg-white px-3 py-2 text-sm font-semibold text-[#5d5b53] transition-colors hover:border-[#d6cfbf] hover:bg-[#fbfaf7]"
                    >
                      <Icon className="size-4 text-[#8a887f]" />
                      {scope.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setBrowseMode(true);
                    setActiveScopeId(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e9e3d8] bg-[#f5f2ea] px-3 py-2 text-sm font-semibold text-[#5d5b53] transition-colors hover:border-[#d6cfbf]"
                >
                  <CommandIcon className="size-4 text-[#8a887f]" />
                  All
                </button>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 px-3 pt-3">
              <ScrollArea className="h-full">
                <CommandList className="max-h-none px-1 pb-4">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                      {currentView === 'home' ? (
                        <>
                          <SectionHeading>Quick actions</SectionHeading>
                          <CommandGroup>
                            <div className="grid gap-2 px-3 pb-3 md:grid-cols-2 xl:grid-cols-4">
                              {quickActions.map((action) => (
                                <QuickActionChip
                                  key={action.id}
                                  action={action}
                                  onSelect={() =>
                                    commitSelection({ kind: 'action', item: action })
                                  }
                                />
                              ))}
                            </div>
                          </CommandGroup>

                          <SectionHeading>Recent searches</SectionHeading>
                          <CommandGroup>
                            {resolvedRecentSearches.slice(0, 5).map((item, index) => (
                              <CommandItem
                                key={item.id}
                                value={`recent-${item.id}`}
                                onSelect={() => runRecentSearch(item)}
                                className="mb-1 h-auto rounded-[16px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                              >
                                <RecentSearchCompactRow item={item} index={index} />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      ) : null}

                      {currentView === 'browse' ? (
                        <>
                          <div className="mb-4 flex items-center gap-2 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full border border-[#e9e3d8] bg-white text-[#5f5d56] hover:bg-[#f8f6f1]"
                              onClick={resetToHome}
                            >
                              <ArrowLeft className="size-4" />
                              Back
                            </Button>
                          </div>

                          <SectionHeading>Search in</SectionHeading>
                          <CommandGroup>
                            {featuredScopes.map((scope) => (
                              <CommandItem
                                key={scope.id}
                                value={`scope-${scope.id}`}
                                keywords={scope.keywords}
                                onSelect={() => chooseScope(scope)}
                                className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                              >
                                <SearchItemRow
                                  icon={scope.icon}
                                  title={scope.label}
                                  description={scope.description}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          <Separator className="my-3 bg-[#ece6db]" />

                          <SectionHeading>Menu</SectionHeading>
                          <CommandGroup>
                            {resolvedMenuItems.map((item) => (
                              <CommandItem
                                key={item.id}
                                value={`menu-${item.id}`}
                                keywords={item.keywords}
                                onSelect={() => commitSelection({ kind: 'menu', item })}
                                className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                              >
                                <SearchItemRow
                                  icon={item.icon}
                                  title={item.label}
                                  description={item.description}
                                  shortcut={item.shortcut}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      ) : null}

                      {activeScope && !deferredQuery ? (
                        <>
                          <div className="mb-4 flex items-center gap-2 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full border border-[#e9e3d8] bg-white text-[#5f5d56] hover:bg-[#f8f6f1]"
                              onClick={resetToHome}
                            >
                              <ArrowLeft className="size-4" />
                              Back
                            </Button>
                            <Badge
                              variant="outline"
                              className="rounded-full border-[#e9e3d8] bg-[#faf8f4] px-2.5 py-1 text-xs text-[#706d65]"
                            >
                              {activeScope.label}
                            </Badge>
                          </div>

                          <SectionHeading>Actions</SectionHeading>
                          <CommandGroup>
                            {scopedActions.map((action) => (
                              <CommandItem
                                key={action.id}
                                value={`action-${action.id}`}
                                keywords={action.keywords}
                                onSelect={() =>
                                  commitSelection({ kind: 'action', item: action })
                                }
                                className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                              >
                                <SearchItemRow
                                  icon={action.icon}
                                  title={action.title}
                                  description={action.description}
                                  shortcut={action.shortcut}
                                  accent={action.accent}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          {scopedMenuItems.length ? (
                            <>
                              <Separator className="my-3 bg-[#ece6db]" />
                              <SectionHeading>Navigation</SectionHeading>
                              <CommandGroup>
                                {scopedMenuItems.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`menu-${item.id}`}
                                    keywords={item.keywords}
                                    onSelect={() =>
                                      commitSelection({ kind: 'menu', item })
                                    }
                                    className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                                  >
                                    <SearchItemRow
                                      icon={item.icon}
                                      title={item.label}
                                      description={item.description}
                                      shortcut={item.shortcut}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          ) : null}

                          {scopedRecords.length ? (
                            <>
                              <Separator className="my-3 bg-[#ece6db]" />
                              <SectionHeading>Records</SectionHeading>
                              <CommandGroup>
                                {scopedRecords.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`record-${item.id}`}
                                    keywords={item.keywords}
                                    onSelect={() =>
                                      commitSelection({ kind: 'record', item })
                                    }
                                    className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                                  >
                                    <SearchItemRow
                                      icon={item.icon}
                                      avatarFallback={item.avatarFallback}
                                      title={item.title}
                                      description={item.description}
                                      amount={item.amount}
                                      timestamp={item.timestamp}
                                      status={item.status}
                                      tags={item.tags}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          ) : null}
                        </>
                      ) : null}

                      {currentView === 'results' ? (
                        <>
                          <SectionHeading>Actions</SectionHeading>
                          <CommandGroup>
                            {actionResults.map((action) => (
                              <CommandItem
                                key={action.id}
                                value={`action-${action.id}`}
                                keywords={action.keywords}
                                onSelect={() =>
                                  commitSelection({ kind: 'action', item: action })
                                }
                                className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                              >
                                <SearchItemRow
                                  icon={action.icon}
                                  title={action.title}
                                  description={action.description}
                                  shortcut={action.shortcut}
                                  accent={action.accent}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          {totalQueryResults ? (
                            <>
                              <Separator className="my-3 bg-[#ece6db]" />
                              <SectionHeading>{`Results (${totalQueryResults})`}</SectionHeading>
                              <CommandGroup>
                                {matchingRecords.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`record-${item.id}`}
                                    keywords={item.keywords}
                                    onSelect={() =>
                                      commitSelection({ kind: 'record', item })
                                    }
                                    className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                                  >
                                    <SearchItemRow
                                      icon={item.icon}
                                      avatarFallback={item.avatarFallback}
                                      title={item.title}
                                      description={item.description}
                                      amount={item.amount}
                                      timestamp={item.timestamp}
                                      status={item.status}
                                      tags={item.tags}
                                    />
                                  </CommandItem>
                                ))}

                                {matchingMenuItems.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={`menu-${item.id}`}
                                    keywords={item.keywords}
                                    onSelect={() =>
                                      commitSelection({ kind: 'menu', item })
                                    }
                                    className="mb-2 h-auto rounded-[22px] border border-transparent px-3 py-3 data-[selected=true]:border-[#e3ddd1] data-[selected=true]:bg-[#f6f3ec]"
                                  >
                                    <SearchItemRow
                                      icon={item.icon}
                                      title={item.label}
                                      description={item.description}
                                      shortcut={item.shortcut}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          ) : (
                            <CommandEmpty className="rounded-[28px] border border-dashed border-[#e5dfd4] bg-[#faf8f3] py-12 text-center text-[#7f7b72]">
                              No mocked results matched that search yet.
                            </CommandEmpty>
                          )}
                        </>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </CommandList>
              </ScrollArea>
            </div>
          </Command>

          <div className="border-t border-[#ebe6dc] bg-[linear-gradient(180deg,rgba(250,248,243,0.98),rgba(247,244,237,0.98))] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <FooterHint label="Navigate" icon={ArrowLeft} />
                <FooterHint label="Select" shortcut="enter" icon={CornerDownLeft} />
                <FooterHint label="Close" shortcut="esc" />
              </div>
              <div className="flex items-center gap-3 text-xs text-[#88857d]">
                <FooterHint label="Open from anywhere" shortcut="mod+k" />
                <span className="rounded-full border border-[#e7e1d7] bg-white px-3 py-1 font-medium">
                  Mock data now, `apiKey` ready later
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
