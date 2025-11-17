import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  const getHandlerRoles = jest.fn();
  const getClassRoles = jest.fn();
  const reflector = {
    getAllAndOverride: jest.fn((key: string) =>
      key === 'roles' ? (getHandlerRoles() ?? getClassRoles()) : undefined,
    ),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  const ctx: any = {
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: 'provider' } }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows matching role', () => {
    getHandlerRoles.mockReturnValue(['provider']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies mismatched role', () => {
    getHandlerRoles.mockReturnValue(['customer']);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when no roles metadata', () => {
    getHandlerRoles.mockReturnValue(undefined);
    getClassRoles.mockReturnValue(undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
