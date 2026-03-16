import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Households (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const adminUser = {
    email: 'e2e-admin@domus.com',
    password: 'AdminPass1',
    name: 'E2E Admin',
  };

  const memberUser = {
    email: 'e2e-member@domus.com',
    password: 'MemberPass1',
    name: 'E2E Member',
  };

  let adminToken: string;
  let memberToken: string;
  let adminId: string;
  let memberId: string;
  let householdId: string;
  let inviteCode: string;

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
      where: { email: { in: [adminUser.email, memberUser.email] } },
    });

    // Register both users
    const adminReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(adminUser);
    adminId = adminReg.body.id;

    const memberReg = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(memberUser);
    memberId = memberReg.body.id;

    // Login both users
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.accessToken;

    const memberLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: memberUser.email, password: memberUser.password });
    memberToken = memberLogin.body.accessToken;
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
      where: { email: { in: [adminUser.email, memberUser.email] } },
    });
    if (householdId) {
      await prisma.household.deleteMany({ where: { id: householdId } });
    }
    await app.close();
  });

  describe('Protected routes require authentication', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households')
        .send({ name: 'Test House' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/households – Create household', () => {
    it('should create a household and make the user ADMIN', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Household' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Household');
      expect(response.body.inviteCode).toBeDefined();
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].role).toBe('ADMIN');

      householdId = response.body.id;
      inviteCode = response.body.inviteCode;
    });

    it('should reject creating a second household (user already in one)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Another House' });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/households/join – Join via invite code', () => {
    it('should reject an invalid invite code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households/join')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ inviteCode: 'BADCODE1' });

      expect(response.status).toBe(404);
    });

    it('should allow a user to join via valid invite code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households/join')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ inviteCode });

      expect(response.status).toBe(201);
      expect(response.body.members).toHaveLength(2);

      const memberEntry = response.body.members.find(
        (m) => m.id === memberId,
      );
      expect(memberEntry.role).toBe('MEMBER');
    });

    it('should reject joining when user already belongs to a household', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/households/join')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ inviteCode });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/households/:id – View household', () => {
    it('should return household with all members', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/households/${householdId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
    });
  });

  describe('DELETE /api/households/:id/members/:memberId – Remove member', () => {
    it('should reject removal by a non-admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/households/${householdId}/members/${adminId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admin to remove a member', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/households/${householdId}/members/${memberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].id).toBe(adminId);
    });
  });
});
