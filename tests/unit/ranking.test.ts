import {
  DefaultRankings,
} from '../../src/rankings';
import type { Result, Team } from '../../src/leagues/types';
import type { Source } from '../../src/sources/base';
import type { League } from '../../src/leagues/base';
import { DefaultTeamMap} from '../../src/leagues/team_maps';

// let rankings: Rankings;
// let league: League;
// let source: Source;
// let dates: { start: Date; end: Date };
// let results: Result[];

describe.only('Default Rankings', () => {
  let rankings: DefaultRankings;
  let source: Source;
  let league: League;
  const PushResultsFromLeague = class {
    constructor(public actual: Result[]) {}
    async record(result: Result): Promise<void> {
      this.actual.push(result)
    }
    get teams(){return new DefaultTeamMap(new Map<string,Team>())}
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


//
// beforeEach(async () => {
//   dates = { start: new Date(2000, 0, 1), end: new Date(2001, 0, 1) };
//   results = [
//     {
//       home: { id: '1', name: 'team-1' },
//       away: { id: '2', name: 'team-3' },
//       homeWin: 1,
//       date: new Date(dates.start),
//     },
//     {
//       home: { id: '2', name: 'team-2' },
//       away: { id: '3', name: 'team-3' },
//       homeWin: 0.5,
//       date: new Date(dates.start),
//     },
//     {
//       home: { id: '1', name: 'team-1' },
//       away: { id: '3', name: 'team-3' },
//       homeWin: 0,
//       date: new Date(dates.start),
//     },
//   ];
//
//   league = new FakeLeague(25,25/3);
//   source = new FakeSource(results);
//   rankings = new DefaultRankings(league, source);
// });
//
// describe('Ranking makes correct calls on running', async () => {
//   beforeEach(async () => {
//     await rankings.run(dates.start, dates.end);
//   });
//
//   it('tests matches are called from the source', async () => {
//     expect(source.results).toBeCalledWith(dates.start, dates.end);
//   });
//
//   it('tests that the matches are recorded by the league', async () => {
//     results.forEach((result) => {
//       expect(league.record).toBeCalledWith(result);
//     });
//   });
// });
//
// describe('test that printing rankings call pages', async () => {
//   let fakePage: Page;
//   let spy: Mock<() => ReadOnlyTeamMap<number | string, Team>>;
//   beforeEach(async () => {
//     spy = vi.spyOn(FakeLeague.prototype, 'teams', 'get');
//     fakePage = new FakePage();
//     await rankings.print(fakePage);
//   });
//   afterEach(async () => {
//     vi.restoreAllMocks();
//     vi.clearAllMocks();
//   });
//   it('tests that teams are called from leagues', async () => {
//     expect(spy).toBeCalledTimes(1);
//   });
//
//   it('tests print is called once', async () => {
//     expect(fakePage.print).toBeCalledWith(league.teams.values());
//   });
// });
//
// describe('test strict rankings throws errors', async () => {
//   let strictRankings: Rankings;
//   beforeEach(async () => {
//     strictRankings = new RankingsWithStrictDates(rankings);
//   });
//   it('tests an error is raised if the dates are incompatible', async () => {
//     await expect(
//       strictRankings.run(new Date(2020, 1, 1), new Date(1970, 1, 1))
//     ).rejects.toThrowError(RankingError);
//   });
// });
//
// describe('tests error handling of safe rankings', async () => {
//   let safeRankings: Rankings;
//   beforeEach(async () => {
//     safeRankings = new SafeRankings(new ErroredRanking());
//   });
//   it('tests run raises a ranking error', async () => {
//     await expect(safeRankings.run(dates.start, dates.end)).rejects.toThrowError(RankingError);
//   });
//   it('tests page raises a ranking error', async () => {
//     await expect(safeRankings.print(new FakePage())).rejects.toThrowError(RankingError);
//   });
// });
