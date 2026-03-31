import type { Result, Team } from '../src/leagues/types';
import { InMemoryLeague } from '../src/leagues/in_memory';
import type { Ratings, Ruleset, TeamRating } from '../src/rulesets/base';
import { DefaultTeamMap, type TeamMap } from '../src/leagues/team_maps';
import type { FixtureResponse } from '../src/sources/types';




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

export const homeWin: FixtureResponse = {
    "fixture": {
      "id": 1379232,
      "referee": "Thomas Kirk, England",
      "timezone": "UTC",
      "date": "2026-02-22T14:00:00+00:00",
      "timestamp": 1771768800,
      "periods": {
        "first": 1771768800,
        "second": 1771772400
      },
      "venue": {
        "id": 525,
        "name": "Selhurst Park",
        "city": "London"
      },
      "status": {
        "long": "Match Finished",
        "short": "FT",
        "elapsed": 90,
        "extra": 10
      }
    },
    "league": {
      "id": 39,
      "name": "Premier League",
      "country": "England",
      "logo": "https://media.api-sports.io/football/leagues/39.png",
      "flag": "https://media.api-sports.io/flags/gb-eng.svg",
      "season": 2025,
      "round": "Regular Season - 27",
      "standings": true
    },
    "teams": {
      "home": {
        "id": 52,
        "name": "Crystal Palace",
        "logo": "https://media.api-sports.io/football/teams/52.png",
        "winner": true
      },
      "away": {
        "id": 39,
        "name": "Wolves",
        "logo": "https://media.api-sports.io/football/teams/39.png",
        "winner": false
      }
    },
    "goals": {
      "home": 1,
      "away": 0
    },
    "score": {
      "halftime": {
        "home": 0,
        "away": 0
      },
      "fulltime": {
        "home": 1,
        "away": 0
      },
      "extratime": {
        "home": null,
        "away": null
      },
      "penalty": {
        "home": null,
        "away": null
      }
    }
  }

export const awayWin: FixtureResponse = {
  fixture: {
    id: 1379232,
    referee: 'Thomas Kirk, England',
    timezone: 'UTC',
    date: '2026-02-22T14:00:00+00:00',
    timestamp: 1771768800,
    periods: {
      first: 1771768800,
      second: 1771772400,
    },
    venue: {
      id: 525,
      name: 'Selhurst Park',
      city: 'London',
    },
    status: {
      long: 'Match Finished',
      short: 'FT',
      elapsed: 90,
      extra: 10,
    },
  },
  league: {
    id: 39,
    name: 'Premier League',
    country: 'England',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    flag: 'https://media.api-sports.io/flags/gb-eng.svg',
    season: 2025,
    round: 'Regular Season - 27',
    standings: true,
  },
  teams: {
    home: {
      id: 52,
      name: 'Crystal Palace',
      logo: 'https://media.api-sports.io/football/teams/52.png',
      winner: false,
    },
    away: {
      id: 39,
      name: 'Wolves',
      logo: 'https://media.api-sports.io/football/teams/39.png',
      winner: true,
    },
  },
  goals: {
    home: 0,
    away: 1,
  },
  score: {
    halftime: {
      home: 0,
      away: 0,
    },
    fulltime: {
      home: 0,
      away: 1,
    },
    extratime: {
      home: null,
      away: null,
    },
    penalty: {
      home: null,
      away: null,
    }
  }
};

export const draw: FixtureResponse = {
  "fixture": {
    "id": 1208026,
    "referee": "M. Oliver",
    "timezone": "UTC",
    "date": "2024-08-17T14:00:00+00:00",
    "timestamp": 1723903200,
    "periods": {
      "first": 1723903200,
      "second": 1723906800
    },
    "venue": {
      "id": 566,
      "name": "The City Ground",
      "city": "Nottingham, Nottinghamshire"
    },
    "status": {
      "long": "Match Finished",
      "short": "FT",
      "elapsed": 90,
      "extra": null
    }
  },
  "league": {
    "id": 39,
    "name": "Premier League",
    "country": "England",
    "logo": "https://media.api-sports.io/football/leagues/39.png",
    "flag": "https://media.api-sports.io/flags/gb-eng.svg",
    "season": 2024,
    "round": "Regular Season - 1",
    "standings": true
  },
  "teams": {
    "home": {
      "id": 65,
      "name": "Nottingham Forest",
      "logo": "https://media.api-sports.io/football/teams/65.png",
      "winner": null
    },
    "away": {
      "id": 35,
      "name": "Bournemouth",
      "logo": "https://media.api-sports.io/football/teams/35.png",
      "winner": null
    }
  },
  "goals": {
    "home": 1,
    "away": 1
  },
  "score": {
    "halftime": {
      "home": 1,
      "away": 0
    },
    "fulltime": {
      "home": 1,
      "away": 1
    },
    "extratime": {
      "home": null,
      "away": null
    },
    "penalty": {
      "home": null,
      "away": null
    }
  }
}
