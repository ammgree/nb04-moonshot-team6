import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS } from './constants.js';


export function signAccessToken(payload: object) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export function signRefreshToken(payload: object) {
    // refresh token에 만료일을 명시적으로 두는 방식
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}` });
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}