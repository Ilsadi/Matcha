const users = require('../data/usersData');

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

  return res.status(200).json(filteredUsers);
};

const getUserById = (req, res) => {
  const userId = Number(req.params.id);
  const user = users.find((person) => person.id === userId);

  if (!user) {
    return res.status(404).json({
      message: 'Utilisateur non trouvé'
    });
  }

  return res.status(200).json(user);
};

const createUser = (req, res) => {
  const { name, age, city } = req.body;
  const missingFields = [];

  if (name === undefined || name === null || String(name).trim() === '') {
    missingFields.push('name');
  }

  if (age === undefined || age === null || String(age).trim() === '') {
    missingFields.push('age');
  }

  if (city === undefined || city === null || String(city).trim() === '') {
    missingFields.push('city');
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Informations manquantes pour créer un utilisateur.',
      missingFields
    });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name: String(name).trim(),
    age,
    city: String(city).trim()
  };

  users.push(newUser);

  return res.status(201).json(newUser);
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};
