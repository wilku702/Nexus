import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ChatPage } from './pages/ChatPage';
import { CatalogPage } from './pages/CatalogPage';
import { EvalPage } from './pages/EvalPage';
import { AuditPage } from './pages/AuditPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="eval" element={<EvalPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  );
}
