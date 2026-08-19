import jwt from 'jsonwebtoken';
import { ITokenService, AuthTokenPayload } from './ITokenService.js';

export class JwtTokenService implements ITokenService {
  constructor(private readonly secret: string) {}

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verify(token: string): AuthTokenPayload {
    return jwt.verify(token, this.secret) as AuthTokenPayload;
  }
}
