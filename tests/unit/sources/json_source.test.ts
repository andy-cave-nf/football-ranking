import { JsonSource } from '../../../src/sources/json_source';
import * as path from 'node:path';
import { SafeSource, SortedSource, type Source, SourceError, StrictSourceDates } from '../../../src/sources/base';
import type { Result } from '../../../src/leagues/types';

import { type JsonFixtures, JsonParseError } from '../../../src/sources/parsers/base';
import { manyJsonFixtures } from '../../utils';

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