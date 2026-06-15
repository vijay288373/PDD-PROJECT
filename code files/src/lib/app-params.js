// app-params.js — stubbed for local development.
// Base44 app params are not needed when running without the Base44 server.
export const appParams = {
  appId: 'local',
  token: null,
  functionsVersion: null,
  appBaseUrl: '/',
  fromUrl: typeof window !== 'undefined' ? window.location.href : '/',
};
