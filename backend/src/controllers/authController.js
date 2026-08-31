const supabase = require('../config/supabase');

const signUp = async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email et mot de passe sont requis.'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      message: 'Supabase n\'est pas configuré.'
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || ''
      }
    }
  });

  if (error) {
    return res.status(400).json({
      message: error.message || 'Erreur lors de l\'inscription.'
    });
  }

  return res.status(201).json({
    message: 'Inscription réussie.',
    user: data.user,
    session: data.session
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email et mot de passe sont requis.'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      message: 'Supabase n\'est pas configuré.'
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({
      message: error.message || 'Identifiants invalides.'
    });
  }

  return res.status(200).json({
    message: 'Connexion réussie.',
    user: data.user,
    session: data.session
  });
};

module.exports = {
  signUp,
  signIn
};
