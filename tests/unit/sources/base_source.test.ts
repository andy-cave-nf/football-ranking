import { SafeSource, type Source, SourceError } from '../../../src/sources/base';
import type { Result } from '../../../src/leagues/types';

describe('Safe Source', () => {
  let source: SafeSource
  let origin: Source
  describe('given a source that succeeds, when the source is parsed', () => {
    let expected: Result[]
    let actual: Result[]
    beforeEach(async () => {
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          return [
            {
              home:{id:'id-1',name:'team-1'},
              away:{id:'id-2',name:'team-2'},
              homeWin: 1,
              date: new Date()
            }
          ]
        }
      }
      expected = await origin.results(new Date(), new Date())
      source = new SafeSource(origin)
      actual = await source.results(new Date(), new Date())
    })
    it('returns the data unchanged', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a source that fails, when the source is parsed', () => {
    beforeEach(async () => {
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          throw new Error('errored source')
        }
      }
      source = new SafeSource(origin)
    })
    it('raises a source error', async () => {
      await expect(() => source.results(new Date(), new Date())).rejects.toThrowError(SourceError)
    })
  })
})

describe.todo('Strict Source Dates', () => {
  describe('given a source, when it is parsed with correctly ordered dates', () => {
    it.todo('returns the data unchanged')
  })
  it.todo('a source error is raised if the end date is before the start date')
})

describe.todo('Sorted Source', () => {
  describe('given a source with unsorted results, when the source is parsed', () => {
    it.todo('returns the results in chronological order')
  })
})
