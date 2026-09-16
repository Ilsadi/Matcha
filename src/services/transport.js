import { setTransport } from './http.js';

const flag = import.meta.env.VITE_USE_MOCK;

export const USE_MOCK = flag === undefined ? true : flag === 'true';

export async function initTransport() {
  if (!USE_MOCK) {
    return;
  }

  const { mockFetch } = await import('./mock/mockFetch.js');

  setTransport(mockFetch);
}