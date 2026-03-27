import { type JsonFixtures, JsonParseError, SafeJson } from '../../../../src/sources/parsers/base';
import { type JsonData } from '../../../../src/sources/parsers/types';
import path from 'node:path';
import {
  DefaultJsonFixtures,
  ValidatedJsonScores,
  ValidatedJsonShape,
} from '../../../../src/sources/parsers/json_parse';
import { ZodError } from 'zod';

describe('Default Json Fixtures', () => {
  describe('given a file containing valid JSON', () => {
    let fixture: DefaultJsonFixtures
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','single_match.json');
      fixture = new DefaultJsonFixtures(filepath);
      })
    describe('when the file is parsed', () => {
      let actual: unknown
      beforeEach(async () => {
        actual = await fixture.parse()
      })
      it('returns the parsed object', () => {
        const expected = {
          fixtures: [
            {
              matchId: 'M001',
              homeId: 'T001',
              homeName: 'Avalon Rovers',
              awayId: 'T002',
              awayName: 'Beacon United',
              score: '0-1',
              date: '2026-02-14T15:00:00Z',
            },
          ],
        };
        expect(actual).toStrictEqual(expected);
      })
    })
  })
  describe('given a file that does not exist', () => {
    let fixture: DefaultJsonFixtures
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','not-a-file.json');
      fixture = new DefaultJsonFixtures(filepath);
    })
    describe('when the file is parsed', () => {
      it('throws an error', async () => {
        await expect(fixture.parse()).rejects.toThrow(Error);
      })
    })
  })
  describe('given a file containing invalid JSON', () => {
    let fixture: DefaultJsonFixtures
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','illegal_empty.json');
      fixture = new DefaultJsonFixtures(filepath);
    })
    describe('when the file is parsed', () => {
      it('throws a syntax error', async () => {
        await expect(fixture.parse()).rejects.toThrow(SyntaxError);
      })
    })
  })
})
describe('Validated Json Shape', () => {
  let fixture: ValidatedJsonShape
  let origin: JsonFixtures
  describe('given a json fixture that has a valid empty structure', () => {
    beforeEach(async () => {
      origin = {
        async parse(){
          return {fixtures: []}
        }
      }
      fixture = new ValidatedJsonShape(origin);
    })
    describe('when the data is parsed', () => {
      let expected: JsonData;
      beforeEach(async () => {
        expected = await origin.parse()
      })
      it('returns the data unchanged', async () => {
        expect(await fixture.parse()).toStrictEqual(expected)
      })
    })
  })
  describe('given a file containing a valid non empty structure', () => {
    beforeEach(async () => {
      origin = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M002',
                homeId: 'T001',
                homeName: 'Avalon Rovers',
                awayId: 'T003',
                awayName: 'Cedar City FC',
                score: '1-2',
                date: '2026-02-16T17:00:00Z',
              },
              {
                matchId: 'M001',
                homeId: 'T001',
                homeName: 'Avalon Rovers',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: '0-1',
                date: '2026-02-14T15:00:00Z',
              },
            ],
          };
        }
      }
      fixture = new ValidatedJsonShape(origin);
    })
    describe('when the data is parsed', () => {
      let expected: JsonData;
      beforeEach(async () => {
        expected = await origin.parse()
      })
      it('returns the data unchanged', async () => {
        expect(await fixture.parse()).toStrictEqual(expected)
      })
    })
  })

  describe('given a json fixture that has an invalid structure', () => {
    beforeEach(async () => {
      const origin: JsonFixtures = {
        // @ts-expect-error: parse should fail
        async parse() {
          return { invalid: 'structure' };
        }
      }
      fixture = new ValidatedJsonShape(origin)
    })
    describe('when the data is parsed', () => {
      it('throws a Zod error', async () => {
        await expect(fixture.parse()).rejects.toThrow(ZodError);
      })

    })
  })
})

describe('Safe Json', () => {
  let fixture: SafeJson
  let origin: JsonFixtures
  describe('given a json fixture that succeeds', () => {
    beforeEach(async () => {
      origin = {
        async parse(){
          return {fixtures: []}
        }
      }
      fixture = new SafeJson(origin);
    })
    describe('when the data is parsed', () => {
      let expected: JsonData
      beforeEach(async () => {
        expected = await origin.parse()
      })
      it('returns the data unchanged', async () => {
        expect(await fixture.parse()).toStrictEqual(expected)
      })
    })
  })
  describe('given a json fixture that raises an unexpected error', () => {
    beforeEach(async () => {
      origin = {
        async parse() {throw new Error('errored fixture')}
      }
      fixture = new SafeJson(origin);
    })
    describe('when the data is parsed', () => {
      it('wraps the error in a json parse error', async () => {
        await expect(fixture.parse()).rejects.toThrow(JsonParseError);
      })
    })
  })
})


describe('Validate Json Scores', () => {
  let fixture: ValidatedJsonScores
  let origin: JsonFixtures
  describe('given a json fixture that has valid scores', () => {
    beforeEach(async () => {
      origin = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M001',
                homeId: 'T001',
                homeName: 'Avalon Rovers',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: '0-1',
                date: '2026-02-14T15:00:00Z',
              },
            ],
          };
        }
      }
      fixture = new ValidatedJsonScores(origin);
    })
    describe('when the data is parsed', () => {
      let expected: JsonData
      beforeEach(async () => {
        expected = await origin.parse()
      })
      it('returns the data unchanged', async () => {
        expect(await fixture.parse()).toStrictEqual(expected)
      })
    })
  })
  describe('given a json fixture that has an invalid scores,', () => {
    beforeEach(async () => {
      origin = {
        async parse() {
          return {
            fixtures: [
              {
                matchId: 'M001',
                homeId: 'T001',
                homeName: 'Avalon Rovers',
                awayId: 'T002',
                awayName: 'Beacon United',
                score: 'invalid score',
                date: '2026-02-14T15:00:00Z',
              },
            ],
          };
        },
      };
      fixture = new ValidatedJsonScores(origin);
    })
    describe('when the data is parsed', () => {
      it('throws a json parse error', async () => {
        await expect(fixture.parse()).rejects.toThrow(JsonParseError);
      })
    })
  })
})