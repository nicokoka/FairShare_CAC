import { Routes, Route } from 'react-router-dom'
import Landing from './components/landing/Landing.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import ProjectPage from './components/project/ProjectPage.jsx'
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
          <PlaceholderPage
            emoji="⭐"
            title="Rate your teammates"
            text="When a project wraps up, everyone privately rates each teammate on effort, quality, and teamwork."
            feature="Coming in feature 9"
          />
        }
      />
      <Route
        path="/project/:id/report"
        element={
          <PlaceholderPage
            emoji="📊"
            title="The fairness report"
            text="A clean, printable page showing each person's verified contribution and average peer rating — ready for the teacher."
            feature="Coming in feature 11"
          />
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
