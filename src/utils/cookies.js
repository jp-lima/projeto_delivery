import crypto from 'crypto';

const isDev = process.env.NODE_ENV === 'development';

const baseOptions = {
  secure: !isDev,
  sameSite: isDev ? 'lax' : 'none',
};

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';
export const CSRF_COOKIE = 'csrf_token';

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    httpOnly: true,
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });


  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    httpOnly: true,
    path: '/auth',
    maxAge: REFRESH_MAX_AGE,
  });

  // tem q mandar no header (lembrar)
  const csrfToken = crypto.randomBytes(32).toString('hex')
  res.cookie(CSRF_COOKIE, csrfToken, {
    ...baseOptions,
    httpOnly: false,
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });

  return csrfToken
}


export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions, httpOnly: true, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions, httpOnly: true, path: '/auth' });
  res.clearCookie(CSRF_COOKIE, { ...baseOptions, httpOnly: false, path: '/' });
}