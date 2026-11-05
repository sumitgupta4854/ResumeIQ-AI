import { describe, test } from 'node:test';
import assert from 'node:assert';
import { registerSchema, loginSchema, jobMatchSchema } from '../src/utils/validators.js';

describe('validators', () => {
  test('register rejects bad email', () => {
    const { error } = registerSchema.validate({ name: 'A', email: 'bad', password: '123456' });
    assert.ok(error);
  });
  test('register accepts valid input', () => {
    const { error } = registerSchema.validate({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret123' });
    assert.equal(error, undefined);
  });
  test('login requires password', () => {
    const { error } = loginSchema.validate({ email: 'a@b.com' });
    assert.ok(error);
  });
  test('job match requires 50+ char JD', () => {
    const { error } = jobMatchSchema.validate({ resumeId: 'x', jobDescription: 'short' });
    assert.ok(error);
  });
});
