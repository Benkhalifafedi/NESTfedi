import { Entity, Column, ObjectIdColumn, BeforeInsert, AfterInsert, AfterUpdate, BeforeRemove } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Logger } from '@nestjs/common';

@Entity()
export class User {
  private readonly logger = new Logger('User');

  @ObjectIdColumn()
  _id: ObjectId;   // MongoDB ID correct

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  active: boolean;

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
