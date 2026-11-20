import { useEffect, useMemo, useState } from 'react'
import TaskDetail from './components/TaskDetail.jsx'
import TaskFormModal from './components/TaskFormModal.jsx'
import TaskList from './components/TaskList.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import './App.css'

const STORAGE_KEY = 'taskflow-tasks'

function getDateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const initialTasks = [
  {
    id: 'tugas-1',
    title: 'Menyelesaikan laporan proyek',
    description: 'Rapikan hasil pengerjaan dan siapkan laporan untuk dikumpulkan.',
    status: 'Sedang dikerjakan',
    priority: 'Tinggi',
    deadline: getDateOffset(1),
  },
  {
    id: 'tugas-2',
    title: 'Mempelajari React dasar',
    description: 'Pelajari komponen, props, dan state untuk persiapan kuis.',
    status: 'Belum dimulai',
    priority: 'Sedang',
    deadline: getDateOffset(3),
  },
  {
    id: 'tugas-3',
    title: 'Membuat desain halaman utama',
    description: 'Buat rancangan awal halaman utama aplikasi.',
    status: 'Selesai',
    priority: 'Rendah',
    deadline: getDateOffset(-1),
  },
  {
    id: 'tugas-4',
    title: 'Mengumpulkan tugas mingguan',
    description: 'Periksa kembali semua berkas sebelum dikirim.',
    status: 'Belum dimulai',
    priority: 'Tinggi',
    deadline: getDateOffset(5),
  },
]

function normalizeTaskId(id) {
  if (id.startsWith('tugas-')) return id
  if (id.startsWith('task-')) return `tugas-${id.slice(5)}`
  return `tugas-${id}`
}

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY)
  const tasks = savedTasks ? JSON.parse(savedTasks) : initialTasks
  return tasks.map((task) => ({ ...task, id: normalizeTaskId(task.id) }))
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [search, setSearch] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesFilter = activeFilter === 'Semua' || task.status === activeFilter
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, search, tasks])

  function saveTask(taskData) {
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? { ...task, ...taskData } : task,
        ),
      )
      setEditingTask(null)
      return
    }

    setTasks((currentTasks) => [
      { ...taskData, id: `tugas-${crypto.randomUUID()}` },
      ...currentTasks,
    ])
    setIsAddingTask(false)
  }

  function deleteTask() {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskToDelete.id),
    )
    if (selectedTask?.id === taskToDelete.id) setSelectedTask(null)
    setTaskToDelete(null)
  }

  const completedCount = tasks.filter((task) => task.status === 'Selesai').length
  const inProgressCount = tasks.filter(
    (task) => task.status === 'Sedang dikerjakan',
  ).length

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Kuis Lab 6 Pemweb, beranda">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m5 12.5 4.2 4.2L19.5 6.8" />
              <path d="M21 12a9 9 0 1 1-5.3-8.2" />
            </svg>
          </span>
          <span>Kuis Lab 6 Pemweb</span>
        </a>
      </header>

      <section className="page-content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">RUANG KERJA / TUGAS</p>
            <h1>Todo List</h1>
            <p className="page-subtitle">Ayo selesaikan satu persatu.</p>
          </div>
          <button className="button button-primary add-button" onClick={() => setIsAddingTask(true)}>
            <span className="plus-icon" aria-hidden="true">+</span>
            Tambah tugas
          </button>
        </div>

        <section className="summary-grid" aria-label="Ringkasan tugas">
          <article className="summary-card">
            <span className="summary-icon summary-icon-blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
            </span>
            <div><p>Total tugas</p><strong>{tasks.length}</strong></div>
            <span className="summary-caption">semua tugas</span>
          </article>
          <article className="summary-card">
            <span className="summary-icon summary-icon-violet" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            </span>
            <div><p>Sedang berjalan</p><strong>{inProgressCount}</strong></div>
            <span className="summary-caption">perlu fokus</span>
          </article>
          <article className="summary-card">
            <span className="summary-icon summary-icon-green" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <div><p>Selesai</p><strong>{completedCount}</strong></div>
            <span className="summary-caption">kerja bagus!</span>
          </article>
        </section>

        <section className="tasks-panel">
          <div className="panel-heading">
            <div>
              <h2>Daftar tugas</h2>
            </div>
            <label className="search-field">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
              <input
                type="search"
                placeholder="Cari tugas..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Cari tugas"
              />
              <kbd>/</kbd>
            </label>
          </div>

          <div className="filter-row" role="tablist" aria-label="Filter tugas">
            {['Semua', 'Belum dimulai', 'Sedang dikerjakan', 'Selesai'].map((filter) => (
              <button
                key={filter}
                className={`filter-tab${activeFilter === filter ? ' is-active' : ''}`}
                onClick={() => setActiveFilter(filter)}
                role="tab"
                aria-selected={activeFilter === filter}
              >
                {filter}
                <span>
                  {filter === 'Semua'
                    ? tasks.length
                    : tasks.filter((task) => task.status === filter).length}
                </span>
              </button>
            ))}
          </div>

          <TaskList
            tasks={filteredTasks}
            onView={setSelectedTask}
            onEdit={setEditingTask}
            onDelete={setTaskToDelete}
          />
          <div className="panel-footer">
            Menampilkan <strong>{filteredTasks.length}</strong> dari <strong>{tasks.length}</strong> tugas
          </div>
        </section>
      </section>

      {(isAddingTask || editingTask) && (
        <TaskFormModal
          key={editingTask?.id ?? 'new-task'}
          task={editingTask}
          onClose={() => {
            setIsAddingTask(false)
            setEditingTask(null)
          }}
          onSave={saveTask}
        />
      )}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => {
            setSelectedTask(null)
            setEditingTask(task)
          }}
        />
      )}
      {taskToDelete && (
        <ConfirmDialog
          title={taskToDelete.title}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={deleteTask}
        />
      )}
    </main>
  )
}

export default App
