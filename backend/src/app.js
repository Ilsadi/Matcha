const express = require('express');
const usersRouter = require('./routers/usersRouter');

const app = express();

app.use(express.json());

const confirmServerIsRunning = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Le serveur est lancé avec succes.'
  });
};

app.get('/', confirmServerIsRunning);
app.use('/users', usersRouter);

module.exports = app;
