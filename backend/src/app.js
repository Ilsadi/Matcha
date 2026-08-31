const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const usersRouter = require('./routers/usersRouter');
const authRouter = require('./routers/authRouter');

const app = express();

app.use(express.json());

const confirmServerIsRunning = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Le serveur est lancé avec succes.'
  });
};

app.get('/', confirmServerIsRunning);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route non trouvée.'
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Le JSON envoyé est invalide.'
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Erreur interne du serveur.'
  });
});

module.exports = app;
