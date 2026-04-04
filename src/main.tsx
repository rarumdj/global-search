import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import './styles/index.css';
import App from './app';
import { GlobalSearchProvider, demoScopes, demoSearchData } from './lib/global-search';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <GlobalSearchProvider
      scopes={demoScopes}
      actions={demoSearchData.actions}
      menuItems={demoSearchData.menuItems}
      records={demoSearchData.records}
      recentSearches={demoSearchData.recentSearches}
      featuredScopeIds={demoSearchData.featuredScopeIds}
      apiKey="demo-api-key"
      defaultOpen
    >
      <App />
      <Toaster richColors position="bottom-center" />
    </GlobalSearchProvider>
  </StrictMode>
);
