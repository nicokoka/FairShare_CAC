import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks.jsx'
import AddTaskModal from './AddTaskModal.jsx'
import TaskColumn from './TaskColumn.jsx'
import './board.css'

/*
 * The live task board: three columns fed by an onSnapshot listener, plus the
 * "Add task" button. For F4 this creates and displays tasks; every new task
 * lands in "To Do". Claiming and moving tasks between columns comes in F5, so
 * the Doing/Done columns stay empty (showing their empty states) until then.
 */

// Each column owns one or more task statuses. "Done" also holds "verified"
// tasks so they have a home the moment verification (F7) lands.
const COLUMNS = [
  {
    key: 'todo',
    title: 'To Do',
    emoji: '📋',
    statuses: ['todo'],
    empty: 'No tasks yet — add the first one!',
  },
  {
    key: 'doing',
    title: 'Doing',
    emoji: '🚧',
    statuses: ['doing'],
    empty: 'Nothing in progress right now.',
  },
  {
    key: 'done',
    title: 'Done',
    emoji: '🎉',
    statuses: ['done', 'verified'],
    empty: 'Finished work will show up here.',
  },
]

export default function TaskBoard({ projectId, members, createdBy }) {
  const { tasks } = useTasks(projectId)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <section className="board" aria-label="Task board">
      <div className="board-toolbar">
        <h2 className="board-heading">Task board</h2>
        <button type="button" className="btn-primary" onClick={() => setShowAdd(true)}>
          + Add task
        </button>
      </div>

      <div className="board-columns">
        {COLUMNS.map((column) => (
          <TaskColumn
            key={column.key}
            column={column}
            tasks={tasks.filter((task) => column.statuses.includes(task.status))}
            members={members}
            projectId={projectId}
            projectCreatedBy={createdBy}
          />
        ))}
      </div>

      {showAdd && (
        <AddTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowAdd(false)}
        />
      )}
    </section>
  )
}
