import { Routes, Route } from 'react-router-dom'
import Landing from './components/landing/Landing.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import ProjectPage from './components/project/ProjectPage.jsx'
import ReviewPage from './components/review/ReviewPage.jsx'
import ReportPage from './components/report/ReportPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import PlaceholderPage from './components/placeholders/PlaceholderPage.jsx'

/*
 * Route map (from PLAN.md). For F0 every screen past the landing page is a
 * friendly placeholder — real behavior arrives in later features:
 *   /dashboard             → My Projects        (F2)
 *   /project/:id           → Task board         (F4)
 *   /project/:id/review    → Peer review form   (F9)
 *   /project/:id/report    → Fairness report    (F11)
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id/review"
        element={
          <ProtectedRoute>
            <ReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id/report"
        element={
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <PlaceholderPage
            emoji="🧭"
            title="This page wandered off"
            text="We couldn't find that page. Let's get you back to somewhere friendly."
            feature="404"
          />
        }
      />
    </Routes>
  )
}
