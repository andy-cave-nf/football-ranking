import {
  SafeSource,
  SortedSource,
  type Source,
  SourceError,
  StrictSourceDates,
} from '../../../src/sources/base';
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

describe('Strict Source Dates', () => {
  let source: StrictSourceDates
  describe('given a source, when it is parsed with correctly ordered dates', () => {
    let origin: Source
    let expected: Result[]
    let actual: Result[]
    beforeEach(async () => {
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          return [
            {
              home: { id: 'id-1', name: 'team-1' },
              away: { id: 'id-2', name: 'team-2' },
              homeWin: 1,
              date: new Date(),
            },
          ];
        }
      }
      expected = await origin.results(new Date(), new Date())
      source = new StrictSourceDates(origin)
      actual = await source.results(new Date(), new Date())
    })
    it('returns the data unchanged', () => {
      expect(actual).toEqual(expected)
    })
  })
  it('a source error is raised if the end date is before the start date', async () => {
    const origin = {
      async results(_start:Date, _end:Date) {
        return []
      }
    }
    source = new StrictSourceDates(origin)
    await expect(() => source.results(new Date(2026,0,1), new Date(2000,0,1))).rejects.toThrowError(SourceError)

  })
})

describe('Strict Source Ids', () => {
  describe.todo('given a source that succeeds', async () => {
    describe.todo('when a result is parsed with unique team ids', () => {
      it.todo('returns the data unchanged')
    })
    describe.todo('when a result is parsed with duplicate team ids', () => {
      it.todo('raises a source error')
    })
  })
})

describe('Sorted Source', () => {
  let source: SortedSource
  let origin: Source
  let actual: Result[]
  let expected: Result[]
  describe('given a source with unsorted results, when the source is parsed', () => {
    beforeEach(async () => {
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          return [
            {
              home: { id: 'T001', name: 'Avalon Rovers' },
              away: { id: 'T003', name: 'Cedar City FC' },
              homeWin: 0,
              date: new Date(2026, 2, 16, 17),
            },
            {
              home: { id: 'T002', name: 'Beacon United' },
              away: { id: 'T005', name: 'Elmwood Athletic' },
              homeWin: 0,
              date: new Date(2026, 1, 28, 17),
            },
          ];
        }
      }
      source = new SortedSource(origin)
      expected = [
        {
          home: { id: 'T002', name: 'Beacon United' },
          away: { id: 'T005', name: 'Elmwood Athletic' },
          homeWin: 0,
          date: new Date(2026, 1, 28, 17),
        },
        {
          home: { id: 'T001', name: 'Avalon Rovers' },
          away: { id: 'T003', name: 'Cedar City FC' },
          homeWin: 0,
          date: new Date(2026, 2, 16, 17),
        },
      ];
      actual = await source.results(new Date(), new Date())
    })
    it('returns the results in chronological order', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a source with results in chronological order, when the source is parsed', () => {
    beforeEach(async () => {
      origin = {
        async results(_start: Date, _end: Date): Promise<Result[]> {
          return [
            {
              home: { id: 'T001', name: 'Avalon Rovers' },
              away: { id: 'T003', name: 'Cedar City FC' },
              homeWin: 0,
              date: new Date(2026, 0, 16, 17),
            },
            {
              home: { id: 'T002', name: 'Beacon United' },
              away: { id: 'T005', name: 'Elmwood Athletic' },
              homeWin: 0,
              date: new Date(2026, 1, 28, 17),
            },
          ];
        },
      };
      expected = await origin.results(new Date(), new Date())
      source = new SortedSource(origin);
      actual = await source.results(new Date(), new Date());
    });
    it('returns the results unchanged', () => {
      expect(actual).toEqual(expected)
    })
  })
})
