const supabase = require('../config/supabase');

const parseUserId = (value) => {
  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  return userId;
};

const validateRequiredFields = (payload, requiredFields) => {
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  return missingFields;
};

const validateAge = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  const ageNumber = Number(value);
  return Number.isInteger(ageNumber) && ageNumber > 0;
};

const isSupabaseConfigured = () => Boolean(supabase);

const getUsers = async (req, res) => {
  const { city } = req.query;

  if (!isSupabaseConfigured()) {
    if (!city) {
      return res.status(200).json(users);
    }

    const cities = Array.isArray(city) ? city : [city];
    const normalizedCities = cities.map((item) => item.toLowerCase());

    const filteredUsers = users.filter((user) =>
      normalizedCities.includes(user.city.toLowerCase())
    );

    return res.status(200).json(filteredUsers);
  }

  let query = supabase.from('users').select('*');

  if (city) {
    query = query.ilike('city', String(city));
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({
      message: 'Erreur de récupération des utilisateurs.',
      error: error.message
    });
  }

  return res.status(200).json(data);
};

const getUserById = async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: 'L’identifiant utilisateur est invalide. Il doit être un nombre entier positif.'
    });
  }

  if (!isSupabaseConfigured()) {
    const user = users.find((person) => person.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    return res.status(200).json(user);
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  return res.status(200).json(data);
};

const createUser = async (req, res) => {
  const { name, age, city } = req.body || {};
  const missingFields = validateRequiredFields({ name, age, city }, ['name', 'age', 'city']);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Informations manquantes pour créer un utilisateur.',
      missingFields
    });
  }

  if (!validateAge(age)) {
    return res.status(400).json({
      message: 'L’age doit être un nombre entier positif.'
    });
  }

  const normalizedUser = {
    name: String(name).trim(),
    age: Number(age),
    city: String(city).trim()
  };

  if (!isSupabaseConfigured()) {
    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      ...normalizedUser
    };

    users.push(newUser);
    return res.status(201).json(newUser);
  }

  const { data, error } = await supabase
    .from('users')
    .insert([normalizedUser])
    .select()
    .single();

  if (error) {
    return res.status(400).json({
      message: 'Erreur lors de la création de l’utilisateur.',
      error: error.message
    });
  }

  return res.status(201).json(data);
};

const deleteUserById = async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: 'L’identifiant utilisateur est invalide. Il doit être un nombre entier positif.'
    });
  }

  if (!isSupabaseConfigured()) {
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const [deletedUser] = users.splice(userIndex, 1);
    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès.',
      deletedUser
    });
  }

  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  return res.status(200).json({
    message: 'Utilisateur supprimé avec succès.',
    deletedUser: data
  });
};

const updateUserById = async (req, res) => {
  const userId = parseUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({
      message: 'L’identifiant utilisateur est invalide. Il doit être un nombre entier positif.'
    });
  }

  const { name, age, city } = req.body || {};
  const missingFields = validateRequiredFields({ name, age, city }, ['name', 'age', 'city']);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Informations manquantes pour mettre à jour l’utilisateur.',
      missingFields
    });
  }

  if (!validateAge(age)) {
    return res.status(400).json({
      message: 'L’age doit être un nombre entier positif.'
    });
  }

  const updatedData = {
    name: String(name).trim(),
    age: Number(age),
    city: String(city).trim()
  };

  if (!isSupabaseConfigured()) {
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updatedData
    };

    return res.status(200).json({
      message: 'Utilisateur mis à jour avec succès.',
      user: users[userIndex]
    });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updatedData)
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  return res.status(200).json({
    message: 'Utilisateur mis à jour avec succès.',
    user: data
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
  parseUserId,
  validateRequiredFields,
  validateAge,
  isSupabaseConfigured
};
