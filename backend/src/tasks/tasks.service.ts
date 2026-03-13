import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../generated/prisma/enums';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private readonly taskInclude = {
    createdBy: { select: { id: true, name: true, email: true } },
    assignees: {
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    },
  };

  private async getUserWithHousehold(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.householdId) {
      throw new ForbiddenException('You must belong to a household');
    }

    return user;
  }

  async create(dto: CreateTaskDto, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    // Verify all assignees belong to the same household
    if (dto.assigneeIds?.length) {
      const validMembers = await this.prisma.user.count({
        where: {
          id: { in: dto.assigneeIds },
          householdId: user.householdId,
        },
      });

      if (validMembers !== dto.assigneeIds.length) {
        throw new ForbiddenException(
          'All assignees must belong to your household',
        );
      }
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        householdId: user.householdId!,
        createdById: userId,
        assignees: dto.assigneeIds?.length
          ? { create: dto.assigneeIds.map((id) => ({ userId: id })) }
          : undefined,
      },
      include: this.taskInclude,
    });
  }

  async findAll(userId: string, status?: TaskStatus) {
    const user = await this.getUserWithHousehold(userId);

    return this.prisma.task.findMany({
      where: {
        householdId: user.householdId!,
        ...(status && { status }),
      },
      include: this.taskInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: this.taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.householdId !== user.householdId) {
      throw new ForbiddenException('Task does not belong to your household');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);
    const user = await this.getUserWithHousehold(userId);

    const isStatusOnlyUpdate =
      dto.status !== undefined &&
      dto.title === undefined &&
      dto.description === undefined &&
      dto.deadline === undefined &&
      dto.assigneeIds === undefined;

    if (!isStatusOnlyUpdate && task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can edit this task');
    }

    // Verify all new assignees belong to the same household
    if (dto.assigneeIds) {
      if (dto.assigneeIds.length) {
        const validMembers = await this.prisma.user.count({
          where: {
            id: { in: dto.assigneeIds },
            householdId: user.householdId,
          },
        });

        if (validMembers !== dto.assigneeIds.length) {
          throw new ForbiddenException(
            'All assignees must belong to your household',
          );
        }
      }

      // Delete existing assignees and create new ones in a transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.taskAssignee.deleteMany({ where: { taskId: id } });
        if (dto.assigneeIds!.length) {
          await tx.taskAssignee.createMany({
            data: dto.assigneeIds!.map((userId) => ({ taskId: id, userId })),
          });
        }
      });
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.deadline !== undefined && { deadline: new Date(dto.deadline) }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: this.taskInclude,
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    if (task.createdById !== userId) {
      throw new ForbiddenException(
        'Only the task creator can delete this task',
      );
    }

    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully' };
  }
}
