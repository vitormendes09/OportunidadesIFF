// Separado de session.ts para que proxy.ts (Node.js runtime, sem DOM) possa importar
// só o nome do cookie sem arrastar a dependência js-cookie (que assume `document`).
export const SESSION_COOKIE_NAME = 'oiff_token';
