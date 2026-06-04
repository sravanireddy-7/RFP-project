// ===========================
//  TaskFlow – Dashboard Logic
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (q.length > 1) {
      const results = Storage.getTasks().filter(t => t.title.toLowerCase().includes(q));
      renderTaskList('recentTasksList', results.slice(0, 5));
    } else {
      renderDashboard();
    }
  });

  // Set default date for task modal
  document.getElementById('taskDate').value = new Date().toISOString().split('T')[0];
});

function renderDashboard() {
  const tasks = Storage.getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length;

  // Stats
  document.getElementById('totalTasks').textContent = total;
  document.getElementById('doneTasks').textContent = done;
  document.getElementById('inProgressTasks').textContent = inProgress;
  document.getElementById('overdueTasks').textContent = overdue;
  document.getElementById('doneBar').style.width = total ? `${(done/total)*100}%` : '0%';
  document.getElementById('progressBar').style.width = total ? `${(inProgress/total)*100}%` : '0%';
  document.getElementById('overdueBar').style.width = total ? `${(overdue/total)*100}%` : '0%';

  // Priority bars
  const high = tasks.filter(t => t.priority === 'high').length;
  const med = tasks.filter(t => t.priority === 'medium').length;
  const low = tasks.filter(t => t.priority === 'low').length;
  document.getElementById('highCount').textContent = high;
  document.getElementById('medCount').textContent = med;
  document.getElementById('lowCount').textContent = low;
  document.getElementById('highBar').style.width = total ? `${(high/total)*100}%` : '0%';
  document.getElementById('medBar').style.width = total ? `${(med/total)*100}%` : '0%';
  document.getElementById('lowBar').style.width = total ? `${(low/total)*100}%` : '0%';

  // Recent tasks (last 5)
  renderTaskList('recentTasksList', tasks.slice(0, 5));

  // Today's tasks
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  renderTaskList('todayTasksList', todayTasks);
}

function renderTaskList(containerId, tasks) {
  const container = document.getElementById(containerId);
  if (!tasks.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>No tasks here.</p></div>`;
    return;
  }
  container.innerHTML = tasks.map(task => `
    <div class="task-item ${task.status === 'done' ? 'completed' : ''}" id="ti-${task.id}">
      <div class="task-check ${task.status === 'done' ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
        ${task.status === 'done' ? '<i class="fa-solid fa-check"></i>' : ''}
      </div>
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="badge badge-${task.priority}">${task.priority}</span>
          <span class="badge badge-${task.category}" style="margin-left:4px">${task.category}</span>
          ${task.dueDate ? `<span style="margin-left:6px;font-size:0.73rem;color:${isOverdue(task.dueDate) && task.status!=='done'?'#ef4444':'var(--text-muted)'}"><i class="fa-regular fa-calendar" style="margin-right:3px"></i>${formatDate(task.dueDate)}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button onclick="deleteTaskItem('${task.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function toggleTask(id) {
  const task = Storage.getTasks().find(t => t.id === id);
  if (!task) return;
  const newStatus = task.status === 'done' ? 'todo' : 'done';
  Storage.updateTask(id, { status: newStatus });
  renderDashboard();
  showToast(newStatus === 'done' ? 'Task completed! 🎉' : 'Task marked as pending.', newStatus === 'done' ? 'success' : 'info');
}

function deleteTaskItem(id) {
  Storage.deleteTask(id);
  renderDashboard();
  showToast('Task deleted.', 'info');
}

function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { showToast('Please enter a task title.', 'error'); return; }
  Storage.addTask({
    title,
    description: document.getElementById('taskDesc').value.trim(),
    dueDate: document.getElementById('taskDate').value,
    priority: document.getElementById('taskPriority').value,
    category: document.getElementById('taskCategory').value,
    status: 'todo'
  });
  closeModal('addTaskModal');
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  renderDashboard();
  showToast('Task added successfully!', 'success');
}

function quickAddTask() {
  const title = document.getElementById('quickTitle').value.trim();
  if (!title) { showToast('Enter a task title.', 'error'); return; }
  Storage.addTask({
    title,
    priority: document.getElementById('quickPriority').value,
    category: 'general',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0]
  });
  document.getElementById('quickTitle').value = '';
  renderDashboard();
  showToast('Task added!', 'success');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
