import {
  JsonSource,
  SafeSource,
  type Source,
  SourceError,
  StrictSourceDates,
} from '../../../src/sources/sources';
import * as path from 'node:path';
import type { Page } from '../../../src/pages/pages';

let source: Source
beforeEach(() => {
  const filepath = path.resolve(process.cwd(), 'tests', 'fixtures.json');
  source = new JsonSource(filepath);
})

describe('test that all matches are loaded', async () => {
  it('tests the right number of matches are loaded between dates', async () => {
    const matches = await source.matches(new Date(2026,1,1), new Date(2027,1,1))
    expect(matches.length).toBe(20)
  })
  it('tests that data is partially loaded with these datas', async () => {
    const matches = await source.matches(new Date(2026,1,1), new Date(2026,1,16))
    expect(matches.length).toBe(1)
  })
})

describe('test that all teams are loaded', async () => {
  it('tests that the right number of teams are loaded', async () => {
    const teams = await source.teams()
    expect(teams.length).toBe(5)
  })
})

describe('test that strict sources raise correctly', async () => {
  let strictSource: Source
  beforeEach(() => {
    strictSource = new StrictSourceDates(source)
  })
  it('tests that a source error is raised for incompatible dates', async () => {
    await expect(strictSource.matches(new Date(2026,1,1), new Date(2025,1,1))).rejects.toThrow(SourceError)
  })
})

describe('tests that safe sources handle errors throw correct errors', async () => {
  let erroredSource: Source
  let safeSource: Source
  beforeEach(() => {
    erroredSource =  class implements Source {
      teams = vi.fn(async() => {throw new Error('teams throws an error')})
      matches = vi.fn(async(_start:Date,_end:Date) => {throw new Error('matches raises an error')})
    }
    safeSource = new SafeSource(erroredSource)
  })
  it('tests that teams raises a source error', async () => {
    await expect(safeSource.teams()).rejects.toThrow(SourceError)
  })
})