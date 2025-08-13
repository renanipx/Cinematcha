const express = require('express');
const cors = require('cors');
const config = require('./config/env.config');
const suggestRouter = require('./modules/suggest/controller/suggest.controller');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Routes
app.use('/suggest', suggestRouter);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});