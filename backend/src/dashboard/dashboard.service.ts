import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
import { TaskStatus } from '../generated/prisma/enums';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private expensesService: ExpensesService,
  ) {}

  private async getUserWithHousehold(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.householdId) {
      throw new ForbiddenException('You must belong to a household');
    }

    return user;
  }

  async getSummary(userId: string) {
    const user = await this.getUserWithHousehold(userId);
    const householdId = user.householdId!;

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const [
      pendingTasksCount,
      upcomingDeadlines,
      balances,
      recentNotes,
      recentExpenses,
    ] = await Promise.all([
      this.prisma.task.count({
        where: { householdId, status: TaskStatus.PENDING },
      }),

      this.prisma.task.findMany({
        where: {
          householdId,
          status: TaskStatus.PENDING,
          deadline: { not: null, lte: sevenDaysFromNow },
        },
        include: {
          assignees: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),

      this.expensesService.getBalances(userId),

      this.prisma.note.findMany({
        where: { householdId },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      this.prisma.expense.findMany({
        where: { householdId },
        include: {
          paidBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate the current user's net balance from the balances list
    let myBalance = 0;
    for (const b of balances) {
      const amount = parseFloat(b.amount);
      if (b.to.id === userId) myBalance += amount;
      if (b.from.id === userId) myBalance -= amount;
    }

    return {
      pendingTasksCount,
      upcomingDeadlines,
      balances,
      myBalance: myBalance.toFixed(2),
      recentNotes,
      recentExpenses,
    };
  }
}
