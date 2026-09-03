const express = require('express');

const app = express();

app.use(express.json()); // Parse JSON bodies

// In-memory Todo data
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All - Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET Active Todos
app.get('/todos/active', (req, res) => {
  const activeTodos = todos.filter((todo) => !todo.completed);
  res.status(200).json(activeTodos);
});

// GET Completed Todos
app.get('/todos/completed', (req, res) => {
  const completedTodos = todos.filter((todo) => todo.completed);
  res.status(200).json(completedTodos);
});

// GET One Todo - Read
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({
      error: 'Todo not found'
    });
  }

  res.status(200).json(todo);
});

// POST New - Create
app.post('/todos', (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({
      error: 'Task is required'
    });
  }

  // Generate a new unique ID
  const newId =
    todos.length > 0
      ? Math.max(...todos.map((todo) => todo.id)) + 1
      : 1;

  const newTodo = {
    id: newId,
    task: task,
    completed: false
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// PUT Update - Full Update
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({
      error: 'Todo not found'
    });
  }

  const { task, completed } = req.body;

  if (task !== undefined) {
    todo.task = task;
  }

  if (completed !== undefined) {
    todo.completed = completed;
  }

  res.status(200).json(todo);
});

// PATCH Update - Partial Update
app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    return res.status(404).json({
      error: 'Todo not found'
    });
  }

  // Only allow task and completed to be updated
  const { task, completed } = req.body;

  if (task !== undefined) {
    todo.task = task;
  }

  if (completed !== undefined) {
    todo.completed = completed;
  }

  res.status(200).json(todo);
});

// DELETE Remove
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const initialLength = todos.length;

  todos = todos.filter((todo) => todo.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({
      error: 'Todo not found'
    });
  }

  res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Server error!'
  });
});

// Start server
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});