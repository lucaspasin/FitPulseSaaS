import { Role } from '../domain/types.js';

export interface AuthTokenPayload {
  userId: string;
  role: Role;
  gymId?: string;
}

export interface ITokenService {
  sign(payload: AuthTokenPayload): string;
  verify(token: string): AuthTokenPayload;
}
