import ReactDOM from 'react-dom/client';
import { Provider as JotaiProvider } from 'jotai/react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <JotaiProvider>
    <MantineProvider
      theme={{
        primaryColor: 'teal',
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}
    >
      <App />
    </MantineProvider>
  </JotaiProvider>,
);
