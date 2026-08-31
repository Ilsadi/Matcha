const express = require('express');

const app = express();
const PORT = 5000;

let users = [
  { id: 1,
    name: 'Alban',
    age: 25,
    city: 'Annecy' 
  },
  { id: 2,
    name: 'Bob',
    age: 30,
    city: 'Bordeaux'
  },
  { id: 3,
    name: 'Clemence',
    age: 35,
    city: 'Caen'
  }
];

const confirmServerIsRunning = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Le serveur est lancé avec succes.'
  });
}

const getUsers = (req, res) => {
  res.status(200).json(users)({
    status: "success",
    data: users
  })
};

app.get('/', confirmServerIsRunning);

app.get('/users', getUsers);

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
  console.log('Utilisateurs temporaires en mémoire :', users);
});
