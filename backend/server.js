const express = require('express');

const app = express();
const PORT = 5000;

const confirmServerIsRunning = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Le serveur est lancé avec succes.'
  });
}

app.get('/', confirmServerIsRunning);

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});
