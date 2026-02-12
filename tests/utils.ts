import type { Result } from '../src/leagues/types';

export function expectedElo(
  elo: { home: number, away: number },
  result: Result,
  scale: number,
  k: number
): { home: number; away: number } {
  const qH = 10 ** (elo.home / scale);
  const qA = 10 ** (elo.away / scale);
  return {
    home: elo.home + Math.round(k * (result.homeWin - qH / (qA + qH))),
    away: elo.away + Math.round(k * (1 - result.homeWin - qA / (qA + qH))),
  };
}
