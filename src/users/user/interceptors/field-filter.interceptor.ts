import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FieldFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const role = (req.headers['role'] as string) || 'client';

    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((u) => this.filterUser(u, role));
        }
        return this.filterUser(data, role);
      }),
    );
  }

  private filterUser(user: any, role: string) {
    if (!user) return user;

    const id = user._id ?? user.id;

    if (role === 'admin') {
      // Pour admin: id, email, role, createdAt, updatedAt
      return {
        id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    // Pour client: seulement id + email
    return {
      id,
      email: user.email,
    };
  }
}
