import bcrypt from 'bcryptjs';
import { IPasswordHasher } from './IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly rounds = 10) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    if (!hash.startsWith('$2')) {
      return Promise.resolve(plain === hash);
    }
    return bcrypt.compare(plain, hash);
  }
}
