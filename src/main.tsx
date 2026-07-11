import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './ui/AppErrorBoundary';
import { CopyPasteChannel } from './adapters/copyPasteChannel';
import { IndexedDbWorkflowRepository } from './adapters/indexedDbWorkflowRepository';
import { CryptoRandomIdGen, CryptoRandomPasswordGen } from './adapters/randomGenerators';
import { WebCryptoService } from './adapters/webCryptoService';
import type { AppDeps } from './ui/types';
import './styles.css';

const deps: AppDeps = {
  repo: new IndexedDbWorkflowRepository(),
  crypto: new WebCryptoService(),
  channel: new CopyPasteChannel(location.href.split('#')[0] ?? ''),
  idGen: new CryptoRandomIdGen(),
  passwordGen: new CryptoRandomPasswordGen(),
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <App deps={deps} initialHash={location.hash} />
    </AppErrorBoundary>
  </StrictMode>,
);
