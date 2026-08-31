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
  const { city } = req.query;

  if (!city) {
    return res.status(200).json(users);
  }

  const cities = Array.isArray(city) ? city : [city];
  const normalizedCities = cities.map((item) => item.toLowerCase());

  const filteredUsers = users.filter((user) =>
    normalizedCities.includes(user.city.toLowerCase())
  );

  res.status(200).json(filteredUsers);
};

const getUserById = (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find((person) => person.id === userId);

  if (!user) {
    return res.status(404).json({
      message: 'Utilisateur non trouvé'
    });
  }

  res.status(200).json(user);
};

app.get('/', confirmServerIsRunning);

app.get('/users', getUsers);
app.get('/users/:id', getUserById);

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
  console.log('Utilisateurs temporaires en mémoire :', users);
});
