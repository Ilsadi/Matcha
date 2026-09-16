const BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 10000;

let transport = (...args) => fetch(...args);

export function setTransport(fn) {
  transport = fn;
}

const STATUS_TO_CODE = {
  400: 'BAD_REQUEST',
  401: 'NOT_AUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  502: 'SERVER_UNAVAILABLE',
  503: 'SERVER_UNAVAILABLE',
  504: 'SERVER_UNAVAILABLE',
};

function makeError(code, message, fields = null, status = 0) {
  return { code, message, fields, status };
}

function normalizeErrorBody(body, status) {
  const fallbackCode = STATUS_TO_CODE[status] || 'INTERNAL_ERROR';

  if (body && typeof body === 'object' && body.error && typeof body.error === 'object') {
    return makeError(
      body.error.code || fallbackCode,
      body.error.message || 'Une erreur est survenue.',
      body.error.fields || null,
      status,
    );
  }

  if (body && typeof body === 'object' && typeof body.message === 'string') {
    let fields = null;

    if (Array.isArray(body.missingFields)) {
      fields = {};
      for (const name of body.missingFields) {
        fields[name] = 'Ce champ est requis.';
      }
    }

    return makeError(fallbackCode, body.message, fields, status);
  }

  return makeError(fallbackCode, 'Une erreur est survenue.', null, status);
}

async function readBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT_MS, signal } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const finalHeaders = { Accept: 'application/json', ...headers };
  let finalBody;

  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  let response;

  try {
    response = await transport(BASE_URL + path, {
      method,
      headers: finalHeaders,
      body: finalBody,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (cause) {
    clearTimeout(timeoutId);

    if (cause.name === 'AbortError') {
      return { ok: false, data: null, error: makeError('TIMEOUT', 'Le serveur met trop de temps à répondre.') };
    }

    return { ok: false, data: null, error: makeError('NETWORK_ERROR', 'Impossible de joindre le serveur.') };
  }

  clearTimeout(timeoutId);

  const parsed = await readBody(response);

  if (!response.ok) {
    return { ok: false, data: null, error: normalizeErrorBody(parsed, response.status) };
  }

  if (parsed === undefined) {
    return {
      ok: false,
      data: null,
      error: makeError('MALFORMED_RESPONSE', 'Réponse inattendue du serveur.', null, response.status),
    };
  }

  return { ok: true, data: parsed, error: null };
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

