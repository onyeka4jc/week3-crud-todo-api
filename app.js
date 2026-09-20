const express = require('express');
const Joi = require('joi');

const app = express();

// Joi validation schemas
const createTodoSchema = Joi.object({
  task: Joi.string().min(3).required()
});

const updateTodoSchema = Joi.object({
  task: Joi.string().min(3),
  completed: Joi.boolean()
}).min(1);

// Logging middleware - runs for every request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  next();
});

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
app.post('/todos', (req, res, next) => {
  try {
    const { error, value } = createTodoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const { task } = value;

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
  } catch (error) {
    next(error);
  }
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
app.patch('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const todo = todos.find((todo) => todo.id === id);

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    const { error, value } = updateTodoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const { task, completed } = value;

    if (task !== undefined) {
      todo.task = task;
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
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