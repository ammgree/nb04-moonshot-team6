
export const ACCESS_TOKEN_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_DAYS = 30 * 60 * 60 * 24 * 1000;
export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me_access_secret';
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'change_me_refresh_secret';

export const DEFAULT_PAGE = 1;
export const MIN_PAGESIZE = 1;
export const MAX_PAGESIZE = 10;
