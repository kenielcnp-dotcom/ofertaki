import { formatPrice, formatRelativeTime, formatPoints } from '../formatters';

describe('formatPrice', () => {
  // `\s` também casa o espaço não separável (NBSP) que o toLocaleString pode
  // usar entre "R$" e o valor — o separador varia entre engines.
  it('formata em BRL com pt-BR', () => {
    expect(formatPrice(7.5)).toMatch(/^R\$\s*7,50$/);
    expect(formatPrice(0)).toMatch(/^R\$\s*0,00$/);
    expect(formatPrice(1234.56)).toMatch(/^R\$\s*1\.234,56$/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-02T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retorna "agora" para menos de 1 minuto', () => {
    expect(formatRelativeTime('2026-08-02T11:59:59Z')).toBe('agora');
  });

  it('retorna minutos no formato "há X min"', () => {
    expect(formatRelativeTime('2026-08-02T11:30:00Z')).toBe('há 30 min');
    expect(formatRelativeTime('2026-08-02T11:59:00Z')).toBe('há 1 min');
  });

  it('retorna horas no formato "há X h"', () => {
    expect(formatRelativeTime('2026-08-02T08:00:00Z')).toBe('há 4 h');
  });

  it('retorna dias no formato "há X d"', () => {
    expect(formatRelativeTime('2026-08-01T12:00:00Z')).toBe('há 1 d');
  });

  it('retorna meses no formato "há X mês/meses"', () => {
    expect(formatRelativeTime('2026-06-02T12:00:00Z')).toBe('há 2 meses');
    expect(formatRelativeTime('2026-07-02T12:00:00Z')).toBe('há 1 mês');
  });

  it('retorna anos no formato "há X a"', () => {
    expect(formatRelativeTime('2024-02-02T12:00:00Z')).toBe('há 2 a');
  });
});

describe('formatPoints', () => {
  it('formata pontos com separador de milhar', () => {
    expect(formatPoints(0)).toBe('0 pts');
    expect(formatPoints(1500)).toBe('1.500 pts');
  });
});
