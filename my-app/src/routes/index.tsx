import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
const Home = lazy(() => import('../pages/HomePage')),
  Vocabulary = lazy(() => import('../pages/VocabularyPage')),
  Detail = lazy(() => import('../pages/WordDetailPage')),
  Grammar = lazy(() => import('../pages/GrammarPage')),
  Conversation = lazy(() => import('../pages/ConversationPage')),
  Listening = lazy(() => import('../pages/ListeningPage')),
  Quiz = lazy(() => import('../pages/QuizPage')),
  Specialized = lazy(() => import('../pages/SpecializedPage')),
  Progress = lazy(() => import('../pages/ProgressPage')),
  Settings = lazy(() => import('../pages/SettingsPage')),
  Login = lazy(() => import('../pages/LoginPage')),
  NotFound = lazy(() => import('../pages/NotFoundPage'));
export function AppRoutes() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="loading-screen">Đang mở không gian học tập…</div>
        }
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="vocabulary/:id" element={<Detail />} />
            <Route path="grammar" element={<Grammar />} />
            <Route path="conversation" element={<Conversation />} />
            <Route path="listening" element={<Listening />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="specialized" element={<Specialized />} />
            <Route path="progress" element={<Progress />} />
            <Route path="settings" element={<Settings />} />
            <Route path="login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
