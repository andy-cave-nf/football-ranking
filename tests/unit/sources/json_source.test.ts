import { JsonSource } from '../../../src/sources/json_source';
import * as path from 'node:path';
import { SafeSource, SortedSource, type Source, SourceError, StrictSourceDates } from '../../../src/sources/base';
import type { Result } from '../../../src/leagues/types';

import { type JsonFixtures, JsonParseError } from '../../../src/sources/parsers/base';
import { manyJsonFixtures } from '../../utils';

let source: Source;

describe('Json Source', () => {
  let source: JsonSource;
  let expected: Result[]
  let actual: Result[]
  let fixture: JsonFixtures;
  describe('given successfully parsed matches, when the matches are read between two dates', () => {
    beforeEach(async () => {
      fixture = {
        async parse() {
          return manyJsonFixtures()
        }
      }
      expected = [
        {
          home: { id: 'T001', name: 'Avalon Rovers' },
          away: { id: 'T003', name: 'Cedar City FC' },
          homeWin: 0,
          date: new Date(2026, 1, 16, 17),
        },
        {
          home: { id: 'T002', name: 'Beacon United' },
          away: { id: 'T005', name: 'Elmwood Athletic' },
          homeWin: 0,
          date: new Date(2026, 1, 28, 17),
        },
        {
          home: { id: 'T002', name: 'Beacon United' },
          away: { id: 'T003', name: 'Cedar City FC' },
          homeWin: 0,
          date: new Date(2026, 1, 24, 19),
        },
      ];
      source = new JsonSource(fixture)
      actual = await source.results(new Date(2026, 1, 16), new Date(2026, 1, 28));
    })
    it('returns only the matches within the date range inclusive of both boundaries', () => {
      expect(actual).toStrictEqual(expected);
    })
  })
  describe('given successfully parsed matches, when there are no matches between both dates', () => {
    beforeEach(async () => {
      fixture = {
        async parse() {
          return manyJsonFixtures()
        }
      }
      source = new JsonSource(fixture)
      expected = []
      actual = await source.results(new Date(2000, 1, 16), new Date(2000, 1, 28));
    })
    it('returns an empty list', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a successfully parsed empty match file, when the matches are read', () => {
    beforeEach(async () => {
      fixture  = {
        async parse() { return {fixtures:[]} }
      }
      source = new JsonSource(fixture)
      expected = []
      actual = await source.results(new Date(2000, 1, 16), new Date(2000, 1, 28));
    })
    it('returns an empty list', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a successfully parsed home win, when the match is read', () => {
    beforeEach(async () => {
      fixture  = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M018',
                homeId: 'T005',
                homeName: 'Elmwood Athletic',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: '3-0',
                date: '2026-03-20T19:00:00',
              },
            ],
          };
        }
      }
      source = new JsonSource(fixture)
      expected = [{home:{id:"T005", name:'Elmwood Athletic'}, away:{id:'T002', name:'Beacon United'}, homeWin:1, date: new Date(2026, 2, 20, 19)}]
      actual = await source.results(new Date(2026, 2, 20), new Date(2026, 2, 26));
    })
    it('returns a home win result', () => {
      expect(actual).toStrictEqual(expected)
    })
  })
  describe('given a successfully parsed away win, when the match is read', () => {
    beforeEach(async () => {
      fixture = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M018',
                homeId: 'T005',
                homeName: 'Elmwood Athletic',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: '1-2',
                date: '2026-03-20T19:00:00',
              },
            ],
          };
        },
      };
      source = new JsonSource(fixture);
      expected = [
        {
          home: { id: 'T005', name: 'Elmwood Athletic' },
          away: { id: 'T002', name: 'Beacon United' },
          homeWin: 0,
          date: new Date(2026, 2, 20, 19),
        },
      ];
      actual = await source.results(new Date(2026, 2, 20), new Date(2026, 2, 26));
    })
    it('returns an away win result', () => {
      expect(actual).toStrictEqual(expected)
    })
  })
  describe('given a successfully parsed draw, when the match is read', () => {
    beforeEach(async () => {
      fixture = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M018',
                homeId: 'T005',
                homeName: 'Elmwood Athletic',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: '2-2',
                date: '2026-03-20T19:00:00',
              },
            ],
          };
        },
      };
      source = new JsonSource(fixture);
      expected = [
        {
          home: { id: 'T005', name: 'Elmwood Athletic' },
          away: { id: 'T002', name: 'Beacon United' },
          homeWin: 0.5,
          date: new Date(2026, 2, 20, 19),
        },
      ];
      actual = await source.results(new Date(2026, 2, 20), new Date(2026, 2, 26));
    });
    it('returns a drawn result', () => {
      expect(actual).toStrictEqual(expected)
    })
  })
})


beforeEach(() => {
  const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source','five_team_season.json');
  source = new JsonSource(filepath);
});

describe('given a source containing a single match, when the matches are read', () => {
  let source: Source;
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source','single_match.json');
    source = new JsonSource(filepath);
    actual = await source.results(new Date(2026,1,13),new Date(2026,1,15));
  })
  it('returns a single result with the expected teams, outcome and date', () => {
    expect(actual[0]).toStrictEqual({
      home: {id: 'T001', name: 'Avalon Rovers'},
      away: {id: 'T002', name: 'Beacon United'},
      homeWin: 0,
      date: new Date(2026,1,14,15,0),
    })
  })
})

describe('given a source containing multiple unsorted matches, when all the matches are read', () => {
  let source: Source
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source','multiple_unsorted_matches.json');
    source = new SortedSource(new JsonSource(filepath));
    actual = await source.results(new Date(2026,1,13),new Date(2026,5,30));
  })
  it('returns all matches in chronological order', () => {
    const isSorted = actual.every((match,i) => i === 0 || actual[i-1]!.date <= match.date);
    expect(isSorted).toBe(true);
  })
})

describe('given a source containing multiple matches on different dates, when the matches are read between two dates', () => {
  let source: Source;
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(
      process.cwd(),
      'tests',
      'fixtures',
      'json_source',
      'multiple_unsorted_matches.json'
    );
    source = new SortedSource(new JsonSource(filepath));
    actual = await source.results(new Date(2026, 1, 16), new Date(2026, 1, 28));
  });
  it('returns only the matches within the date range, inclusive of both boundaries', ()=> {
    const expected = [
      {
        home: {id: 'T001', name: 'Avalon Rovers'},
        away: {id: 'T003', name: 'Cedar City FC'},
        homeWin: 0,
        date: new Date(2026,1,16,17)
      },
      {
        home: {id: 'T002', name: 'Beacon United'},
        away: {id: 'T003', name: 'Cedar City FC'},
        homeWin: 0,
        date: new Date(2026,1,24,19)
      },
      {
        home: {id: 'T002', name: 'Beacon United'},
        away: {id: 'T005', name: 'Elmwood Athletic'},
        homeWin: 0,
        date: new Date(2026,1,28,17)
      }
    ]
    expect(actual).toEqual(expected);
  })
})

describe('given a source containing multiple matches, when there are no matches within the specified dates', () => {
  let source: Source;
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(
      process.cwd(),
      'tests',
      'fixtures',
      'json_source',
      'multiple_unsorted_matches.json'
    );
    source = new JsonSource(filepath);
    actual = await source.results(new Date(2026, 0, 1), new Date(2026, 0, 2));
  })
  it('returns an empty list', ()=> {
    const expected: Result[] = []
    expect(actual).toEqual(expected)
  })
})

describe('given a source file with an empty object, when the matches are read', () => {
  let source: Source;
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(
      process.cwd(),
      'tests',
      'fixtures',
      'json_source',
      'empty.json'
    );
    source = new JsonSource(filepath);
    actual = await source.results(new Date(2026, 0, 1), new Date(2026, 0, 2));
  });
  it('returns an empty list', () => {
    const expected: Result[] = []
    expect(actual).toEqual(expected)
  })
})

describe('given a source file with an empty fixtures key, when the matches are read', () => {
  let source: Source;
  let actual: Result[];
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source', 'empty_fixtures.json');
    source = new JsonSource(filepath);
    actual = await source.results(new Date(2026, 0, 1), new Date(2026, 0, 2));
  });
  it('returns an empty list', () => {
    const expected: Result[] = []
    expect(actual).toEqual(expected)
  });
});

describe('given an empty source file that is not a valid json file, when the matches are read', async () => {
  let source: Source;
  beforeEach(async () => {
    const filepath = path.resolve(
      process.cwd(),
      'tests',
      'fixtures',
      'json_source',
      'illegal_empty.json'
    );
    source = new JsonSource(filepath);
  });
  it('raises a source error', async () => {
    await expect(source.results(new Date(2026, 0, 1), new Date(2026, 0, 2))).rejects.toThrowError(JsonParseError);
  })
})


describe.todo('given an invalid source file, when the matches are read', async () => {
  it.todo('raises a source error');
})

describe.todo('given a source with a match with an empty home team', () => {
  it.todo('raises a source error')
})

describe.todo('given a source with a match with an empty away team', () => {
  it.todo('raises a source error')
})

describe.todo('given a source containing a single match, when matches are to be read in the future', () => {
  it.todo('raises a source error')
} )

describe.todo('given a source containing a match that has not finished, when the match is read',() => {
  it.todo('raises a source error')
})

describe('test that all matches are loaded', async () => {
  it('tests the right number of matches are loaded between dates', async () => {
    const matches = await source.results(new Date(2026, 1, 1), new Date(2027, 1, 1));
    expect(matches).toHaveLength(20);
  });
  it('tests that data is partially loaded with these dates', async () => {
    const matches = await source.results(new Date(2026, 1, 1), new Date(2026, 1, 16));
    expect(matches).toHaveLength(1);
  });
});

describe('test that strict sources raise correctly', async () => {
  let strictSource: Source;
  beforeEach(() => {
    strictSource = new StrictSourceDates(source);
  });
  it('tests that a source error is raised for incompatible dates', async () => {
    await expect(strictSource.results(new Date(2026, 1, 1), new Date(2025, 1, 1))).rejects.toThrow(
      SourceError
    );
  });
});

describe('tests that safe sources handle errors throw correct errors', async () => {
  let erroredSource: Source;
  let safeSource: Source;
  beforeEach(() => {
    erroredSource = {
      results: vi.fn(async (_start: Date, _end: Date) => {
        throw new Error('matches raises an error');
      }),
    };
    safeSource = new SafeSource(erroredSource);
  });

  it('tests that results raises a source error', async () => {
    await expect(safeSource.results(new Date(), new Date())).rejects.toThrow(SourceError);
  });
});
