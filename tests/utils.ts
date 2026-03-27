import type { Result, Team } from '../src/leagues/types';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { InMemoryLeague } from '../src/leagues/in_memory';
import type { Ratings, Ruleset, TeamRating } from '../src/rulesets/base';
import { DefaultTeamMap, type TeamMap } from '../src/leagues/team_maps';




export function defaultInMemoryLeague(opts?:{ ruleset?: Ruleset; teamMap?: TeamMap<string, Team> }): InMemoryLeague {
  const fakeRuleset: Ruleset =  opts?.ruleset ?? {
    record(_result: Result, ratings: Ratings): Ratings {
      return {
        home:{mu:ratings.home.mu+1, sigma: ratings.home.sigma+1},
        away:{mu:ratings.away.mu+2, sigma: ratings.away.sigma+2},
      };
    },
    newRating():TeamRating {
      return {mu:1,sigma:1}
    },
    exposeSkill(rating:TeamRating):number {return rating.mu;}
  }

  const teamMap = opts?.teamMap ?? new DefaultTeamMap(new Map<string,Team>());
  return new InMemoryLeague(teamMap, fakeRuleset);
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