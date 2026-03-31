import type { FixtureResponse } from '../../../../src/sources/types';
import { awayWin, draw, homeWin } from '../../../utils';
import type { Result } from '../../../../src/leagues/types';
import {
  DefaultResultFromApi,
  type ResultFromApi,
  ResultsFromApiError,
  SafeResultFromApi,
} from '../../../../src/sources/api_source/result_from_source';

describe("DefaultResultFromApi", () => {
  let result: DefaultResultFromApi
  let raw: FixtureResponse
  describe("given a home win from an api source", () => {
    beforeEach(() => {
      raw = homeWin
      result = new DefaultResultFromApi(raw)
    })
    describe("when the result is processed", () => {
      let actual: Result
      beforeEach(() => {
        actual = result.result()
      })
      it("returns the result as a home win with the correct date and team names and ids", () => {
        expect(actual).toEqual({
          home: {id: "52", name: "Crystal Palace"},
          away: {id: "39", name: "Wolves"},
          homeWin: 1,
          date: new Date(2026,1,22,14)
        })
      })
    })
  })
  describe("given an away win from an api source", () => {
    beforeEach(() => {
      raw = awayWin
      result = new DefaultResultFromApi(raw)
    })
    describe("when the result is processed", () => {
      let actual: Result
      beforeEach(() => {
        actual = result.result()
      })
      it('returns the result as an away win with the correct date and team names and ids', () => {
        expect(actual).toEqual({
          home: {id: "52", name: "Crystal Palace"},
          away: {id: "39", name: "Wolves"},
          homeWin: 0,
          date: new Date(2026,1,22,14)
        })
      })
    })
  })
  describe('given a draw from an api source', () => {
    beforeEach(() => {
      raw = draw
      result = new DefaultResultFromApi(raw)
    })
    describe('when the result is processed', () => {
      let actual: Result
      beforeEach(() => {
        actual = result.result()
      })
      it('returns the result as a draw with the correct date and team names and ids', () => {
        expect(actual).toEqual({
          home: { id: '65', name: 'Nottingham Forest' },
          away: { id: '35', name: 'Bournemouth' },
          homeWin: 0.5,
          date: new Date('2024-08-17T14:00:00+00:00'),
        });
      })
    })
  })
  describe("given an empty result from an api source", () => {
    beforeEach(() => {
      // @ts-expect-error: expect type error for empty result
      raw = {}
      result = new DefaultResultFromApi(raw)
    })
    describe("when the result is processed", () => {
      it('throws a type error', () => {
        expect(()=>result.result()).toThrow(TypeError)
      })
    })
  })

  describe("given a result with an unexpected structure", () => {
    beforeEach(() => {
      // @ts-expect-error: expect type error for empty result
      raw = {bad: 'structure'}
      result = new DefaultResultFromApi(raw)
    })
    describe("when the result is processed", () => {
      it('throws a type error', () => {
        expect(() => result.result()).toThrow(TypeError)
      })
    })
  })
})

describe('SafeResultFromApi', () => {
  let origin: ResultFromApi
  let result: SafeResultFromApi
  describe('given an origin result that passes',() => {
    beforeEach(() => {
      origin = {
        result(): Result {
          return {
            home: {id: "1", name: "team-1"},
            away: {id: "2", name: "team-2"},
            homeWin: 1,
            date: new Date(2026,1,22,14)
          }
        },
      };
      result = new SafeResultFromApi(origin)
    })
    describe('when the result is processed', () => {
      let actual: Result
      beforeEach(() => {
        actual = result.result()
      })
      it('returns the transformed result unchanged', () => {
        expect(actual).toEqual(origin.result())
      })
    })
  })
  describe('given an origin result that raises an unexpected error', () => {
    beforeEach(() => {
      origin = {
        result(): Result {throw new Error('unexpected error')}
      }
      result = new SafeResultFromApi(origin)
    })
    describe('when the result is processed', () => {
      it('wraps the error in a result from api error', () => {
        expect(() => result.result()).toThrow(ResultsFromApiError)
      })
    })
  })
})