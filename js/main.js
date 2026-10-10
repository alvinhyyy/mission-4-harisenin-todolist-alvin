"use strict";

// Elemen
const taskForm = document.querySelector("#task-form");
const taskText = document.querySelector("#task-text");
const taskPriority = document.querySelector("#task-priority");
const dateFilter = document.querySelector("#date-filter");
const todoList = document.querySelector("#todo-list");
const doneList = document.querySelector("#done-list");
const deleteAllButton = document.querySelector("#delete-all");
const taskTemplate = document.querySelector("#task-template");
const profileName = document.querySelector("#profile-name");
const profileRole = document.querySelector("#profile-role");
const statusMessage = document.querySelector("#status-message");

// Data
let tasks = [];
let profile = { name: "", role: "" };

try {
  const savedTasks = JSON.parse(localStorage.getItem("tasks"));
  const savedProfile = JSON.parse(localStorage.getItem("profile"));
  if (Array.isArray(savedTasks)) tasks = savedTasks;
  if (savedProfile) profile = savedProfile;
} catch {
  statusMessage.textContent = "Data tersimpan tidak dapat dibaca.";
}

// Tanggal
function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Simpan Data
function saveData() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("profile", JSON.stringify(profile));
  } catch {
    statusMessage.textContent = "Data belum dapat disimpan di browser.";
  }
}

// Tampilkan Tugas
function renderTasks() {
  todoList.replaceChildren();
  doneList.replaceChildren();

  const filteredTasks = tasks.filter((task) => task.date === dateFilter.value);

  filteredTasks.forEach((task) => {
    const item = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector(".task-checkbox");
    const badge = item.querySelector(".badge");
    const date = item.querySelector(".task-date");
    const deleteButton = item.querySelector(".delete-task");

    item.querySelector(".task-title").textContent = task.text;
    item.classList.toggle("is-done", task.done);
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Selesai: ${task.text}`);
    badge.textContent = task.priority[0].toUpperCase() + task.priority.slice(1);
    badge.classList.add(task.priority);
    date.textContent = formatDate(task.date);
    date.dateTime = task.date;
    deleteButton.setAttribute("aria-label", `Hapus: ${task.text}`);

    // Status Tugas
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      statusMessage.textContent = task.done ? "Tugas selesai." : "Tugas kembali ke To Do.";
      saveData();
      renderTasks();
    });

    // Hapus Tugas
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
      statusMessage.textContent = "Tugas dihapus.";
      saveData();
      renderTasks();
    });

    if (task.done) {
      doneList.append(item);
    } else {
      todoList.append(item);
    }
  });

  document.querySelector("#todo-count").textContent = todoList.children.length;
  document.querySelector("#done-count").textContent = doneList.children.length;
  document.querySelector("#todo-empty").hidden = todoList.children.length > 0;
  document.querySelector("#done-empty").hidden = doneList.children.length > 0;
  deleteAllButton.disabled = tasks.length === 0;
}

// Tambah Tugas
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskText.value.trim();

  if (!text) {
    taskText.setCustomValidity("Tulis tugas terlebih dahulu.");
    taskText.reportValidity();
    return;
  }

  const today = getToday();
  tasks.push({
    id: crypto.randomUUID(),
    text: text,
    priority: taskPriority.value,
    date: today,
    done: false,
  });

  dateFilter.value = today;
  taskForm.reset();
  statusMessage.textContent = "Tugas ditambahkan.";
  saveData();
  renderTasks();
  taskText.focus();
});

taskText.addEventListener("input", () => taskText.setCustomValidity(""));

// Filter Tanggal
dateFilter.addEventListener("change", renderTasks);

// Hapus Semua
deleteAllButton.addEventListener("click", () => {
  if (!confirm("Hapus seluruh tugas To Do dan Done dari semua tanggal?")) return;
  tasks = [];
  statusMessage.textContent = "Seluruh tugas dihapus.";
  saveData();
  renderTasks();
});

// Profil
function saveProfile() {
  profile.name = profileName.value.trim();
  profile.role = profileRole.value.trim();
  saveData();
}

profileName.addEventListener("input", saveProfile);
profileRole.addEventListener("input", saveProfile);

// Inisialisasi
document.querySelector("#current-date").textContent = formatDate(getToday());
dateFilter.value = getToday();
profileName.value = profile.name;
profileRole.value = profile.role;
renderTasks();
