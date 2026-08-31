const users = require('../data/users');

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

module.exports = {
  getUsers,
  getUserById
};
