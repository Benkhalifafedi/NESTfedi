import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user/create-user';
import { UpdateUserDto } from '../dto/update-user/update-user';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneById(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.service.findOneByEmail(email);
  }

  @Get('active/list')
  getActive() {
    return this.service.findActive();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Put('activate')
  activate(@Body() body: { email: string; password: string }) {
    return this.service.activate(body.email, body.password);
  }
}
