// ===========================
//  TaskFlow – Storage Utility
// ===========================

const Storage = {
  TASKS_KEY: 'taskflow_tasks',
  PROJECTS_KEY: 'taskflow_projects',

  getTasks() {
    try {
      return JSON.parse(localStorage.getItem(this.TASKS_KEY)) || this.seedTasks();
    } catch { return []; }
  },

  saveTasks(tasks) {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  },

  addTask(task) {
    const tasks = this.getTasks();
    task.id = Date.now().toString();
    task.createdAt = new Date().toISOString();
    task.status = task.status || 'todo';
    tasks.unshift(task);
    this.saveTasks(tasks);
    return task;
  },

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      this.saveTasks(tasks);
      return tasks[idx];
    }
    return null;
  },

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  getProjects() {
    try {
      return JSON.parse(localStorage.getItem(this.PROJECTS_KEY)) || this.seedProjects();
    } catch { return []; }
  },

  saveProjects(projects) {
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  },

  addProject(project) {
    const projects = this.getProjects();
    project.id = Date.now().toString();
    project.createdAt = new Date().toISOString();
    projects.unshift(project);
    this.saveProjects(projects);
    return project;
  },

  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
  },

  // Seed data on first load
  seedTasks() {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

    const tasks = [
      { id: '1', title: 'Submit RFP Project Report', description: 'Complete and submit the web-based task management system project report.', priority: 'high', category: 'college', status: 'inprogress', dueDate: fmt(tomorrow), createdAt: new Date().toISOString() },
      { id: '2', title: 'Create UI Wireframes', description: 'Design wireframes for all pages.', priority: 'high', category: 'project', status: 'done', dueDate: fmt(yesterday), createdAt: new Date().toISOString() },
      { id: '3', title: 'Study for Database Exam', description: 'Cover ER diagrams and normalization topics.', priority: 'medium', category: 'college', status: 'todo', dueDate: fmt(nextWeek), createdAt: new Date().toISOString() },
      { id: '4', title: 'Push Project to GitHub', description: 'Initialize git repo and push all project files.', priority: 'high', category: 'project', status: 'todo', dueDate: fmt(today), createdAt: new Date().toISOString() },
      { id: '5', title: 'Read JavaScript Book', description: 'Chapters 8–12 on async/await.', priority: 'low', category: 'personal', status: 'todo', dueDate: fmt(nextWeek), createdAt: new Date().toISOString() },
      { id: '6', title: 'Team Meeting – Sprint Review', description: 'Review sprint progress with team.', priority: 'medium', category: 'college', status: 'done', dueDate: fmt(yesterday), createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    return tasks;
  },

  seedProjects() {
    const projects = [
      { id: '1', name: 'Task Management System', description: 'Web-based task management RFP project.', color: '#6c63ff', createdAt: new Date().toISOString() },
      { id: '2', name: 'College Assignments', description: 'All pending college assignments.', color: '#3b82f6', createdAt: new Date().toISOString() },
      { id: '3', name: 'Personal Goals', description: 'Self-improvement and personal development tasks.', color: '#22c55e', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    return projects;
  }
};

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const colors = { success: '#22c55e', error: '#ef4444', info: '#6c63ff' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== Modal helpers =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.getElementById('overlayBg').classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.getElementById('overlayBg').classList.remove('open');
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  document.getElementById('overlayBg').classList.remove('open');
}

// ===== Sidebar toggle =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== Format date =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T00:00:00') < new Date(new Date().toDateString());
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().split('T')[0];
}
