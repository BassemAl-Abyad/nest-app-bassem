import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const user = this.getUserFromToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    req.user = user;
    return true;
  }

  private getUserFromToken(token: string): any {
    try {
      const payload = Buffer.from(token, 'base64').toString('utf8');
      const parsed = JSON.parse(payload) as { _id?: string; email?: string; role?: string };

      if (!parsed._id) {
        return null;
      }

      return {
        _id: parsed._id,
        email: parsed.email,
        role: parsed.role,
      };
    } catch {
      return null;
    }
  }
}
