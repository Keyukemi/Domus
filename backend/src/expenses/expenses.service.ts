import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  private readonly expenseInclude = {
    paidBy: { select: { id: true, name: true, email: true } },
    splits: {
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

  private calculateSplitAmount(
    totalAmount: number,
    memberCount: number,
  ): string {
    const splitAmount = totalAmount / memberCount;
    return splitAmount.toFixed(2);
  }

  async create(dto: CreateExpenseDto, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    // Verify all split members belong to the same household
    const validMembers = await this.prisma.user.count({
      where: {
        id: { in: dto.splitAmongIds },
        householdId: user.householdId,
      },
    });

    if (validMembers !== dto.splitAmongIds.length) {
      throw new ForbiddenException('All members must belong to your household');
    }

    const splitAmount = this.calculateSplitAmount(
      dto.amount,
      dto.splitAmongIds.length,
    );

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        category: dto.category,
        date: new Date(dto.date),
        paidById: userId,
        householdId: user.householdId!,
        splits: {
          create: dto.splitAmongIds.map((memberId) => ({
            userId: memberId,
            amount: splitAmount,
          })),
        },
      },
      include: this.expenseInclude,
    });
  }

  async findAll(userId: string, category?: string) {
    const user = await this.getUserWithHousehold(userId);

    return this.prisma.expense.findMany({
      where: {
        householdId: user.householdId!,
        ...(category && { category }),
      },
      include: this.expenseInclude,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: this.expenseInclude,
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.householdId !== user.householdId) {
      throw new ForbiddenException('Expense does not belong to your household');
    }

    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
    const expense = await this.findOne(id, userId);
    const user = await this.getUserWithHousehold(userId);

    if (expense.paidById !== userId) {
      throw new ForbiddenException(
        'Only the person who paid can edit this expense',
      );
    }

    // If splitAmongIds or amount changed, recalculate splits
    if (dto.splitAmongIds || dto.amount !== undefined) {
      const splitAmongIds =
        dto.splitAmongIds || expense.splits.map((s) => s.userId);
      const amount =
        dto.amount !== undefined ? dto.amount : Number(expense.amount);

      // Verify all split members belong to the same household
      if (dto.splitAmongIds) {
        const validMembers = await this.prisma.user.count({
          where: {
            id: { in: splitAmongIds },
            householdId: user.householdId,
          },
        });

        if (validMembers !== splitAmongIds.length) {
          throw new ForbiddenException(
            'All members must belong to your household',
          );
        }
      }

      const splitAmount = this.calculateSplitAmount(
        amount,
        splitAmongIds.length,
      );

      // Delete existing splits and create new ones
      await this.prisma.$transaction(async (tx) => {
        await tx.expenseSplit.deleteMany({ where: { expenseId: id } });
        await tx.expenseSplit.createMany({
          data: splitAmongIds.map((memberId) => ({
            expenseId: id,
            userId: memberId,
            amount: splitAmount,
          })),
        });
      });
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
      },
      include: this.expenseInclude,
    });
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id, userId);

    if (expense.paidById !== userId) {
      throw new ForbiddenException(
        'Only the person who paid can delete this expense',
      );
    }

    await this.prisma.expense.delete({ where: { id } });

    return { message: 'Expense deleted successfully' };
  }

  async createSettlement(dto: CreateSettlementDto, userId: string) {
    const user = await this.getUserWithHousehold(userId);

    if (dto.fromUserId === dto.toUserId) {
      throw new ForbiddenException('You cannot settle with yourself');
    }

    // The logged-in user must be either the payer or the receiver
    if (dto.fromUserId !== userId && dto.toUserId !== userId) {
      throw new ForbiddenException('You must be part of this settlement');
    }

    // Verify both users belong to the same household
    const bothInHousehold = await this.prisma.user.count({
      where: {
        id: { in: [dto.fromUserId, dto.toUserId] },
        householdId: user.householdId,
      },
    });

    if (bothInHousehold !== 2) {
      throw new ForbiddenException('Both users must belong to your household');
    }

    return this.prisma.settlement.create({
      data: {
        amount: dto.amount,
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        householdId: user.householdId!,
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getBalances(userId: string) {
    const user = await this.getUserWithHousehold(userId);

    const [expenses, settlements] = await Promise.all([
      this.prisma.expense.findMany({
        where: { householdId: user.householdId! },
        include: {
          paidBy: { select: { id: true, name: true, email: true } },
          splits: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.settlement.findMany({
        where: { householdId: user.householdId! },
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // Track net balances: debts[debtorId][creditorId] = amount owed
    const debts: Record<string, Record<string, number>> = {};

    for (const expense of expenses) {
      const payerId = expense.paidById;

      for (const split of expense.splits) {
        // Skip the payer's own split — they don't owe themselves
        if (split.userId === payerId) continue;

        const debtorId = split.userId;
        const amount = Number(split.amount);

        if (!debts[debtorId]) debts[debtorId] = {};
        if (!debts[debtorId][payerId]) debts[debtorId][payerId] = 0;
        debts[debtorId][payerId] += amount;
      }
    }

    // Subtract settlements: fromUser paid toUser, reducing fromUser's debt
    for (const settlement of settlements) {
      const fromId = settlement.fromUserId;
      const toId = settlement.toUserId;
      const amount = Number(settlement.amount);

      if (!debts[fromId]) debts[fromId] = {};
      if (!debts[fromId][toId]) debts[fromId][toId] = 0;
      debts[fromId][toId] -= amount;
    }

    // Build a map of all users involved for easy lookup
    const usersMap: Record<
      string,
      { id: string; name: string; email: string }
    > = {};
    for (const expense of expenses) {
      usersMap[expense.paidBy.id] = expense.paidBy;
      for (const split of expense.splits) {
        usersMap[split.user.id] = split.user;
      }
    }
    for (const settlement of settlements) {
      usersMap[settlement.fromUser.id] = settlement.fromUser;
      usersMap[settlement.toUser.id] = settlement.toUser;
    }

    // Calculate net balances between each pair
    const balances: {
      from: (typeof usersMap)[string];
      to: (typeof usersMap)[string];
      amount: string;
    }[] = [];

    const processed = new Set<string>();

    for (const debtorId of Object.keys(debts)) {
      for (const creditorId of Object.keys(debts[debtorId])) {
        const pairKey = [debtorId, creditorId].sort().join('-');
        if (processed.has(pairKey)) continue;
        processed.add(pairKey);

        const aOwesB = debts[debtorId]?.[creditorId] || 0;
        const bOwesA = debts[creditorId]?.[debtorId] || 0;
        const net = aOwesB - bOwesA;

        if (net > 0) {
          balances.push({
            from: usersMap[debtorId],
            to: usersMap[creditorId],
            amount: net.toFixed(2),
          });
        } else if (net < 0) {
          balances.push({
            from: usersMap[creditorId],
            to: usersMap[debtorId],
            amount: Math.abs(net).toFixed(2),
          });
        }
      }
    }

    return balances;
  }
}
