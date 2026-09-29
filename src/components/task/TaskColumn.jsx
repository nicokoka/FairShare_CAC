import TaskCard from './TaskCard.jsx'
import Icon from '../ui/Icon.jsx'

/*
 * One column of the board (To Do / Doing / Done). Shows a playful header with a
 * live count and, when there are no tasks, a friendly empty state instead of a
 * blank gap. `column` carries the title, emoji, and empty-state copy; `tasks`
 * is the already-filtered list for this column.
 */
export default function TaskColumn({ column, tasks, members, projectId, projectCreatedBy, locked }) {
  return (
    <section className="board-column" aria-label={column.title}>
      <header className="column-header">
        <span className="column-emoji"><Icon name={column.icon} size={22} /></span>
        <h3 className="column-title">{column.title}</h3>
        <span className="column-count">{tasks.length}</span>
      </header>

      {tasks.length === 0 ? (
        <p className="column-empty">{column.empty}</p>
      ) : (
        <ul className="column-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                members={members}
                projectId={projectId}
                projectCreatedBy={projectCreatedBy}
                locked={locked}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
