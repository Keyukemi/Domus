import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from '../src/tasks/tasks.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TC-02 – Create and Complete Task

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  taskAssignee: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@domus.com',
  role: 'MEMBER',
  householdId: 'household-1',
};

const mockTask = {
  id: 'task-1',
  title: 'Buy groceries',
  description: 'Milk and eggs',
  status: 'PENDING',
  deadline: null,
  householdId: 'household-1',
  createdById: 'user-1',
  createdBy: { id: 'user-1', name: 'Alice', email: 'alice@domus.com' },
  assignees: [
    {
      userId: 'user-2',
      user: { id: 'user-2', name: 'Bob', email: 'bob@domus.com' },
    },
  ],
};

describe('TasksService (TC-02)', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task with title and assignees', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.count.mockResolvedValue(1); // 1 valid assignee
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(
        {
          title: 'Buy groceries',
          description: 'Milk and eggs',
          assigneeIds: ['user-2'],
        },
        'user-1',
      );

      expect(result.title).toBe('Buy groceries');
      expect(mockPrisma.task.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user has no household', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        householdId: null,
      });

      await expect(
        service.create({ title: 'Test task' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if assignee is not in household', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.count.mockResolvedValue(0); // No valid assignees found

      await expect(
        service.create(
          { title: 'Test task', assigneeIds: ['outsider-id'] },
          'user-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return only tasks from the user\'s household', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId: 'household-1' },
        }),
      );
    });

    it('should filter tasks by status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.findMany.mockResolvedValue([]);

      await service.findAll('user-1', 'COMPLETED' as any);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId: 'household-1', status: 'COMPLETED' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if task belongs to another household', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        householdId: 'other-household',
      });

      await expect(service.findOne('task-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update – mark as completed', () => {
    it('should allow any household member to mark a task as completed', async () => {
      // user-2 is not the creator but can change status
      const otherUser = { ...mockUser, id: 'user-2' };
      mockPrisma.user.findUnique.mockResolvedValue(otherUser);
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'COMPLETED',
      });

      const result = await service.update(
        'task-1',
        { status: 'COMPLETED' as any },
        'user-2',
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw ForbiddenException if non-creator tries to edit title', async () => {
      const otherUser = { ...mockUser, id: 'user-2' };
      mockPrisma.user.findUnique.mockResolvedValue(otherUser);
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(
        service.update('task-1', { title: 'New title' }, 'user-2'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should allow the creator to delete their task', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('task-1', 'user-1');

      expect(result.message).toBe('Task deleted successfully');
    });

    it('should throw ForbiddenException if non-creator tries to delete', async () => {
      const otherUser = { ...mockUser, id: 'user-2' };
      mockPrisma.user.findUnique.mockResolvedValue(otherUser);
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.remove('task-1', 'user-2')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
