import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TC-01 – User Registration & Login

jest.mock('bcrypt');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService (TC-01)', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@domus.com',
      password: 'Password1',
      name: 'Test User',
    };

    it('should register a new user and return user without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        password: 'hashed-password',
        name: registerDto.name,
        role: 'MEMBER',
        householdId: null,
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toMatchObject({
        id: 'user-1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'MEMBER',
        householdId: null,
      });
      // Password must never be returned
      expect(result).not.toHaveProperty('password');
    });

    it('should hash the password before storing (not plain text)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        password: 'hashed-password',
        name: registerDto.name,
        role: 'MEMBER',
        householdId: null,
        createdAt: new Date(),
      });

      await service.register(registerDto);

      // Verify bcrypt.hash was called with the raw password
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      // Verify the hashed password was stored, not the plain one
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashed-password',
          name: registerDto.name,
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      // Should never attempt to create the user
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@domus.com', password: 'Password1' };

    const storedUser = {
      id: 'user-1',
      email: 'test@domus.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'MEMBER',
      householdId: null,
    };

    it('should return JWT and user data on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('jwt-token-123');
      expect(result.user).toMatchObject({
        id: 'user-1',
        email: loginDto.email,
        name: 'Test User',
        role: 'MEMBER',
      });
      // Password must never be returned
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
