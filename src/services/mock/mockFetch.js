const LATENCY_MS = 300;
const VERIFY_TOKEN = 'verify-me';
const RESET_TOKEN = 'reset-me';

const COMMON_PASSWORDS = [
  'password', 'motdepasse', 'azerty', 'qwerty', 'iloveyou',
  '12345678', 'football', 'baseball', 'sunshine', 'princess',
];

const db = {
  users: [
    {
      id: 1,
      username: 'alice',
      email: 'alice@matcha.dev',
      password: 'Sup3rSecret!',
      firstName: 'Alice',
      lastName: 'Martin',
      isVerified: true,
      isProfileComplete: false,
      createdAt: '2026-01-12T09:00:00Z',
    },
    {
      id: 2,
      username: 'bob',
      email: 'bob@matcha.dev',
      password: 'Sup3rSecret!',
      firstName: 'Bob',
      lastName: 'Durand',
      isVerified: false,
      isProfileComplete: false,
      createdAt: '2026-02-03T14:30:00Z',
    },
  ],
  nextId: 3,
  session: null,
};

export const mockControl = {
  latency: LATENCY_MS,
  forceStatus: null,
  reset() {
    db.session = null;
    this.latency = LATENCY_MS;
    this.forceStatus = null;
  },
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function noContent() {
  return new Response(null, { status: 204 });
}

function fail(status, code, message, fields = null) {
  return json(status, { error: { code, message, fields } });
}

function validateRegistration(payload) {
  const fields = {};
  const email = String(payload.email || '').trim();
  const username = String(payload.username || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = 'Adresse e-mail invalide.';
  }
  if (username.length < 3 || username.length > 30) {
    fields.username = 'Entre 3 et 30 caractères.';
  } else if (!/^[a-z0-9_.-]+$/.test(username)) {
    fields.username = 'Lettres, chiffres, point, tiret ou underscore uniquement.';
  }
  if (password.length < 8) {
    fields.password = '8 caractères minimum.';
  } else if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    fields.password = 'Ce mot de passe est trop courant.';
  }
  if (!firstName) {
    fields.firstName = 'Le prénom est requis.';
  }
  if (!lastName) {
    fields.lastName = 'Le nom est requis.';
  }

  return { fields, email, username, password, firstName, lastName };
}

const routes = {
  'POST /auth/signup': (body) => {
    const { fields, email, username, password, firstName, lastName } = validateRegistration(body);

    if (Object.keys(fields).length > 0) {
      return fail(422, 'VALIDATION_FAILED', 'Certains champs sont invalides.', fields);
    }
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return fail(409, 'EMAIL_TAKEN', 'Cette adresse e-mail est déjà utilisée.');
    }
    if (db.users.some((u) => u.username === username)) {
      return fail(409, 'USERNAME_TAKEN', 'Ce nom d\'utilisateur est déjà pris.');
    }

    const user = {
      id: db.nextId++,
      username,
      email,
      password,
      firstName,
      lastName,
      isVerified: false,
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    return json(201, { user: publicUser(user) });
  },

  'POST /auth/signin': (body) => {
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = db.users.find((u) => u.username === username);

    if (!user || user.password !== password) {
      return fail(401, 'INVALID_CREDENTIALS', 'Nom d\'utilisateur ou mot de passe incorrect.');
    }
    if (!user.isVerified) {
      return fail(403, 'ACCOUNT_NOT_VERIFIED', 'Votre compte n\'est pas encore vérifié.');
    }

    db.session = user.id;
    return json(200, { user: publicUser(user) });
  },

  'POST /auth/logout': () => {
    db.session = null;
    return noContent();
  },

  'GET /auth/me': () => {
    const user = db.users.find((u) => u.id === db.session);

    if (!user) {
      return fail(401, 'NOT_AUTHENTICATED', 'Vous n\'êtes pas connecté.');
    }
    return json(200, { user: publicUser(user) });
  },

  'POST /auth/verify-email': (body) => {
    if (body.token !== VERIFY_TOKEN) {
      return fail(400, 'INVALID_TOKEN', 'Ce lien de vérification est invalide.');
    }
    const user = db.users.find((u) => !u.isVerified);

    if (user) {
      user.isVerified = true;
    }
    return noContent();
  },

  'POST /auth/forgot-password': () => noContent(),

  'POST /auth/reset-password': (body) => {
    if (body.token !== RESET_TOKEN) {
      return fail(400, 'INVALID_TOKEN', 'Ce lien de réinitialisation est invalide.');
    }
    if (String(body.password || '').length < 8) {
      return fail(422, 'VALIDATION_FAILED', 'Certains champs sont invalides.', {
        password: '8 caractères minimum.',
      });
    }
    return noContent();
  },
};

export async function mockFetch(url, options = {}) {
  await wait(mockControl.latency);

  if (options.signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  if (mockControl.forceStatus) {
    return fail(mockControl.forceStatus, 'INTERNAL_ERROR', 'Erreur simulée.');
  }

  const path = new URL(url, window.location.origin).pathname.replace(/^\/api/, '');
  const method = (options.method || 'GET').toUpperCase();
  const handler = routes[`${method} ${path}`];

  if (!handler) {
    return fail(404, 'NOT_FOUND', `Route non simulée : ${method} ${path}`);
  }

  let body = {};

  if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      return fail(400, 'BAD_REQUEST', 'JSON invalide.');
    }
  }

  return handler(body);
}