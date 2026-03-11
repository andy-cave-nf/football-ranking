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
  describe('given a file containing valid JSON when the file is parsed', () => {
    let fixture: DefaultJsonFixtures
    let actual: unknown
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','single_match.json');
      fixture = new DefaultJsonFixtures(filepath);
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
            date: '2026-02-14T15:00:00',
          },
        ],
      };
      expect(actual).toStrictEqual(expected);
    })
  })
  describe('given a file that does not exist, when the file is parsed', () => {
    let fixture: DefaultJsonFixtures
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','not-a-file.json');
      fixture = new DefaultJsonFixtures(filepath);
    })
    it('throws an error', async () => {
      await expect(()=> fixture.parse()).rejects.toThrow(Error);
    })
  })
  describe('given a file containing invalid JSON when the file is parsed', () => {
    let fixture: DefaultJsonFixtures
    beforeEach(async () => {
      const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','illegal_empty.json');
      fixture = new DefaultJsonFixtures(filepath);
    })
    it('throws a syntax error', async () => {
      await expect(()=> fixture.parse()).rejects.toThrow(SyntaxError);
    })
  })
})
describe('Validated Json Shape', () => {
  let fixture: ValidatedJsonShape
  let expected: JsonData
  beforeEach(async () => {
    const origin: JsonFixtures<JsonData> = {
      async parse(){
        return {fixtures: []}
      }
    }
    expected = await origin.parse()
    fixture = new ValidatedJsonShape(origin);
  })
  describe('given a json fixture that has a valid empty structure, when the data is parsed', () => {
    it('returns the data unchanged', async () => {
      expect(await fixture.parse()).toStrictEqual(expected)
    })
  })

  describe('given a file containing a valid non empty structure, when the data is parsed', () => {
    let fixture: ValidatedJsonShape
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
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
      expected = await origin.parse()
      fixture = new ValidatedJsonShape(origin);
    })
    it('returns the data unchanged', async () => {
      expect(await fixture.parse()).toStrictEqual(expected)
    })
  })

  describe('given a json fixture that has an invalid structure, when the data is parsed', () => {
    let fixture: ValidatedJsonShape
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
        async parse() {
          return { invalid: 'structure' };
        }
      }
      fixture = new ValidatedJsonShape(origin)
    })
    it('throws a Zod error', async () => {
      await expect(() => fixture.parse()).rejects.toThrow(ZodError);
    })
  })
})

describe('Safe Json', () => {
  let fixture: SafeJson<JsonData>
  let expected: JsonData
  describe('given a json fixture that succeeds, when the data is parsed', () => {
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
        async parse(){
          return {fixtures: []}
        }
      }
      expected = await origin.parse()
      fixture = new SafeJson(origin);
    })
    it('returns the data unchanged', async () => {
      expect(await fixture.parse()).toStrictEqual(expected)
    })
  })
  describe('given a json fixture that throws, when the data is parsed', () => {
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
        async parse() {throw new Error('errored fixture')}
      }
      fixture = new SafeJson(origin);
    })
    it('raises a json parse error with the original error as a cause', async () => {
      await expect(() => fixture.parse()).rejects.toThrow(JsonParseError);
    })
  })
})


describe('Validate Json Scores', () => {
  let fixture: ValidatedJsonScores
  let expected: JsonData
  describe('given a json fixture that has valid scores, when the data is parsed', () => {
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
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
      expected = await origin.parse()
      fixture = new ValidatedJsonScores(origin);
    })
    it('returns the data unchanged', async () => {
      expect(await fixture.parse()).toStrictEqual(expected)
    })
  })
  describe('given a json fixture that has an invalid scores, when the data is parsed', () => {
    beforeEach(async () => {
      const origin: JsonFixtures<JsonData> = {
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
    it('throws a json parse error', async () => {
      await expect(()=> fixture.parse()).rejects.toThrow(JsonParseError);
    })
  })
})


describe('given a json file containing a single match, when the file is read', () => {
  let fixture: JsonFixtures<JsonData>
  let actual: JsonData;
})

describe.todo('given a json file containing many matches, when the file is read', () => {
  let fixture: JsonFixtures<JsonData>
  let actual: JsonData;
  beforeEach(async () => {
    const filepath = path.resolve(process.cwd(), 'tests', 'fixtures','json_source','two_matches.json');
    // fixture = defaultJsonFixtures(filepath);
    actual = await fixture.parse()
  })
  it.todo('returns all the matches', () => {
    const expected = {
      fixtures: [
        {
          matchId: 'M002',
          homeId: 'T001',
          homeName: 'Avalon Rovers',
          awayId: 'T003',
          awayName: 'Cedar City FC',
          score: '1-2',
          date: '2026-02-16T17:00:00',
        },
        {
          matchId: 'M001',
          homeId: 'T001',
          homeName: 'Avalon Rovers',
          awayId: 'T002',
          awayName: 'Beacon United',
          score: '0-1',
          date: '2026-02-14T15:00:00',
        },
      ],
    };
    expect(actual).toStrictEqual(expected);

  })
})

describe('given a json file with no matches, when the file is read', () => {
  it.todo('returns the provided empty object')
})

describe('given a json file with a fixture that has malformed score, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with an invalid date, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing result, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing home team id, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing away team id, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing home team name, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing away team name, when the file is read', () => {
  it.todo('raises a json parser error')
})

describe('given a json file with a fixture with a missing date, when the file is read', () => {
  it.todo('raises a json parser error')
})