import {
  Entity,
  Column,
  ObjectIdColumn,
  BeforeInsert,
  AfterInsert,
  AfterUpdate,
  BeforeRemove,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Logger } from '@nestjs/common';

@Entity()
export class User {
  private readonly logger = new Logger('User');

  @ObjectIdColumn()
  _id: ObjectId; // ID MongoDB

  @Column()
  email: string;

  @Column()
  password: string;

  // 🔹 Atelier : rôle utilisateur
  @Column({ default: 'client' })
  role: 'admin' | 'client';

  // 🔹 Atelier : compte actif / inactif
  @Column({ default: false })
  active: boolean;

  // 🔹 Atelier : dates de création / mise à jour
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  logInsert() {
    this.logger.log(`Before inserting user with email: ${this.email}`);
  }

  @AfterInsert()
  logAfterInsert() {
    this.logger.log(`User created: ${this._id}`);
  }

  @AfterUpdate()
  logAfterUpdate() {
    this.logger.log(`User updated: ${this._id}`);
  }

  @BeforeRemove()
  logBeforeRemove() {
    this.logger.log(`User removed: ${this._id}`);
  }
}
