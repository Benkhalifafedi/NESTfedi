import {
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FieldFilterInterceptor } from './interceptors/field-filter.interceptor';

@Controller('admin/users')
@UseInterceptors(FieldFilterInterceptor)
export class AdminUsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAllAdmin() {
    return this.service.findAll();
  }

  @Get('not-updated-6-months')
  notUpdatedSince6Months() {
    return this.service.notUpdatedSince6Months();
  }

  @Get('by-domain')
  findByDomain(@Query('domain') domain: string) {
    return this.service.findByDomain(domain);
  }

  @Get('created-last-7-days')
  createdLast7Days() {
    return this.service.createdLast7Days();
  }

  @Get('count-by-role')
  countByRole() {
    return this.service.countByRole();
  }

  @Get('created-between')
  createdBetween(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.service.createdBetween(new Date(start), new Date(end));
  }

  @Get('recent')
  recent(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 5;
    return this.service.recentUsers(n);
  }

  @Get('average-days')
  averageDays() {
    return this.service.averageDaysBetweenCreationAndUpdate();
  }

  @Get('page')
  paginate(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.service.paginate(parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('sorted')
  sorted() {
    return this.service.sortByCreated(true);
  }

  @Get('sorted-multi')
  sortedMulti() {
    return this.service.sortByRoleThenCreated();
  }

  @Get('disable-inactive')
  disableInactive() {
    return this.service.disableInactiveSinceOneYear();
  }

  @Get('update-role-by-domain')
  updateRoleByDomain(
    @Query('domain') domain: string,
    @Query('role') role: 'admin' | 'client',
  ) {
    return this.service.updateRoleByDomain(domain, role);
  }
}
