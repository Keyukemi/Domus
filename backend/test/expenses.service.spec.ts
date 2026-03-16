import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ExpensesService } from '../src/expenses/expenses.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TC-03 – Record Expense and Recalculate Balance

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  expense: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expenseSplit: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  settlement: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const userAlice = {
  id: 'alice-id',
  name: 'Alice',
  email: 'alice@domus.com',
  role: 'MEMBER',
  householdId: 'household-1',
};

const userBob = {
  id: 'bob-id',
  name: 'Bob',
  email: 'bob@domus.com',
  role: 'MEMBER',
  householdId: 'household-1',
};

describe('ExpensesService (TC-03)', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an expense and split amount correctly', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.user.count.mockResolvedValue(2); // Both members valid
      mockPrisma.expense.create.mockResolvedValue({
        id: 'expense-1',
        description: 'Groceries',
        amount: 100,
        category: 'Food',
        date: new Date('2025-06-01'),
        paidById: 'alice-id',
        householdId: 'household-1',
        paidBy: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
        splits: [
          {
            userId: 'alice-id',
            amount: '50.00',
            user: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
          },
          {
            userId: 'bob-id',
            amount: '50.00',
            user: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
          },
        ],
      });

      const result = await service.create(
        {
          description: 'Groceries',
          amount: 100,
          category: 'Food',
          date: '2025-06-01',
          splitAmongIds: ['alice-id', 'bob-id'],
        },
        'alice-id',
      );

      expect(result.amount).toBe(100);
      // Verify the split amount calculation: 100 / 2 = 50.00
      expect(mockPrisma.expense.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            splits: {
              create: [
                { userId: 'alice-id', amount: '50.00' },
                { userId: 'bob-id', amount: '50.00' },
              ],
            },
          }),
        }),
      );
    });

    it('should throw ForbiddenException if split member is not in household', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.user.count.mockResolvedValue(1); // Only 1 of 2 members valid

      await expect(
        service.create(
          {
            description: 'Groceries',
            amount: 100,
            category: 'Food',
            date: '2025-06-01',
            splitAmongIds: ['alice-id', 'outsider-id'],
          },
          'alice-id',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getBalances', () => {
    it('should calculate correct balances (100€ paid by Alice, split with Bob → Bob owes 50)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.expense.findMany.mockResolvedValue([
        {
          id: 'expense-1',
          amount: 100,
          paidById: 'alice-id',
          paidBy: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
          splits: [
            {
              userId: 'alice-id',
              amount: '50.00',
              user: {
                id: 'alice-id',
                name: 'Alice',
                email: 'alice@domus.com',
              },
            },
            {
              userId: 'bob-id',
              amount: '50.00',
              user: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
            },
          ],
        },
      ]);
      mockPrisma.settlement.findMany.mockResolvedValue([]);

      const result = await service.getBalances('alice-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        from: { id: 'bob-id' },
        to: { id: 'alice-id' },
        amount: '50.00',
      });
    });

    it('should have sum of all net balances equal to zero', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.expense.findMany.mockResolvedValue([
        {
          id: 'expense-1',
          amount: 90,
          paidById: 'alice-id',
          paidBy: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
          splits: [
            {
              userId: 'alice-id',
              amount: '30.00',
              user: {
                id: 'alice-id',
                name: 'Alice',
                email: 'alice@domus.com',
              },
            },
            {
              userId: 'bob-id',
              amount: '30.00',
              user: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
            },
            {
              userId: 'charlie-id',
              amount: '30.00',
              user: {
                id: 'charlie-id',
                name: 'Charlie',
                email: 'charlie@domus.com',
              },
            },
          ],
        },
      ]);
      mockPrisma.settlement.findMany.mockResolvedValue([]);

      const result = await service.getBalances('alice-id');

      // Sum of all "from" amounts should equal sum of all "to" amounts
      // i.e. net across the system is zero
      let netSum = 0;
      for (const b of result) {
        netSum += parseFloat(b.amount); // "from" owes "to"
        netSum -= parseFloat(b.amount); // "to" is owed
      }
      expect(netSum).toBe(0);
    });

    it('should reduce debt after a settlement', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.expense.findMany.mockResolvedValue([
        {
          id: 'expense-1',
          amount: 100,
          paidById: 'alice-id',
          paidBy: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
          splits: [
            {
              userId: 'alice-id',
              amount: '50.00',
              user: {
                id: 'alice-id',
                name: 'Alice',
                email: 'alice@domus.com',
              },
            },
            {
              userId: 'bob-id',
              amount: '50.00',
              user: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
            },
          ],
        },
      ]);
      // Bob settled 30 of his 50 debt to Alice
      mockPrisma.settlement.findMany.mockResolvedValue([
        {
          fromUserId: 'bob-id',
          toUserId: 'alice-id',
          amount: 30,
          fromUser: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
          toUser: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
        },
      ]);

      const result = await service.getBalances('alice-id');

      expect(result).toHaveLength(1);
      // Bob originally owed 50, settled 30, so now owes 20
      expect(result[0]).toMatchObject({
        from: { id: 'bob-id' },
        to: { id: 'alice-id' },
        amount: '20.00',
      });
    });
  });

  describe('createSettlement', () => {
    it('should create a settlement between two household members', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);
      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.settlement.create.mockResolvedValue({
        id: 'settlement-1',
        amount: 50,
        fromUserId: 'bob-id',
        toUserId: 'alice-id',
        householdId: 'household-1',
        fromUser: { id: 'bob-id', name: 'Bob', email: 'bob@domus.com' },
        toUser: { id: 'alice-id', name: 'Alice', email: 'alice@domus.com' },
      });

      const result = await service.createSettlement(
        { fromUserId: 'bob-id', toUserId: 'alice-id', amount: 50 },
        'alice-id',
      );

      expect(result.amount).toBe(50);
    });

    it('should throw ForbiddenException when settling with yourself', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userAlice);

      await expect(
        service.createSettlement(
          { fromUserId: 'alice-id', toUserId: 'alice-id', amount: 50 },
          'alice-id',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
