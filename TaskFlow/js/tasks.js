// ===========================
//  TaskFlow – Tasks Page JS
// ===========================

let filters = { status: 'all', priority: 'all' };
let currentView = 'list';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('taskDate').value = new Date().toISOString().split('T')[0];
  filterTasks();
});

function setFilter(type, val, btn) {
  filters[type] = val;
  const group = type === 'status' ? 'statusFilter' : 'priorityFilter';
  document.querySelectorAll(`#${group} .ftab`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterTasks();
}

function filterTasks() {
  let tasks = Storage.getTasks();
  const q = document.getElementById('taskSearch').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortBy').value;

  if (q) tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
  if (filters.status !== 'all') tasks = tasks.filter(t => t.status === filters.status);
  if (filters.priority !== 'all') tasks = tasks.filter(t => t.priority === filters.priority);
  if (cat !== 'all') tasks = tasks.filter(t => t.category === cat);

  const pOrder = { high: 0, medium: 1, low: 2 };
  if (sort === 'oldest') tasks = tasks.reverse();
  else if (sort === 'duedate') tasks.sort((a,b) => (a.dueDate||'9999') > (b.dueDate||'9999') ? 1 : -1);
  else if (sort === 'priority') tasks.sort((a,b) => pOrder[a.priority] - pOrder[b.priority]);

  document.getElementById('taskCountLabel').textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`;
  renderTasks(tasks);
}

function setView(v) {
  currentView = v;
  document.getElementById('listViewBtn').classList.toggle('active', v === 'list');
  document.getElementById('gridViewBtn').classList.toggle('active', v === 'grid');
  filterTasks();
}

function renderTasks(tasks) {
  const container = document.getElementById('tasksContainer');
  container.className = currentView === 'grid' ? 'tasks-grid-view' : 'tasks-list-view';

  if (!tasks.length) {
    container.innerHTML = `<div class="empty-state" style="padding:3rem"><i class="fa-solid fa-inbox"></i><p>No tasks match your filters.</p></div>`;
    return;
  }

  if (currentView === 'list') {
    container.innerHTML = tasks.map(t => `
      <div class="task-row ${t.status === 'done' ? 'completed' : ''}">
        <div class="task-check2 ${t.status === 'done' ? 'checked' : ''}" onclick="toggleTask('${t.id}')">
          ${t.status === 'done' ? '<i class="fa-solid fa-check"></i>' : ''}
        </div>
        <div style="flex:1;min-width:0">
          <div class="tr-title ${t.status === 'done' ? 'striked' : ''}">${escapeHtml(t.title)}</div>
          ${t.description ? `<div class="tr-desc">${escapeHtml(t.description)}</div>` : ''}
        </div>
        <div class="tr-badges">
          <span class="badge badge-${t.priority}">${t.priority}</span>
          <span class="badge badge-${t.category}">${t.category}</span>
          <span class="badge badge-${t.status}">${t.status === 'inprogress' ? 'In Progress' : t.status === 'todo' ? 'To Do' : 'Done'}</span>
        </div>
        <div class="tr-date ${isOverdue(t.dueDate) && t.status !== 'done' ? 'overdue' : ''}">
          ${t.dueDate ? `<i class="fa-regular fa-calendar"></i> ${formatDate(t.dueDate)}` : ''}
        </div>
        <div class="tr-actions">
          <button onclick="editTask('${t.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="del-btn" onclick="deleteTask('${t.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `).join('');
  } else {
    container.innerHTML = tasks.map(t => `
      <div class="task-card ${t.status === 'done' ? 'completed' : ''}">
        <div class="tc-top">
          <div class="tc-title ${t.status === 'done' ? 'striked' : ''}">${escapeHtml(t.title)}</div>
          <span class="badge badge-${t.priority}" style="margin-left:8px;flex-shrink:0">${t.priority}</span>
        </div>
        ${t.description ? `<div class="tc-desc">${escapeHtml(t.description)}</div>` : ''}
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <span class="badge badge-${t.category}">${t.category}</span>
          <span class="badge badge-${t.status}">${t.status === 'inprogress' ? 'In Progress' : t.status === 'todo' ? 'To Do' : 'Done'}</span>
        </div>
        <div class="tc-footer">
          <span class="tr-date ${isOverdue(t.dueDate) && t.status !== 'done' ? 'overdue' : ''}">
            ${t.dueDate ? `<i class="fa-regular fa-calendar"></i> ${formatDate(t.dueDate)}` : 'No due date'}
          </span>
          <div class="tc-actions">
            <button class="btn-ghost" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="toggleTask('${t.id}')">
              ${t.status === 'done' ? 'Undo' : 'Done'}
            </button>
            <button class="btn-ghost" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="editTask('${t.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-danger" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="deleteTask('${t.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function toggleTask(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  Storage.updateTask(id, { status: task.status === 'done' ? 'todo' : 'done' });
  filterTasks();
  showToast(task.status !== 'done' ? 'Task completed! 🎉' : 'Task marked pending.', 'success');
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  Storage.deleteTask(id);
  filterTasks();
  showToast('Task deleted.', 'info');
}

function editTask(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  document.getElementById('editTaskId').value = id;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDesc').value = task.description || '';
  document.getElementById('taskDate').value = task.dueDate || '';
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskCategory').value = task.category;
  document.getElementById('taskStatus').value = task.status;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  openModal('addTaskModal');
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { showToast('Please enter a task title.', 'error'); return; }
  const editId = document.getElementById('editTaskId').value;
  const data = {
    title,
    description: document.getElementById('taskDesc').value.trim(),
    dueDate: document.getElementById('taskDate').value,
    priority: document.getElementById('taskPriority').value,
    category: document.getElementById('taskCategory').value,
    status: document.getElementById('taskStatus').value,
  };
  if (editId) {
    Storage.updateTask(editId, data);
    showToast('Task updated!', 'success');
  } else {
    Storage.addTask(data);
    showToast('Task added!', 'success');
  }
  document.getElementById('editTaskId').value = '';
  document.getElementById('modalTitle').textContent = 'Add New Task';
  closeModal('addTaskModal');
  filterTasks();
}

function escapeHtml(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
