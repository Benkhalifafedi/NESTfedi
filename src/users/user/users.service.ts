import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from '../dto/create-user/create-user';
import { UpdateUserDto } from '../dto/update-user/update-user';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: MongoRepository<User>,
  ) {}

  // -----------------------------
  // CRUD + activation
  // -----------------------------
  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('Email already used');
    }

    const user = this.repo.create({
      email: dto.email,
      password: dto.password,
      role: dto.role ?? 'client',
      active: false,
    });

    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }

  findOneById(id: string) {
    return this.repo.findOneBy({
      _id: new ObjectId(id) as any,
    });
  }

  findOneByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }

  findActive() {
    return this.repo.find({
      where: { active: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const before = { ...user };
    Object.assign(user, dto);

    const saved = await this.repo.save(user);

    // Journalisation simple dans la console
    // (tu peux remplacer par un vrai logger)
    // eslint-disable-next-line no-console
    console.log('Before update:', before);
    // eslint-disable-next-line no-console
    console.log('After update:', saved);

    return saved;
  }

  async remove(id: string) {
    return this.repo.delete({
      _id: new ObjectId(id) as any,
    });
  }

  async activate(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    if (!user) return 'User not found';
    if (user.password !== password) return 'Wrong password';

    user.active = true;
    await this.repo.save(user);

    return 'User activated';
  }

  // -----------------------------
  // Atelier – Requêtes complexes
  // -----------------------------

  // 1) Utilisateurs non mis à jour depuis plus de 6 mois
  async notUpdatedSince6Months() {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);

    return this.repo.find({
      where: {
        updatedAt: { $lt: date } as any,
      },
    });
  }

  // 2) Email appartenant à un domaine spécifique
  async findByDomain(domain: string) {
    const regex = new RegExp(`@${domain}$`, 'i');
    return this.repo.find({
      where: {
        email: { $regex: regex } as any,
      },
    });
  }

  // 3) Créés durant les 7 derniers jours
  async createdLast7Days() {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    return this.repo.find({
      where: {
        createdAt: { $gte: date } as any,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // -----------------------------
  // Atelier – Statistiques / agrégations Mongo
  // -----------------------------

  // 4) Compter les utilisateurs par rôle
  async countByRole() {
    const cursor = this.repo.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    return cursor.toArray();
  }

  // 5) Utilisateurs créés entre deux dates
  async createdBetween(start: Date, end: Date) {
    return this.repo.find({
      where: {
        createdAt: {
          $gte: start as any,
          $lte: end as any,
        },
      },
      order: { createdAt: 'ASC' },
    });
  }

  // 6) Utilisateurs les plus récents (par createdAt)
  async recentUsers(limit = 5) {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // 7) Moyenne du nombre de jours entre création et dernière mise à jour
  async averageDaysBetweenCreationAndUpdate() {
    const cursor = this.repo.aggregate([
      {
        $project: {
          deltaDays: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
      { $group: { _id: null, avgDelta: { $avg: '$deltaDays' } } },
    ]);

    const result = await cursor.toArray();
    return result[0] ?? { avgDelta: 0 };
  }

  // -----------------------------
  // Atelier – Pagination & tri
  // -----------------------------

  async paginate(page = 1, limit = 10) {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      page,
      limit,
      total,
      items,
    };
  }

  async sortByCreated(desc = true) {
    return this.repo.find({
      order: { createdAt: desc ? 'DESC' : 'ASC' },
    });
  }

  async sortByRoleThenCreated() {
    return this.repo.find({
      order: {
        role: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  // -----------------------------
  // Atelier – Manipulation des données
  // -----------------------------

  // Désactiver comptes inactifs depuis plus d'un an (sans suppression)
  async disableInactiveSinceOneYear() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);

    const result = await this.repo.update(
      { updatedAt: { $lt: date } as any },
      { active: false },
    );

    return result;
  }

  // Mise à jour en masse du rôle pour un domaine email
  async updateRoleByDomain(domain: string, newRole: 'admin' | 'client') {
    const regex = new RegExp(`@${domain}$`, 'i');

    const result = await this.repo.update(
      { email: { $regex: regex } as any },
      { role: newRole },
    );

    return result;
  }
}
