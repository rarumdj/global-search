import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

import { GlobalSearch } from './global-search';

import type {
  GlobalSearchActionSelection,
  GlobalSearchListenerOptions,
  GlobalSearchOpenOptions,
  GlobalSearchProviderProps,
  GlobalSearchSelection,
} from './types';

type GlobalSearchSelectionListener = (selection: GlobalSearchSelection) => void;

interface GlobalSearchContextValue {
  isOpen: boolean;
  open: (options?: GlobalSearchOpenOptions) => void;
  close: () => void;
  toggle: (options?: GlobalSearchOpenOptions) => void;
  registerSelectionListener: (listener: GlobalSearchSelectionListener) => () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

function matchesListenerOptions(
  selection: GlobalSearchSelection,
  options?: GlobalSearchListenerOptions
) {
  if (!options) {
    return true;
  }

  if (options.kinds?.length && !options.kinds.includes(selection.kind)) {
    return false;
  }

  if (options.actionIds?.length) {
    if (selection.kind !== 'action') {
      return false;
    }

    if (!options.actionIds.includes(selection.item.id)) {
      return false;
    }
  }

  return options.when ? options.when(selection) : true;
}

function useGlobalSearchContext() {
  const context = useContext(GlobalSearchContext);

  if (!context) {
    throw new Error('Global search hooks must be used inside <GlobalSearchProvider>.');
  }

  return context;
}

export function GlobalSearchProvider({
  children,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  ...searchProps
}: GlobalSearchProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openOptions, setOpenOptions] = useState<GlobalSearchOpenOptions>({});
  const [instanceKey, setInstanceKey] = useState(0);
  const listenersRef = useRef(new Set<GlobalSearchSelectionListener>());
  const openStateRef = useRef(defaultOpen);

  useEffect(() => {
    openStateRef.current = isOpen;
  }, [isOpen]);

  const emitSelection = useEffectEvent((selection: GlobalSearchSelection) => {
    onSelect?.(selection);

    for (const listener of listenersRef.current) {
      listener(selection);
    }
  });

  const open = (options: GlobalSearchOpenOptions = {}) => {
    setOpenOptions(options);
    setInstanceKey((currentKey) => currentKey + 1);
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const toggle = (options: GlobalSearchOpenOptions = {}) => {
    if (openStateRef.current) {
      close();
      return;
    }

    open(options);
  };

  const registerSelectionListener = (listener: GlobalSearchSelectionListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <GlobalSearchContext.Provider
      value={{ isOpen, open, close, toggle, registerSelectionListener }}
    >
      {children}
      <GlobalSearch
        key={instanceKey}
        {...searchProps}
        open={isOpen}
        onOpenChange={handleOpenChange}
        onSelect={emitSelection}
        initialQuery={openOptions.query}
        initialScopeId={openOptions.scopeId}
        initialBrowseMode={openOptions.browseMode}
      />
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const { isOpen, open, close, toggle } = useGlobalSearchContext();

  return { isOpen, open, close, toggle };
}

export function useGlobalSearchListener(
  listener: GlobalSearchSelectionListener,
  options?: GlobalSearchListenerOptions
) {
  const { registerSelectionListener } = useGlobalSearchContext();
  const handleSelection = useEffectEvent(listener);

  useEffect(() => {
    return registerSelectionListener((selection) => {
      if (!matchesListenerOptions(selection, options)) {
        return;
      }

      handleSelection(selection);
    });
  }, [options, registerSelectionListener]);
}

export function useGlobalSearchAction(
  actionId: string | string[],
  listener: (selection: GlobalSearchActionSelection) => void
) {
  const actionIds = Array.isArray(actionId) ? actionId : [actionId];
  const handleAction = useEffectEvent(listener);

  useGlobalSearchListener(
    (selection) => {
      if (selection.kind !== 'action') {
        return;
      }

      handleAction(selection);
    },
    { actionIds }
  );
}
