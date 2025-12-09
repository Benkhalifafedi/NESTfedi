import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { FieldFilterInterceptor } from './interceptors/field-filter.interceptor';

@Controller('client/users')
@UseInterceptors(FieldFilterInterceptor)
export class ClientUsersController {
  constructor(private service: UsersService) {}

  @Get()
  listForClient() {
    // L’intercepteur ne laisse passer que id + email
    return this.service.findAll();
  }
}
