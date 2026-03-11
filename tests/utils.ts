import type { Result } from '../src/leagues/types';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { TrueSkillConfig } from '../src/rulesets/types';
import { InMemoryLeague } from '../src/leagues/in_memory';
import type { Ratings, Ruleset, TeamRating } from '../src/rulesets/base';
import type { JsonFixtures } from '../src/sources/parsers/base';
import type { JsonData } from '../src/sources/parsers/types';
import { DefaultJsonFixtures } from '../src/sources/parsers/json_parse';

export function defaultInMemoryLeague() {
  const fakeRuleset: Ruleset = {
    record(_result: Result, ratings: Ratings): Ratings {
      return ratings;
    },
    newRating():TeamRating {
      return {mu:1,sigma:1}
    }
  };
  return new InMemoryLeague(fakeRuleset);
}

export function inMemoryLeague(ruleset:Ruleset) {
  return new InMemoryLeague(ruleset)
}

export function expectedElo(
  elo: { home: number; away: number },
  result: Result,
  scale: number,
  k: number
): { home: number; away: number } {
  const qH = 10 ** (elo.home / scale);
  const qA = 10 ** (elo.away / scale);
  const delta = Math.round(k * (result.homeWin - qH / (qA + qH)));
  return {
    home: elo.home + delta,
    away: elo.away - delta,
  };
}

export function makeTempDir(prefix: string) {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function manyJsonFixtures() {
  return {
    fixtures: [
      {
        matchId: 'M002',
        homeId: 'T001',
        homeName: 'Avalon Rovers',
        awayId: 'T003',
        awayName: 'Cedar City FC',
        score: '1-2',
        date: '2026-02-16T17:00:00Z',
      },
      {
        matchId: 'M001',
        homeId: 'T001',
        homeName: 'Avalon Rovers',
        awayId: 'T002',
        awayName: 'Beacon United',
        score: '0-1',
        date: '2026-02-14T15:00:00Z',
      },
      {
        matchId: 'M018',
        homeId: 'T005',
        homeName: 'Elmwood Athletic',
        awayId: 'T002',
        awayName: 'Beacon United',
        score: '3-0',
        date: '2026-03-20T19:00:00Z',
      },
      {
        matchId: 'M008',
        homeId: 'T002',
        homeName: 'Beacon United',
        awayId: 'T005',
        awayName: 'Elmwood Athletic',
        score: '1-2',
        date: '2026-02-28T17:00:00Z',
      },
      {
        matchId: 'M006',
        homeId: 'T002',
        homeName: 'Beacon United',
        awayId: 'T003',
        awayName: 'Cedar City FC',
        score: '2-3',
        date: '2026-02-24T19:00:00Z',
      },
    ],
  };

}