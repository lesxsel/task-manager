import { useEffect, useState } from 'react'
import axios from 'axios'
import { ClipboardList, CheckCircle2, PlayCircle, Plus, X } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'

interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  project: number
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const loadTasks = () => {
    axios.get('http://127.0.0.1:8000/api/tasks/')
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
        setTasks(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadTasks() }, [])

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    axios.post('http://127.0.0.1:8000/api/tasks/', { title, description, status, priority, project: 1 })
    .then(() => {
      setTitle(''); setDescription(''); setStatus('todo'); setPriority('medium'); setIsOpen(false); loadTasks()
    }).catch(err => console.error(err))
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const taskId = parseInt(draggableId)
    const newStatus = destination.droppableId as 'todo' | 'in_progress' | 'done'
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    axios.patch(`http://127.0.0${taskId}/`, { status: newStatus }).catch(() => loadTasks())
  }

  const columns: { id: 'todo' | 'in_progress' | 'done'; title: string; icon: any; color: string; list: Task[] }[] = [
    { id: 'todo', title: 'Нужно сделать', icon: ClipboardList, color: 'text-red-400', list: tasks.filter(t => t.status === 'todo') },
    { id: 'in_progress', title: 'В работе', icon: PlayCircle, color: 'text-yellow-400', list: tasks.filter(t => t.status === 'in_progress') },
    { id: 'done', title: 'Готово', icon: CheckCircle2, color: 'text-emerald-400', list: tasks.filter(t => t.status === 'done') }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }
  const pColors = { high: 'bg-red-500/10 text-red-400 border-red-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', low: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-10 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider uppercase text-red-500">Комната №213</h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Система управления суровыми релизами</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Добавить костыль
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => {
            const Icon = col.icon
            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 min-h-[500px] flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                      <Icon className={`w-5 h-5 ${col.color}`} />
                      <h2 className="font-bold uppercase tracking-wide text-sm text-slate-300">{col.title} ({col.list.length})</h2>
                    </div>
                    <div className="space-y-3 flex-grow">
                      {col.list.map((task, index) => (
                        <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-all shadow-lg select-none">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-semibold text-slate-200 text-sm leading-snug">{task.title}</h3>
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${pColors[task.priority]}`}>{task.priority}</span>
                              </div>
                              {task.description && <p className="text-xs text-slate-400 font-normal mt-2 line-clamp-3">{task.description}</p>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 relative shadow-2xl">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold uppercase tracking-wider text-red-500 mb-4">Новая задача</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Что горит?</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-red-500" placeholder="Название костыля" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Детали катастрофы</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-red-500 resize-none" placeholder="Опиши масштабы бедствия..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Статус</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-100 focus:outline-none">
                    <option value="todo">Нужно сделать</option>
                    <option value="in_progress">В работе</option>
                    <option value="done">Готово</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Приоритет</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-100 focus:outline-none">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider py-2.5 rounded text-sm transition-all mt-2">Закинуть в продакшн</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
