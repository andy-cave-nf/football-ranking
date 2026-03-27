import { DefaultRankings, RankingError, type Rankings, SafeRankings } from '../../src/rankings';
import type { Result, Team } from '../../src/leagues/types';
import type { Source } from '../../src/sources/base';
import type { League } from '../../src/leagues/base';
import { DefaultTeamMap} from '../../src/leagues/team_maps';

describe('Default Rankings', () => {
  let rankings: DefaultRankings;
  let source: Source;
  let league: League;
  const PushResultsFromLeague = class {
    constructor(public actual: Result[]) {}
    async record(result: Result): Promise<void> {
      this.actual.push(result)
    }
    get teams(){return new DefaultTeamMap(new Map<string,Team>())}
    standings(){return []}
  }
  describe('given a source with a single match and an empty league', () => {
    beforeEach(async() => {
      source = {
        async results(_start: Date, _end: Date) {
          return [
            {
              home: { id: 'id-1', name: 'team-1' },
              away: { id: 'id-2', name: 'team-2' },
              homeWin: 1,
              date: new Date(2000, 0, 1),
            },
          ];
        },
      };
    })
    describe('when run is called', () => {
      let actual: Result[]
      let expected: Result[]
      beforeEach(async() => {
        actual = []
        league = new PushResultsFromLeague(actual)
        rankings = new DefaultRankings(league, source)
        expected = await source.results(new Date(), new Date())
        await rankings.run(new Date(), new Date())
      })
      it('records the single match within the league', () => {
        expect(actual).toEqual(expected)
      })
    })
  })

  describe('given a source with two matches and an empty league', () => {
    beforeEach(async () => {
      source = {
        async results(_start: Date, _end: Date) {
          return [
            {
              home: { id: 'id-1', name: 'team-1' },
              away: { id: 'id-2', name: 'team-2' },
              homeWin: 1,
              date: new Date(2000, 0, 1),
            },
            {
              home: { id: 'id-3', name: 'team-3' },
              away: { id: 'id-4', name: 'team-4' },
              homeWin: 0.5,
              date: new Date(2000, 0, 2),
            },
          ];
        },
      };
    });
    describe('when run is called', () => {
      let actual: Result[];
      let expected: Result[];
      beforeEach(async () => {
        actual = []
        league = new PushResultsFromLeague(actual)
        rankings = new DefaultRankings(league, source);
        expected = await source.results(new Date(), new Date());
        await rankings.run(new Date(), new Date());
      })
      it('records both matches in the league in the order the source provided them', () => {
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('given a source with no matches', () => {
    let actual: Result[];
    let expected: Result[];
    beforeEach(async () => {
      source = {
        async results(_start: Date, _end: Date) {
          return []
        }
      }
      expected = await source.results(new Date(), new Date())
      actual = []
      league = {
        async record(result: Result) {
          actual.push(result);
        },
        teams: new DefaultTeamMap(new Map<string|number,Team>()).toReadOnly(),
        standings() {
          return [];
        }
      }
      rankings = new DefaultRankings(league, source)
    })
    describe('when run is called', () => {
      beforeEach(async () => {
        await rankings.run(new Date(), new Date())
      })
      it('no results are recorded', () => {
        expect(actual).toEqual(expected)
      })

    })
  })
})

describe('Safe Rankings', () => {
  let rankings: SafeRankings;
  let origin: Rankings;
  describe('given a ranking that succeeds', () => {
    beforeEach(async() => {
      origin = {
        async run(_from: Date, _to: Date){}
      }
      rankings = new SafeRankings(origin)
    })
    describe('when run is called', () => {
      it('no error is raised', async () => {
        await expect(rankings.run(new Date(), new Date())).resolves.not.toThrow()
      })
    })
  })
  describe('given a ranking that throws an unexpected error', () => {
    beforeEach(async() => {
      origin = {
        async run(_from: Date, _to: Date) {throw new Error('unexpected error')}
      }
      rankings = new SafeRankings(origin)
    })
    describe('when run is called', () => {
      it('wraps the error in a RankingError', async () => {
        await expect(rankings.run(new Date(), new Date())).rejects.toThrow(RankingError)
      })
    })
  })
})
