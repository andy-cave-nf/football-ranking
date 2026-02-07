import { JsonSource, type Source } from '../../../src/sources/sources';
import * as path from 'node:path';

describe('test that all matches are loaded', async () => {
  let source: Source
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests','fixtures.json');
    source = new JsonSource(filepath)

  })
  it('tests the right number of matches are loaded between dates', async () => {
    const matches = await source.matches(new Date(2026,2,1), new Date(2027,2,1))
    expect(matches.length).toBe(20)
  })
  it('tests that data is partially loaded with these datas', async () => {
    const matches = await source.matches(new Date(2026,2,1), new Date(2026,2,16))
    expect(matches.length).toBe(1)
  })
})

describe('test that all teams are loaded')