import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../src/auth/roles.guard';

// TC-04 – Role-Based Access Restriction

function createMockContext(userRole: string): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 'user-1', role: userRole } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard (TC-04)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when user has the required ADMIN role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createMockContext('ADMIN');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access (return false) when MEMBER tries admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = createMockContext('MEMBER');

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow any authenticated user when no @Roles() decorator is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext('MEMBER');

    expect(guard.canActivate(context)).toBe(true);
  });
});
