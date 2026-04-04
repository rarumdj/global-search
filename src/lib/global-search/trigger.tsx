import type { ButtonHTMLAttributes, MouseEvent } from 'react';

import { useGlobalSearch } from './provider';

import type { GlobalSearchOpenOptions } from './types';

export interface GlobalSearchTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    GlobalSearchOpenOptions {}

export function GlobalSearchTrigger({
  query,
  scopeId,
  browseMode,
  onClick,
  type = 'button',
  children = 'Open search',
  ...props
}: GlobalSearchTriggerProps) {
  const { open } = useGlobalSearch();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    open({ query, scopeId, browseMode });
  };

  return (
    <button {...props} type={type} onClick={handleClick}>
      {children}
    </button>
  );
}
