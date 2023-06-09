import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './user.entity';
import { ULID, asULID } from 'src/libs/ulid';

import type { User } from '@prisma/client';
import type { IRepository } from 'src/interfaces/IRepository';
import type { TaskEntity } from 'src/task/task.entity';

@Injectable()
export class UserRepository implements IRepository<UserEntity> {
  constructor(private readonly prisma: PrismaService) {}

  // TODO(enhancement): pagination
  async findAll(): Promise<UserEntity[]> {
    const models = await this.prisma.user.findMany({
      where: {
        deletedAt: {
          equals: null,
        },
      },
    });

    return models.map(toEntity);
  }

  async findByUlid(ulid: ULID): Promise<UserEntity | undefined> {
    try {
      // findFirstOrThrow だと where がユニークなもの以外指定できない
      const model = await this.prisma.user.findFirstOrThrow({
        where: {
          ulid: ulid,
          deletedAt: {
            equals: null,
          },
        },
      });

      return toEntity(model);
    } catch {
      return undefined;
    }
  }

  async findByTask(task: TaskEntity): Promise<UserEntity | undefined> {
    try {
      const model = await this.prisma.user.findFirstOrThrow({
        where: {
          id: task.ownerId,
          deletedAt: {
            equals: null,
          },
        },
      });

      return toEntity(model);
    } catch {
      return undefined;
    }
  }

  async save(entity: UserEntity): Promise<UserEntity> {
    if (entity.hasPerpetuated()) {
      return await this.update(entity);
    }

    return await this.create(entity);
  }

  private async create(entity: UserEntity): Promise<UserEntity> {
    const model = await this.prisma.user.create({
      data: {
        ulid: entity.ulid,
        name: entity.name,
        age: entity.age,
      },
    });

    return toEntity(model);
  }

  private async update(entity: UserEntity): Promise<UserEntity> {
    const model = await this.prisma.user.update({
      where: {
        id: entity._id,
      },
      data: {
        name: entity.name,
        age: entity.age,
        deletedAt: entity.deletedAt,
      },
    });

    return toEntity(model);
  }
}

function toEntity(model: User): UserEntity {
  const entity = UserEntity.factoryWithAllProperties({
    id: model.id,
    ulid: asULID(model.ulid),
    name: model.name,
    age: model.age,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    deletedAt: model.deletedAt === null ? undefined : model.deletedAt,
  });

  return entity;
}
