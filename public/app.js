// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
});

// Load todos from server
async function loadTodos() {
    try {
        const response = await fetch('/api/todos');
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('할 일을 불러오는데 실패했습니다:', error);
    }
}

// Add new todo
async function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            todoInput.value = '';
            renderTodos();
        }
    } catch (error) {
        console.error('할 일 추가에 실패했습니다:', error);
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT'
        });

        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        }
    } catch (error) {
        console.error('할 일 상태 변경에 실패했습니다:', error);
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        }
    } catch (error) {
        console.error('할 일 삭제에 실패했습니다:', error);
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
        </li>
    `).join('');

    updateStats();
}

// Update statistics
function updateStats() {
    const activeTodos = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${activeTodos}개의 할 일`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
