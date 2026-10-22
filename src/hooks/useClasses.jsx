import { useEffect, useState } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import { classesCollection } from '../lib/classes.js'
import { projectsCollection } from '../lib/projects.js'

/*
 * Live list of the classes a teacher owns (classes where teacherId == uid).
 * Sorted newest-first in JS to avoid needing a composite index.
 */
export function useClasses(teacherUid) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teacherUid) {
      setClasses([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const classQuery = query(classesCollection, where('teacherId', '==', teacherUid))
    const unsubscribe = onSnapshot(
      classQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity))
        setClasses(rows)
        setLoading(false)
      },
      () => {
        setClasses([])
        setLoading(false)
      },
    )
    return unsubscribe
  }, [teacherUid])

  return { classes, loading }
}

/*
 * Live list of the projects attached to a class (projects where classId == id).
 * The teacher-read rules let the owning teacher read these project docs; a
 * non-teacher's query simply returns nothing it's allowed to see.
 */
export function useClassProjects(classId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!classId) {
      setProjects([])
      setLoading(false)
      return undefined
    }
    setLoading(true)
    const projectsQuery = query(projectsCollection, where('classId', '==', classId))
    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? Infinity) - (a.createdAt?.toMillis?.() ?? Infinity))
        setProjects(rows)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setProjects([])
        setLoading(false)
      },
    )
    return unsubscribe
  }, [classId])

  return { projects, loading, error }
}
