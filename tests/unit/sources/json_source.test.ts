import { JsonSource } from '../../../src/sources/json_source';
import * as path from 'node:path';
import { SafeSource, type Source, SourceError, StrictSourceDates } from '../../../src/sources/base';

let source: Source;
beforeEach(() => {
  const filepath = path.resolve(process.cwd(), 'tests', 'fixtures', 'json_source','five_team_season.json');
  source = new JsonSource(filepath);
});

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
