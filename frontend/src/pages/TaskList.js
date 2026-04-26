import React, { useState, useEffect } from 'react';
import { taskApi } from '../services/taskApi';

const STATUSES  = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const emptyForm = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' };

function TaskList() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [filter, setFilter]     = useState('ALL');

  const fetchTasks = () => {
    setLoading(true);
    const request = filter === 'ALL' ? taskApi.getAll() : taskApi.getByStatus(filter);
    request
      .then(res => setTasks(res.data))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, dueDate: form.dueDate || null };
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
      } else {
        await taskApi.create(payload);
      }
      setShowForm(false);
      setEditingTask(null);
      setForm(emptyForm);
      fetchTasks();
    } catch {
      setError('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskApi.delete(id);
    fetchTasks();
  };

  const handleStatusChange = async (id, status) => {
    await taskApi.updateStatus(id, status);
    fetchTasks();
  };

  const priorityBadge = (p) => ({ LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' }[p] || '');
  const statusLabel   = (s) => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);

  return (
    <div className="task-list-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingTask(null); setForm(emptyForm); }}>
          + New Task
        </button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {['ALL', ...STATUSES].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : statusLabel(s)}
          </button>
        ))}
      </div>

      {/* Task form modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Title *
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </label>
              <label>Description
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </label>
              <div className="form-row">
                <label>Status
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </label>
                <label>Priority
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
              </div>
              <label>Due Date
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setShowForm(false); setEditingTask(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task table */}
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks found. Create one to get started.</div>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                </td>
                <td>
                  <select
                    className={`status-select status--${task.status.toLowerCase().replace('_','-')}`}
                    value={task.status}
                    onChange={e => handleStatusChange(task.id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </td>
                <td>{priorityBadge(task.priority)} {task.priority}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => handleEdit(task)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaskList;
