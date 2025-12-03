import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])  // VERY IMPORTANT
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
