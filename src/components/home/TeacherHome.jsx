import AppHeader from '../layout/AppHeader.jsx'
import Icon from '../ui/Icon.jsx'
import './home.css'

/*
 * The teacher's home. Fully built in the Classroom Hub workstream (T4): it will
 * list the teacher's classes and let them create one. This shell keeps /home
 * working for a teacher-role account in the meantime.
 */
export default function TeacherHome() {
  return (
    <div className="dashboard">
      <AppHeader />
      <main className="dashboard-main">
        <div className="dashboard-head">
          <div>
            <p className="dashboard-eyebrow">Teacher</p>
            <h1 className="dashboard-greeting">Your classes</h1>
          </div>
        </div>
        <div className="empty-state">
          <p className="empty-emoji"><Icon name="chart" size={48} /></p>
          <h2 className="empty-title">Classes are on the way</h2>
          <p className="empty-text">
            Soon you'll create a class, share its code, and watch every group's
            fairness report land here in one dashboard.
          </p>
        </div>
      </main>
    </div>
  )
}
