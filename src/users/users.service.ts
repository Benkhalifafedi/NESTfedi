import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user/user.entity';
import { CreateUserDto } from './dto/create-user/create-user';
import { UpdateUserDto } from './dto/update-user/update-user';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: MongoRepository<User>,
  ) {}

  create(dto: CreateUserDto) {
    const user = this.repo.create({ ...dto, active: false });
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }

  findOneById(id: string) {
    return this.repo.findOneBy({ _id: new ObjectId(id) });
  }

  findOneByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  findActive() {
    return this.repo.findBy({ active: true });
  }

  update(id: string, dto: UpdateUserDto) {
    return this.repo.update({ _id: new ObjectId(id) }, dto);
  }

  remove(id: string) {
    return this.repo.delete({ _id: new ObjectId(id) });
  }

  async activate(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    if (!user) return 'User not found';
    if (user.password !== password) return 'Wrong password';

    user.active = true;
    await this.repo.save(user);

    return 'User activated';
  }
}
