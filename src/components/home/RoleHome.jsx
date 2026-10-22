import { useAuth } from '../../hooks/useAuth.jsx'
import { useUserProfile } from '../../hooks/useUserProfile.jsx'
import LoadingScreen from '../common/LoadingScreen.jsx'
import Dashboard from '../dashboard/Dashboard.jsx'
import TeacherHome from './TeacherHome.jsx'
import RolePicker from './RolePicker.jsx'

/*
 * The new front door at /home. FairShare now serves two kinds of people, so the
 * home screen branches on the signed-in user's role:
 *   - no role chosen yet → a one-time picker (student / teacher)
 *   - student            → the project dashboard (unchanged from before)
 *   - teacher            → the classes hub
 *
 * Each branch returns a self-contained page (its own header), so there's no
 * duplicated chrome. If the profile can't load we default to the student view —
 * the app never gets stuck, and the original experience is always reachable.
 */
export default function RoleHome() {
  const { user } = useAuth()
  const { role, isTeacher, loading, setRole } = useUserProfile()

  if (!user || loading) return <LoadingScreen />
  if (role === null) return <RolePicker onPick={setRole} />
  if (isTeacher) return <TeacherHome />
  return <Dashboard />
}
