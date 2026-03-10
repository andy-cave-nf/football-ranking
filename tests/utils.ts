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

export function defaultJsonFixtures(filepath:string): JsonFixtures<JsonData> {
  return new DefaultJsonFixtures(filepath, {fixtures:[]});
}
