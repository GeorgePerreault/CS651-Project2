import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const PUBLISHABLE_KEY = "pk_test_c2hhcmluZy1ib25lZmlzaC0zMS5jbGVyay5hY2NvdW50cy5kZXYk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
