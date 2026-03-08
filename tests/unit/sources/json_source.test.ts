import { JsonSource } from '../../../src/sources/json_source';
import * as path from 'node:path';
import { SafeSource, SortedSource, type Source, SourceError, StrictSourceDates } from '../../../src/sources/base';
import type { Result } from '../../../src/leagues/types';

let source: Source;
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

describe.todo('given a source containing multiple matches on different dates, when the matches are read between two dates', () => {
  it.todo('includes matches played between those dates')
  it.todo('includes matches falling on the start date')
  it.todo('includes matches falling on the end date')
  it.todo('excludes matches outside the date range')
})

describe.todo('given a source containing multiple matches, when there are no matches within the specified dates', () => {
  it.todo('returns an empty list')
})

describe.todo('given an empty source file, when the matches are read', () => {
  it.todo('returns an empty list')
})

describe.todo('given a source with a match with an empty result', () => {
  it.todo('raises a source error')
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
