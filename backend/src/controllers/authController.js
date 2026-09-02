const supabase = require('../config/supabase');

const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const validateRequiredFields = (payload, requiredFields) => {
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  return missingFields;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const normalizeUsername = (value) => {
  const username = sanitizeString(value).toLowerCase();
  return username;
};

const signUp = async (req, res) => {
  const { email, password, username, first_name, last_name } = req.body || {};
  const missingFields = validateRequiredFields({ email, password, username }, ['email', 'password', 'username']);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Les champs email, password et username sont requis.',
      missingFields
    });
  }

  const emailValue = sanitizeString(email);
  const passwordValue = String(password).trim();
  const usernameValue = normalizeUsername(username);
  const firstNameValue = sanitizeString(first_name);
  const lastNameValue = sanitizeString(last_name);

  if (!isValidEmail(emailValue)) {
    return res.status(400).json({
      message: 'L’email fourni est invalide.'
    });
  }

  if (passwordValue.length < 8) {
    return res.status(400).json({
      message: 'Le mot de passe doit contenir au moins 8 caractères.'
    });
  }

  if (!usernameValue || usernameValue.length < 3 || usernameValue.length > 30) {
    return res.status(400).json({
      message: 'Le username doit contenir entre 3 et 30 caractères.'
    });
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(usernameValue)) {
    return res.status(400).json({
      message: 'Le username ne doit contenir que des lettres, chiffres, points, tirets ou underscores.'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      message: 'Supabase n\'est pas configuré.'
    });
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', usernameValue)
    .maybeSingle();

  if (existingProfileError) {
    return res.status(500).json({
      message: 'Erreur lors de la vérification du username.',
      error: existingProfileError.message
    });
  }

  if (existingProfile) {
    return res.status(409).json({
      message: 'Ce username est déjà utilisé.'
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email: emailValue,
    password: passwordValue,
    options: {
      data: {
        username: usernameValue,
        first_name: firstNameValue,
        last_name: lastNameValue
      }
    }
  });

  if (error) {
    return res.status(400).json({
      message: error.message || 'Erreur lors de l\'inscription.'
    });
  }

  const userId = data?.user?.id;
  const profilePayload = {
    id: userId,
    username: usernameValue,
    email: emailValue,
    first_name: firstNameValue || null,
    last_name: lastNameValue || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (userId) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      return res.status(500).json({
        message: 'L\'inscription a réussi mais la création du profil a échoué.',
        error: profileError.message
      });
    }
  }

  return res.status(201).json({
    message: 'Inscription réussie.',
    user: data.user,
    session: data.session,
    profile: profilePayload
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
    email: sanitizeString(email),
    password: String(password).trim()
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
