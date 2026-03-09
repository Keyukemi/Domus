import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HouseholdsModule } from './households/households.module';
import { TasksModule } from './tasks/tasks.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, HouseholdsModule, TasksModule, ExpensesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
