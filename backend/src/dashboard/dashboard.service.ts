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

    const [pendingTasksCount, upcomingDeadlines, balances, recentNotes] =
      await Promise.all([
        this.prisma.task.count({
          where: { householdId, status: TaskStatus.PENDING },
        }),

        this.prisma.task.findMany({
          where: {
            householdId,
            status: TaskStatus.PENDING,
            deadline: { gte: now, lte: sevenDaysFromNow },
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
      ]);

    return {
      pendingTasksCount,
      upcomingDeadlines,
      balances,
      recentNotes,
    };
  }
}
