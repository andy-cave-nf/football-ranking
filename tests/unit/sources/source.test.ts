import { JsonSource, type Source } from '../../../src/sources/sources';
import * as path from 'node:path';

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