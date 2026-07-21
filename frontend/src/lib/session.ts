import Cookies from 'js-cookie';
import { SESSION_COOKIE_NAME } from './session-constants';

// Cookie (não httpOnly) em vez de localStorage: o token vem de um backend em outra
// origem (NestJS em :3001), então só o frontend pode gravá-lo, via JS, após o login.
// Usar cookie (e não localStorage) permite que um Proxy/Server Component do Next
// leia a sessão no futuro sem precisar de round-trip ao cliente.
export { SESSION_COOKIE_NAME };

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 1, // 1 dia — alinhado a JWT_EXPIRES_IN=1d do backend
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  path: '/',
};

export function setSessionToken(token: string): void {
  Cookies.set(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function getSessionToken(): string | undefined {
  return Cookies.get(SESSION_COOKIE_NAME);
}

export function clearSessionToken(): void {
  Cookies.remove(SESSION_COOKIE_NAME, { path: '/' });
}
