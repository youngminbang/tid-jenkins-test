const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for todos
let todos = [
  { id: 1, text: '할 일 추가하기', completed: false },
  { id: 2, text: '할 일 완료 표시하기', completed: false }
];
let nextId = 3;

// API Routes
// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: '할 일 내용을 입력해주세요.' });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Toggle todo completion
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
  }

  todo.completed = !todo.completed;
  res.json(todo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '할 일을 찾을 수 없습니다.' });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Todo 앱 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
