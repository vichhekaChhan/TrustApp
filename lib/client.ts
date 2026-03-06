/**
 * client.ts – Central export point.
 * Set USE_MOCK = true to use mock data (no Supabase needed).
 * Set USE_MOCK = false to use real Supabase.
 */
export const USE_MOCK = true;

const api = USE_MOCK ? require('./api.mock') : require('./api');

export const auth: typeof import('./api').auth = api.auth;
export const profiles: typeof import('./api').profiles = api.profiles;
export const categories: typeof import('./api').categories = api.categories;
export const products: typeof import('./api').products = api.products;
export const sellers: typeof import('./api').sellers = api.sellers;
