import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAppStore } from './store/appStore';
import { DashboardPage } from './pages/DashboardPage';
import { DicePage } from './pages/DicePage';
import { CreaturesPage } from './pages/CreaturesPage';
import { CreatureDetailPage } from './pages/CreatureDetailPage';
import { ImportPage } from './pages/ImportPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const initialize = useAppStore((s) => s.initialize);
  const initialized = useAppStore((s) => s.initialized);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (!initialized) {
    return (
      <div className="loading-shell p-6" role="status" aria-live="polite" aria-busy="true">
        Caricamento dell'assistente di combattimento...
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dice" element={<DicePage />} />
        <Route path="/creatures" element={<CreaturesPage />} />
        <Route path="/creatures/:id" element={<CreatureDetailPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
