import { RequestsService } from './requests.service';
import { UsersService } from '../users/users.service';
import { AppLogger } from '@/common/logging/logger.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatusEnum } from './schemas/request.schema';

describe('RequestsService', () => {
  let service: RequestsService;

  const loggerMock = { info: jest.fn() } as unknown as AppLogger;
  const eventsMock = { emit: jest.fn() } as unknown as EventEmitter2;

  const usersServiceMock = {
    findById: jest.fn(async (_id: string) => null),
  } as unknown as UsersService;

  class InMemoryRequestModel {
    static store: any[] = [];
    _id: string;
    customerId: any;
    address: any;
    phone: string;
    category: string;
    estimatedTimeOfService: Date;
    details?: string;
    status: RequestStatusEnum;
    applications: any[] = [];
    acceptedProviderId?: any;
    constructor(data: any) { Object.assign(this, data); this._id = `${Date.now()}-${Math.random()}`; }
    async save() { InMemoryRequestModel.store.push(this); return this; }
    static findById(id: string) { return { exec: async () => InMemoryRequestModel.store.find((d) => d._id === id) || null }; }
    static findByIdAndUpdate(id: string, update: any, opts: any) {
      return { exec: async () => {
        const doc = InMemoryRequestModel.store.find((d) => d._id === id);
        if (!doc) return null;
        const set = update.$set || {};
        Object.assign(doc, set);
        return opts?.new ? doc : null;
      } };
    }
  }

  const connectionStub: any = {
    startSession: async () => ({
      withTransaction: async (fn: Function) => { await fn(); },
      abortTransaction: async () => {},
      endSession: async () => {},
    }),
  };

  let cId: string;
  let pId: string;

  beforeEach(() => {
    (eventsMock.emit as any).mockClear();
    InMemoryRequestModel.store = [];
    service = new RequestsService(InMemoryRequestModel as any, usersServiceMock, loggerMock, eventsMock, connectionStub);
    cId = (require('mongoose') as any).Types.ObjectId().toString();
    pId = (require('mongoose') as any).Types.ObjectId().toString();
    (usersServiceMock.findById as any).mockImplementation(async (id: string) => {
      if (id === cId) return { role: 'customer', _id: cId } as any;
      if (id === pId) return { role: 'provider', _id: pId } as any;
      return null;
    });
  });

  it('creates a request for customer and emits event', async () => {
    const dto: any = { phone: '+12345678901', category: 'plumber', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() };
    const res = await service.createRequest(cId, dto);
    expect(res.status).toBe(RequestStatusEnum.OPEN);
    expect(eventsMock.emit).toHaveBeenCalledWith('request.created', expect.any(Object));
  });

  it('prevents non-customer from creating', async () => {
    await expect(service.createRequest(pId, { phone: '+11111111111', category: 'other', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() } as any)).rejects.toThrow('Only customers can create requests');
  });

  it('allows provider application and transitions to pending', async () => {
    const req = await service.createRequest(cId, { phone: '+11111111111', category: 'other', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() } as any);
    const updated = await service.applyForRequest(pId, (req as any)._id, { message: 'I can do it' } as any);
    expect(updated.status).toBe(RequestStatusEnum.PENDING);
    expect(updated.applications.length).toBe(1);
    expect(eventsMock.emit).toHaveBeenCalledWith('request.pending', { id: (req as any)._id });
  });

  it('prevents duplicate applications by same provider', async () => {
    const req = await service.createRequest(cId, { phone: '+11111111111', category: 'other', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() } as any);
    await service.applyForRequest(pId, (req as any)._id, { message: 'First' } as any);
    await expect(service.applyForRequest(pId, (req as any)._id, { message: 'Second' } as any)).rejects.toThrow('Provider has already applied');
  });

  it('accepts a provider who applied and emits event', async () => {
    const req = await service.createRequest(cId, { phone: '+11111111111', category: 'other', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() } as any);
    await service.applyForRequest(pId, (req as any)._id, { message: 'Ready' } as any);
    const accepted = await service.acceptProvider(cId, (req as any)._id, { providerId: pId } as any);
    expect(accepted.status).toBe(RequestStatusEnum.ACCEPTED);
    expect(accepted.acceptedProviderId).toBeDefined();
    expect(eventsMock.emit).toHaveBeenCalledWith('request.accepted', { id: (req as any)._id, providerId: pId });
  });

  it('completes an accepted request by customer and emits event', async () => {
    const req = await service.createRequest(cId, { phone: '+11111111111', category: 'other', estimatedTimeOfService: new Date(Date.now() + 60000).toISOString() } as any);
    await service.applyForRequest(pId, (req as any)._id, { message: 'Ready' } as any);
    await service.acceptProvider(cId, (req as any)._id, { providerId: pId } as any);
    const completed = await service.completeRequest(cId, (req as any)._id);
    expect(completed.status).toBe(RequestStatusEnum.COMPLETED);
    expect(eventsMock.emit).toHaveBeenCalledWith('request.completed', { id: (req as any)._id });
  });
});