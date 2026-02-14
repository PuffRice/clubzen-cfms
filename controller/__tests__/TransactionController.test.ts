import { TransactionController } from '../TransactionController';

describe('TransactionController', () => {
  const ctrl = new TransactionController();

  describe('addExpense', () => {
    it('validates amount and required fields', async () => {
      const r1 = await ctrl.addExpense({ body: { amount: 0 } });
      expect(r1.statusCode).toBe(400);

      const r2 = await ctrl.addExpense({ body: { amount: 100 } });
      expect(r2.statusCode).toBe(400); // missing date/categoryId/method
    });

    it('creates expense when payload valid', async () => {
      const payload = { amount: 100, date: '2026-02-14', categoryId: '1', method: 'CASH' };
      const res = await ctrl.addExpense({ body: payload });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ type: 'EXPENSE', amount: 100, categoryId: '1' });
      expect(typeof res.body.createdAt).toBe('string');
      expect(new Date(res.body.createdAt).toString()).not.toBe('Invalid Date');
    });
  });

  describe('addIncome', () => {
    it('validates amount and required fields', async () => {
      const r1 = await ctrl.addIncome({ body: { amount: -5 } });
      expect(r1.statusCode).toBe(400);

      const r2 = await ctrl.addIncome({ body: { amount: 200 } });
      expect(r2.statusCode).toBe(400);
    });

    it('creates income when payload valid', async () => {
      const payload = { amount: 200, date: '2026-02-14', categoryId: '2', method: 'BANK' };
      const res = await ctrl.addIncome({ body: payload });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ type: 'INCOME', amount: 200, categoryId: '2' });
    });
  });

  describe('addDue', () => {
    it('validates amount and required fields', async () => {
      const r1 = await ctrl.addDue({ body: { amount: 0 } });
      expect(r1.statusCode).toBe(400);

      const r2 = await ctrl.addDue({ body: { amount: 50, dueDate: '2026-02-28' } });
      expect(r2.statusCode).toBe(400);
    });

    it('rejects invalid due type', async () => {
      const r = await ctrl.addDue({ body: { amount: 50, dueDate: '2026-02-28', partyName: 'Alice', type: 'INVALID' } });
      expect(r.statusCode).toBe(400);
      expect(r.body).toHaveProperty('message');
    });

    it('creates due when payload valid', async () => {
      const payload = { amount: 75, dueDate: '2026-03-01', partyName: 'Bob', type: 'TAKEN' };
      const res = await ctrl.addDue({ body: payload });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({ amount: 75, partyName: 'Bob', type: 'TAKEN', status: 'PENDING' });
    });
  });
});
