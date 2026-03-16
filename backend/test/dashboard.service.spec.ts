import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ExpensesService } from '../src/expenses/expenses.service';

// TC-05 – Dashboard Data Aggregation

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  task: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  note: {
    findMany: jest.fn(),
  },
  expense: {
    findMany: jest.fn(),
  },
};

const mockExpensesService = {
  getBalances: jest.fn(),
};

const mockUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@domus.com',
  role: 'MEMBER',
  householdId: 'household-1',
};

describe('DashboardService (TC-05)', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ExpensesService, useValue: mockExpensesService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should return correct task count and financial summary', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.task.count.mockResolvedValue(3);
    mockPrisma.task.findMany.mockResolvedValue([
      {
        id: 'task-1',
        title: 'Buy milk',
        deadline: new Date(Date.now() + 86400000), // tomorrow
        assignees: [],
      },
    ]);
    mockExpensesService.getBalances.mockResolvedValue([
      {
        from: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
        to: { id: 'user-1', name: 'Alice', email: 'alice@domus.com' },
        amount: '25.00',
      },
    ]);
    mockPrisma.note.findMany.mockResolvedValue([
      {
        id: 'note-1',
        content: 'WiFi password: 1234',
        author: { id: 'user-1', name: 'Alice', email: 'alice@domus.com' },
      },
    ]);
    mockPrisma.expense.findMany.mockResolvedValue([
      {
        id: 'expense-1',
        description: 'Groceries',
        amount: 50,
        paidBy: { id: 'user-1', name: 'Alice', email: 'alice@domus.com' },
      },
    ]);

    const result = await service.getSummary('user-1');

    expect(result.pendingTasksCount).toBe(3);
    expect(result.upcomingDeadlines).toHaveLength(1);
    expect(result.balances).toHaveLength(1);
    expect(result.myBalance).toBe('25.00'); // Alice is owed 25
    expect(result.recentNotes).toHaveLength(1);
    expect(result.recentExpenses).toHaveLength(1);
  });

  it('should return empty state when no tasks or expenses exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.task.count.mockResolvedValue(0);
    mockPrisma.task.findMany.mockResolvedValue([]);
    mockExpensesService.getBalances.mockResolvedValue([]);
    mockPrisma.note.findMany.mockResolvedValue([]);
    mockPrisma.expense.findMany.mockResolvedValue([]);

    const result = await service.getSummary('user-1');

    expect(result.pendingTasksCount).toBe(0);
    expect(result.upcomingDeadlines).toHaveLength(0);
    expect(result.balances).toHaveLength(0);
    expect(result.myBalance).toBe('0.00');
    expect(result.recentNotes).toHaveLength(0);
    expect(result.recentExpenses).toHaveLength(0);
  });

  it('should throw ForbiddenException if user has no household', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      householdId: null,
    });

    await expect(service.getSummary('user-1')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
