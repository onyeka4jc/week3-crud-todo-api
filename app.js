require('dotenv').config();

const express = require('express');
const Joi = require('joi');
const connectDB = require('./db');
const Todo = require('./models/Todo');

const app = express();

// Joi validation schemas
const createTodoSchema = Joi.object({
  task: Joi.string().min(3).required()
});

const updateTodoSchema = Joi.object({
  task: Joi.string().min(3),
  completed: Joi.boolean()
}).min(1);

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  next();
});

// Parse JSON bodies
app.use(express.json());

/*
  GET All Todos
  Also supports:
  GET /todos?completed=false
  GET /todos?completed=true
*/
app.get('/todos', async (req, res, next) => {
  try {
    const { completed } = req.query;

    let filter = {};

    if (completed !== undefined) {
      if (completed !== 'true' && completed !== 'false') {
        return res.status(400).json({
          error: 'completed must be true or false'
        });
      }

      filter.completed = completed === 'true';
    }

    const todos = await Todo.find(filter);

    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
});

// GET Active Todos
app.get('/todos/active', async (req, res, next) => {
  try {
    const activeTodos = await Todo.find({ completed: false });

    res.status(200).json(activeTodos);
  } catch (error) {
    next(error);
  }
});

// GET Completed Todos
app.get('/todos/completed', async (req, res, next) => {
  try {
    const completedTodos = await Todo.find({ completed: true });

    res.status(200).json(completedTodos);
  } catch (error) {
    next(error);
  }
});

// GET One Todo
app.get('/todos/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

// POST New Todo
app.post('/todos', async (req, res, next) => {
  try {
    const { error, value } = createTodoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const todo = await Todo.create({
      task: value.task
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

// PUT Update Todo
app.put('/todos/:id', async (req, res, next) => {
  try {
    const { error, value } = updateTodoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true
      }
    );

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

// PATCH Partial Update
app.patch('/todos/:id', async (req, res, next) => {
  try {
    const { error, value } = updateTodoSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true
      }
    );

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
});

// DELETE Todo
app.delete('/todos/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({
        error: 'Todo not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
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

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();