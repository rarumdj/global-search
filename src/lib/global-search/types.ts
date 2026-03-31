import type { LucideIcon } from 'lucide-react';

export interface GlobalSearchScope {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  keywords?: string[];
}

export interface GlobalSearchAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  scopeId?: string;
  shortcut?: string;
  keywords?: string[];
  pinned?: boolean;
  accent?: boolean;
}

export interface GlobalSearchMenuItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  scopeId: string;
  shortcut?: string;
  keywords?: string[];
}

export interface GlobalSearchStatus {
  label: string;
  tone: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}

export interface GlobalSearchRecord {
  id: string;
  title: string;
  description: string;
  scopeId: string;
  entity: string;
  amount?: string;
  timestamp?: string;
  icon?: LucideIcon;
  avatarFallback?: string;
  status?: GlobalSearchStatus;
  tags?: string[];
  keywords?: string[];
}

export interface GlobalSearchRecentSearch {
  id: string;
  label: string;
  description: string;
  query: string;
  scopeId?: string;
  timestamp: string;
}

export interface GlobalSearchResultPayload {
  actions?: GlobalSearchAction[];
  menuItems?: GlobalSearchMenuItem[];
  records?: GlobalSearchRecord[];
  recentSearches?: GlobalSearchRecentSearch[];
  featuredScopeIds?: string[];
}

export interface GlobalSearchSearchParams {
  query: string;
  scopeId?: string;
  apiKey?: string;
}

export type GlobalSearchSelection =
  | { kind: 'action'; item: GlobalSearchAction }
  | { kind: 'menu'; item: GlobalSearchMenuItem }
  | { kind: 'record'; item: GlobalSearchRecord }
  | { kind: 'scope'; item: GlobalSearchScope }
  | { kind: 'recent'; item: GlobalSearchRecentSearch };

export interface GlobalSearchProps extends GlobalSearchResultPayload {
  scopes: GlobalSearchScope[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (selection: GlobalSearchSelection) => void;
  onSearch?: (
    params: GlobalSearchSearchParams
  ) => Promise<GlobalSearchResultPayload> | GlobalSearchResultPayload;
  placeholder?: string;
  apiKey?: string;
  className?: string;
  enableGlobalShortcuts?: boolean;
}
