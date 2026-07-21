import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  sign(payload: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  verify(token: string): Record<string, unknown> | null {
    try {
      return JSON.parse(Buffer.from(token, 'base64').toString('utf8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
