import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tasks & Expenses (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const userAlice = {
    email: 'e2e-alice@domus.com',
    password: 'AlicePass1',
    name: 'Alice',
  };

  const userBob = {
    email: 'e2e-bob@domus.com',
    password: 'BobbyPass1',
    name: 'Bob',
  };

  let aliceToken: string;
  let bobToken: string;
  let aliceId: string;
  let bobId: string;
  let householdId: string;
  let taskId: string;
  let expenseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up any leftover test data
    await prisma.user.deleteMany({
      where: { email: { in: [userAlice.email, userBob.email] } },
    });

    // Register and login Alice
    const aliceReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userAlice);
    aliceId = aliceReg.body.id;

    const aliceLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userAlice.email, password: userAlice.password });
    aliceToken = aliceLogin.body.accessToken;

    // Register and login Bob
    const bobReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userBob);
    bobId = bobReg.body.id;

    const bobLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: userBob.email, password: userBob.password });
    bobToken = bobLogin.body.accessToken;

    // Alice creates a household
    const household = await request(app.getHttpServer())
      .post('/api/households')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ name: 'Alice & Bob House' });
    householdId = household.body.id;

    // Bob joins the household
    await request(app.getHttpServer())
      .post('/api/households/join')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ inviteCode: household.body.inviteCode });
  });

  afterAll(async () => {
    // Clean up in correct order (respect foreign keys)
    if (householdId) {
      await prisma.settlement.deleteMany({ where: { householdId } });
      await prisma.expense.deleteMany({ where: { householdId } });
      await prisma.task.deleteMany({ where: { householdId } });
      await prisma.note.deleteMany({ where: { householdId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: [userAlice.email, userBob.email] } },
    });
    if (householdId) {
      await prisma.household.deleteMany({ where: { id: householdId } });
    }
    await app.close();
  });

  // ── Task Management (TC-02) ──

  describe('POST /api/tasks – Create task', () => {
    it('should create a task and assign it to Bob', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
          assigneeIds: [bobId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Buy groceries');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.assignees).toHaveLength(1);
      expect(response.body.assignees[0].user.id).toBe(bobId);

      taskId = response.body.id;
    });

    it('should reject creating a task without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Unauthorized task' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks – List tasks', () => {
    it('should return tasks scoped to the household', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', `Bearer ${bobToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Buy groceries');
    });

    it('should filter tasks by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?status=COMPLETED')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('PATCH /api/tasks/:id – Mark task as completed', () => {
    it('should allow any household member to mark a task as completed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('COMPLETED');
    });

    it('should reject non-creator editing the title', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ title: 'Changed by Bob' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id – Delete task', () => {
    it('should reject deletion by non-creator', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow the creator to delete their task', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });
  });

  // ── Expense Tracking & Balance Calculation (TC-03) ──

  describe('POST /api/expenses – Record expense', () => {
    it('should create an expense split between Alice and Bob', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          description: 'Groceries',
          amount: 100,
          category: 'Food',
          date: '2025-06-01',
          splitAmongIds: [aliceId, bobId],
        });

      expect(response.status).toBe(201);
      expect(Number(response.body.amount)).toBe(100);
      expect(response.body.splits).toHaveLength(2);
      // Each split should be 50.00
      for (const split of response.body.splits) {
        expect(Number(split.amount)).toBe(50);
      }

      expenseId = response.body.id;
    });

    it('should reject expense creation without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/expenses')
        .send({
          description: 'Unauthorized',
          amount: 50,
          category: 'Food',
          date: '2025-06-01',
          splitAmongIds: [aliceId],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/expenses/balances – Check balances', () => {
    it('should show Bob owes Alice 50.00', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/expenses/balances')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].from.id).toBe(bobId);
      expect(response.body[0].to.id).toBe(aliceId);
      expect(response.body[0].amount).toBe('50.00');
    });

    it('should not change balances when a planned expense is created', async () => {
      const plannedExpense = await request(app.getHttpServer())
        .post('/api/expenses')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({
          description: 'Weekend barbecue',
          amount: 60,
          category: 'Food',
          date: '2025-06-05',
          status: 'PLANNED',
          splitAmongIds: [aliceId, bobId],
        });

      expect(plannedExpense.status).toBe(201);
      expect(plannedExpense.body.status).toBe('PLANNED');

      const balanceResponse = await request(app.getHttpServer())
        .get('/api/expenses/balances')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body).toHaveLength(1);
      expect(balanceResponse.body[0].amount).toBe('50.00');
    });
  });

  describe('POST /api/expenses/settlements – Settle up', () => {
    it('should record a settlement reducing the debt', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/expenses/settlements')
        .set('Authorization', `Bearer ${bobToken}`)
        .send({
          fromUserId: bobId,
          toUserId: aliceId,
          amount: 30,
        });

      expect(response.status).toBe(201);
      expect(Number(response.body.amount)).toBe(30);
    });

    it('should show reduced balance after settlement (50 - 30 = 20)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/expenses/balances')
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].amount).toBe('20.00');
    });
  });

  describe('DELETE /api/expenses/:id – Delete expense', () => {
    it('should reject deletion by non-payer', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${bobToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow the payer to delete their expense', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${aliceToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Expense deleted successfully');
    });
  });
});
