const supabase = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({
      message: 'Supabase n\'est pas configuré.'
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token d\'authentification manquant.'
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({
      message: 'Session invalide ou expirée.'
    });
  }

  req.user = data.user;
  return next();
};

module.exports = {
  requireAuth
};
