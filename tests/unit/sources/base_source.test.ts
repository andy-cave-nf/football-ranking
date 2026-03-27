import {
  SafeSource,
  SortedSource,
  type Source,
  SourceError,
  StrictSourceDates,
  StrictSourceIds,
  UniqueResultsSource,
} from '../../../src/sources/base';
import type { Result } from '../../../src/leagues/types';
import { add, addDays } from 'date-fns';

describe('Safe Source', () => {
  let source: SafeSource
  let origin: Source
  describe('given a source that succeeds', () => {
    let date: Date
    beforeEach(async () => {
      date = new Date(2000,0,1)
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          return [
            {
              home:{id:'id-1',name:'team-1'},
              away:{id:'id-2',name:'team-2'},
              homeWin: 1,
              date
            }
          ]
        }
      }
      source = new SafeSource(origin)
    })

    describe('when the source is parsed', () => {
      let expected: Result[]
      let actual: Result[]
      beforeEach(async () => {
        expected = await origin.results(date, date)
        actual = await source.results(date, date)
      })
      it('returns the data unchanged', () => {
        expect(actual).toEqual(expected)
      })
    })
  })
  describe('given a source that fails', () => {
    beforeEach(async () => {
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          throw new Error('errored source')
        }
      }
      source = new SafeSource(origin)
    })
    describe('when the source is parsed', () => {
      it('raises a source error', async () => {
        await expect(() => source.results(new Date(), new Date())).rejects.toThrowError(SourceError)
      })
    })
  })
})

describe('Strict Source Dates', () => {
  let source: StrictSourceDates
  describe('given a source with a single result', () => {
    let origin: Source
    let date: Date
    beforeEach(async () => {
      date = new Date(2000,0,1)
      origin = {
        async results(_start:Date, _end:Date):Promise<Result[]> {
          return [
            {
              home: { id: 'id-1', name: 'team-1' },
              away: { id: 'id-2', name: 'team-2' },
              homeWin: 1,
              date
            },
          ];
        }
      }
      source = new StrictSourceDates(origin)
    })
    describe('when it is parsed with chronologically ordered dates', () => {
      it('does not raise a source error', async () => {
        await expect(() => source.results(date,addDays(date,1))).not.toThrow(SourceError)
      })
      it.each([
        ['the result inside the date interval',addDays(date,-1), addDays(date,1)],
        ['the result outside the date interval',addDays(date,1), addDays(date,2)],
      ])('returns the data unchanged for %s', async (_message, start, end) => {
        const actual = await source.results(start, end)
        const expected = await origin.results(start, end)
        expect(actual).toEqual(expected)
      })
    })
    describe('when it is parsed with the same start and end dates', () => {
      it('does not raise a source error', async () => {
        await expect(()=> source.results(date,date)).not.toThrow(SourceError)
      })
      it.each([
        ['parsing the day of the result', date],
        ['parsing before the day of the result', addDays(date,-1)],
        ['parsing after the day of the result', addDays(date,1)],
      ])('returns the data unchanged for %s', async (_message, day) => {
        const actual = await source.results(day, day)
        const expected = await origin.results(day, day)
        expect(actual).toEqual(expected)
      })
    })
    describe('when it is parsed with dates out of chronological order', () => {
      it('raises a source error', async () => {
        await expect(()=> source.results(date,addDays(date,-1))).rejects.toThrow(SourceError)
      })
    })
  })
  describe('given a source with two results on different days', () => {
    let origin: Source
    let firstDate: Date
    let secondDate: Date
    beforeEach(async () => {
      firstDate = new Date(2000, 0, 1);
      secondDate = new Date(2001, 0, 1);
      const orderedResults: Result[] = [
        {
          home: { id: 'id-1', name: 'team-1' },
          away: { id: 'id-2', name: 'team-2' },
          homeWin: 1,
          date: firstDate,
        },
        {
          home: { id: 'id-3', name: 'team-3' },
          away: { id: 'id-4', name: 'team-4' },
          homeWin: 0,
          date: secondDate,
        }
      ]
      origin = {
        async results(start:Date, end: Date): Promise<Result[]> {
          return orderedResults.filter(
            (fixture) =>
              fixture.date >= start &&
              fixture.date <= add(end, { days: 1 })
          );
        }
      }
      source = new StrictSourceDates(origin);
    });


    describe('when it is parsed with chronologically ordered dates', () => {
      it('does not raise a source error', async () => {
        await expect(()=>source.results(firstDate,secondDate)).not.toThrow(SourceError)
      })
      it.each([
        ['only the first result inside the date interval',addDays(firstDate,-1),addDays(firstDate,1)],
        ['only the second result inside the date interval',addDays(secondDate,-1),addDays(secondDate,1)],
        ['both results inside the date interval', addDays(firstDate,-1),addDays(secondDate,1)],
        ['both results are before the date interval', addDays(secondDate,1),addDays(secondDate,2)],
        ['both results are after the date interval', addDays(firstDate,-2),addDays(firstDate,-1)],
        ['first result is on the left side of the date interval', firstDate,addDays(firstDate,1)],
        ['first result is on the right side of the date interval',addDays(firstDate,-1),firstDate],
        ['second result is on the right side of the date interval', addDays(secondDate,-1),secondDate],
        ['second result is on the left side of the date interval', secondDate,addDays(secondDate,1)],
      ])('returns the data unchanged for %s', async (_message, start, end) => {
        const actual = await source.results(start, end)
        const expected = await origin.results(start, end)
        expect(actual).toEqual(expected)
      })
    })
    describe('when it is parsed with the same start and end dates', () => {
      it('does not raise a source error', async () => {
        await expect(() => source.results(firstDate,firstDate)).not.toThrow(SourceError)
      })
      it.each([
        ['parsing the day of the first result',firstDate],
        ['parsing the day of the second result',secondDate],
        ['parsing a day that does not have a result',addDays(firstDate,-1)]
      ])('returns the data unchanged for %s', async (_message, date) => {
        const actual = await source.results(date,date)
        const expected = await origin.results(date,date)
        expect(actual).toEqual(expected)
      })
    })
    describe('when it is parsed with unchronologically ordered dates', () => {
      it('raises a source error', async () => {
        await expect(()=>source.results(secondDate,firstDate)).rejects.toThrow(SourceError)
      })
    })
  })
})

describe('Strict Source Ids', () => {
  let origin: Source
  let source: StrictSourceIds
  describe('given a source that succeeds', async () => {
    describe('when a result is parsed with unique team ids', () => {
      let results: Result[]
      let date: Date
      beforeEach(() => {
        date = new Date(2000,0,1)
        results = [
          {
            home: {id:'id-1',name:'home'},
            away: {id:'id-2',name:'away'},
            homeWin: 1,
            date,
          }
        ]
        origin = {
          async results(_start:Date, _end:Date): Promise<Result[]> {
            return results
          }
        }
        source = new StrictSourceIds(origin)
      })
      it('returns the data unchanged', async () => {
        const actual = await source.results(addDays(date,-1),date)
        const expected = await origin.results(addDays(date,-1),date)
        expect(actual).toEqual(expected)
      })
    })
    describe('when a result is parsed with duplicate team ids', () => {
      let results: Result[]
      let date: Date
      beforeEach(() => {
        date = new Date(2000,0,1)
        results = [
          {
            home: {id:'id-1', name: 'home'},
            away: {id:'id-1', name: 'away'},
            homeWin:1,
            date,
          }
        ]
        origin = {
          async results(_start:Date, _end:Date): Promise<Result[]> {
            return results
          }
        }
        source = new StrictSourceIds(origin)
      })
      it('raises a source error', async () => {
        await expect(()=>source.results(addDays(date,-1),date)).rejects.toThrow(SourceError)
      })
    })
  })
})

describe('Unique Results Source', () => {
  let origin: Source
  let source: UniqueResultsSource
  describe('given a source that succeeds', async () => {
    describe('when two results are parsed that are not identical', () => {
      let results: Result[]
      let firstDate: Date
      let secondDate: Date
      let originCallCount: number
      beforeEach(() => {
        originCallCount = 0
        firstDate = new Date(2000,0,1)
        secondDate = new Date(2000,0,2)
        results = [
          {
            home:{id:'id-1',name:'home'},
            away:{id:'id-2',name:'away'},
            homeWin:1,
            date: firstDate,
          },
          {
            home:{id:'id-3',name:'home'},
            away:{id:'id-4',name:'away'},
            homeWin:0,
            date: secondDate,
          }
        ]
        origin = {
          async results(_start:Date, _end:Date): Promise<Result[]> {
            originCallCount++
            return results
          }
        }
        source = new UniqueResultsSource(origin)
      })
      it('returns the data unchanged', async () => {
        const actual = await source.results(firstDate,secondDate)
        const expected = await origin.results(firstDate,secondDate)
        expect(actual).toEqual(expected)
      })
      it('calls the original source only once', async ()=> {
        await source.results(firstDate,secondDate)
        expect(originCallCount).toEqual(1)
      })
    })
    describe('when two results are parsed that are identical', () => {
      let results: Result[]
      let date: Date
      beforeEach(() => {
        date = new Date(2000,0,1)
        results = [
          {
            home: { id: 'id-1', name: 'home' },
            away: { id: 'id-2', name: 'away' },
            homeWin: 1,
            date,
          },
          {
            home: { id: 'id-1', name: 'home' },
            away: { id: 'id-2', name: 'away' },
            homeWin: 1,
            date: date,
          },
        ];
        origin = {
          async results(_start:Date, _end:Date): Promise<Result[]> {
            return results
          }
        }
        source = new UniqueResultsSource(origin)
      })
      it('raises a source error', async () => {
        await expect(()=>source.results(date,date)).rejects.toThrow(SourceError)
      })
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
