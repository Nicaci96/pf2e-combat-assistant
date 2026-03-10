import { describe, expect, it, vi } from 'vitest';
import { parseDiceExpression, rollExpression } from './engine';

describe('dice parser', () => {
  it('parses standard expression', () => {
    const p = parseDiceExpression('1d20+16-1');
    expect(p.diceTerms.length).toBe(1);
    expect(p.flatModifier).toBe(15);
  });

  it('supports plain integer', () => {
    const p = parseDiceExpression('12');
    expect(p.flatModifier).toBe(12);
  });
});

describe('dice roller', () => {
  it('rolls deterministic with mocked random', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = rollExpression('2d8+2', 'damage', { circumstance: 1, status: 0, item: 0, untyped: 0, temporary: 0 });
    expect(result.total).toBe(13);
    vi.restoreAllMocks();
  });
});
