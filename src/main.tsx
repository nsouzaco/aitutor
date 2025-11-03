import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider, ConversationProvider } from './contexts'
import { ErrorBoundary } from './components/Layout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ConversationProvider>
          <App />
        </ConversationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

