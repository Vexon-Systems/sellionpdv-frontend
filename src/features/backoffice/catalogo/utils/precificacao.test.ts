import { expect, it } from 'vitest';
import { calcularCusto, calcularMargem } from './precificacao';

it('preserva margem, custo e arredondamento usados na precificação', () => {
  expect(calcularMargem(20, 5)).toBe(75);
  expect(calcularCusto(20, 75)).toBe(5);
  expect(calcularMargem(3, 1)).toBe(66.67);
  expect(calcularCusto(3, 66.67)).toBe(1);
  expect(calcularMargem(0, 0)).toBe(0);
  expect(calcularMargem(10, 12)).toBe(-20);
});
