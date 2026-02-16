import type { Result } from '../src/leagues/types';
import {mkdtempSync} from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

export function expectedElo(
  elo: { home: number, away: number },
  result: Result,
  scale: number,
  k: number
): { home: number; away: number } {
  const qH = 10 ** (elo.home / scale);
  const qA = 10 ** (elo.away / scale);
  const delta = Math.round(k * (result.homeWin - qH/(qA+qH)))
  return {
    home: elo.home + delta,
    away: elo.away - delta,
  };
}

export function makeTempDir(prefix:string) {
  return mkdtempSync(join(tmpdir(), prefix));
}