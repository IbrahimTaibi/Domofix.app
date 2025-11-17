import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

describe('RequestsController', () => {
  let controller: RequestsController;
  const serviceMock = {
    createRequest: jest.fn(async (userId: string, dto: any) => ({
      id: 'r1',
      userId,
      ...dto,
    })),
    applyForRequest: jest.fn(async (userId: string, id: string, dto: any) => ({
      id,
      appliedBy: userId,
      ...dto,
    })),
    acceptProvider: jest.fn(async (userId: string, id: string, dto: any) => ({
      id,
      acceptedBy: userId,
      ...dto,
    })),
    completeRequest: jest.fn(async (userId: string, id: string) => ({
      id,
      completedBy: userId,
    })),
  } as unknown as RequestsService;

  beforeEach(() => {
    controller = new RequestsController(serviceMock);
    jest.clearAllMocks();
  });

  it('create passes userId from request', async () => {
    const req: any = { user: { userId: 'c1' } };
    const dto: any = { phone: '+12345678901', category: 'plumber' };
    const res = await controller.create(req, dto);
    expect(serviceMock.createRequest).toHaveBeenCalledWith('c1', dto);
    expect(res).toMatchObject({ id: 'r1', userId: 'c1' });
  });

  it('apply uses provider userId', async () => {
    const req: any = { user: { userId: 'p1' } };
    const res = await controller.apply(req, 'r1', { message: 'Ready' } as any);
    expect(serviceMock.applyForRequest).toHaveBeenCalledWith('p1', 'r1', {
      message: 'Ready',
    });
    expect(res).toMatchObject({ id: 'r1', appliedBy: 'p1' });
  });

  it('acceptProvider uses customer userId', async () => {
    const req: any = { user: { userId: 'c1' } };
    const res = await controller.acceptProvider(req, 'r1', {
      providerId: 'p1',
    } as any);
    expect(serviceMock.acceptProvider).toHaveBeenCalledWith('c1', 'r1', {
      providerId: 'p1',
    });
    expect(res).toMatchObject({ id: 'r1', acceptedBy: 'c1' });
  });

  it('complete uses actor userId', async () => {
    const req: any = { user: { userId: 'p1' } };
    const res = await controller.complete(req, 'r1');
    expect(serviceMock.completeRequest).toHaveBeenCalledWith('p1', 'r1');
    expect(res).toMatchObject({ id: 'r1', completedBy: 'p1' });
  });
});
