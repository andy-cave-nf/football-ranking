import {
  cleanString,
  DefaultTeamMap,
  type ReadOnlyTeamMap,
  SanitizeMap,
  TeamMapError,
} from '../../../src/leagues/team_maps';
import type { Team } from '../../../src/leagues/types';

describe('Default Team Maps', () => {
  let teamMap: DefaultTeamMap<string, Team>
  describe('given an empty map', () => {
    beforeEach(() => {
      teamMap = new DefaultTeamMap(new Map())
    })
    describe('when a new team is entered', () => {
      let team: Team
      beforeEach(() => {
        team = {id: 'new-id',name:'new-team',mu:25,sigma:25/3,lastFixtureDate: new Date()}
        teamMap.setInitOrIgnore(team.id, team)
      })
      it('stores the team correctly', () => {
        expect(teamMap.get(team.id)).toEqual(team)
      })
    })
    test('the map size is zero', () => {
      expect(teamMap.size).toEqual(0)
    })
  })
  describe('given a map with an existing team', () => {
    let team: Team
    let id: string
    beforeEach(() => {
      id = 'new-id'
      team = {id, name:'new-team',mu:25,sigma:125/3,lastFixtureDate: new Date()}
      teamMap = new DefaultTeamMap(new Map([[id, team]]))
    })

    describe('when a new team is set with the same id', () => {
      let newTeam: Team
      let value: Team | undefined
      beforeEach(() => {
        newTeam = {id, name:'a-different-name',mu:30, sigma:30/3,lastFixtureDate: new Date()}
        teamMap.setInitOrIgnore(team.id, newTeam)
        value = teamMap.get(id)
      })
      it('does not update the existing team', () => {
        expect(value).toEqual(team)
      })
    })
    describe('when a new team is set with a different id', () => {
      let newTeam: Team
      let newId: string
      let value: Team | undefined
      beforeEach(() => {
        newId = 'another-id'
        newTeam = {id:newId,name:'another-team',mu:25,sigma:125/3,lastFixtureDate: new Date()}
        teamMap.set(newId, newTeam)
        value = teamMap.get(newId)
      })
      it('stores the team under the set id', () =>{
        expect(value).toEqual(newTeam)
      })
    })
    describe('when the existing team is updated with different values', () => {
      let updatedTeam: Team
      let value: Team | undefined
      beforeEach(() => {
        updatedTeam = {id,name:'a-different-name',mu:30,sigma:125/3,lastFixtureDate: new Date(2000,0,1)}
        teamMap.set(id, updatedTeam)
        value = teamMap.get(id)
      })
      it('stores the team with the new values', () => {
        expect(value).toEqual(updatedTeam)
      })
    })
    describe('when a readonly version is created', () => {
      let readOnlyMap: ReadOnlyTeamMap<string, Team>
      let value: Team | undefined
      beforeEach(() => {
        readOnlyMap = teamMap.toReadOnly()
        value = readOnlyMap.get(id)
      })
      it('stores the team in a readonly version', () =>{
        expect(value).toEqual(team)
      })
    })
    test('the map size is one', () => {
      expect(teamMap.size).toEqual(1)
    })
  })
})

describe('Read Only Team Maps', () => {
  let teamMap: ReadOnlyTeamMap<string, Team>
  describe('given an empty map', () => {
    beforeEach(() => {
      teamMap = new DefaultTeamMap(new Map()).toReadOnly()
    })
    describe('when a non-existent team is called', () => {
      it('throws a team map error', () => {
        expect(() => teamMap.getOrThrow('non-existent-id')).toThrow(TeamMapError);
      });
    });
    describe('when a new team is entered', () => {
      let team: Team
      let id: string
      beforeEach(() => {
        id = 'new-id'
        team = {id,name:'new-name', mu:25,sigma:25/3,lastFixtureDate: new Date()}
      })
      it('raises a type error', () => {
        // @ts-expect-error: expecting a type error
        expect(() => teamMap.setInit(id, team)).toThrow(TypeError);
      })
    })
    test('the map size is zero', () => {
      expect(teamMap.size).toEqual(0)
    })
  })
  describe('given a map with an existing team', () => {
    let team: Team
    let id: string
    beforeEach(() => {
      id = 'new-id'
      team = {id,name:'a-new-name',mu:25,sigma:125/3,lastFixtureDate: new Date()}
      teamMap = new DefaultTeamMap(new Map([[id, team]])).toReadOnly()
    })
    describe('when the team is called', () => {
      let value: Team | undefined;
      let exists: boolean;
      beforeEach(() => {
        value = teamMap.get(id);
        exists = teamMap.has(id);
      });
      it('confirms the key exists', () => {
        expect(exists).toBe(true);
      });
      it('returns the value stored under the key', () => {
        expect(value).toEqual(team);
      });
    });

    describe('when the existing team is updated', () => {
      let updatedTeam: Team
      beforeEach(() => {
        updatedTeam = {id,name:'a-different-name',mu:30, sigma:25/3,lastFixtureDate: new Date(2000,0,1)}
      })
      it('raises a type error', () => {
        // @ts-expect-error: expecting a type error
        expect(()=>teamMap.set(id,updatedTeam)).toThrow();
      })
    })
    test.todo('the map size is one')
  })
})


describe('clean string sanitizing function', () => {
    let input:string
    let actual:string
    let expected:string
  test.each(
    [
      'lower case',
      'UPPER-CASE',
      '   extra-whitespace   ',
      'MIxed - cASe',
      '   UPPER CASE WHITESPACE   ',
      ' MiXed cASe whitespace   '
    ])('the sanitizing function is idempotent for "%s"', (input) => {
    expect(cleanString(cleanString(input))).equals(cleanString(input))
  })

  describe('given a string that is upper case, with no extra whitespace, when the clean string function is called', () => {
    beforeEach(() => {
      input = 'UPPER CASE'
      actual = cleanString(input)
    })
    it('returns the string unchanged', () => {
      expect(actual).toEqual(input)
    })
  })
  describe('given a string that is lower case, with no extra whitespace, when the clean string function is called', () => {
    beforeEach(() => {
      input = 'lower case'
      expected = input.toUpperCase()
      actual = cleanString(input)
    })
    it('returns the string in upper case', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a string that is upper case with extra whitespace, when the clean string function is called', () => {
    beforeEach(() => {
      input = '    EXTRA-WHITESPACE     '
      expected = input.trim()
      actual = cleanString(input)
    })
    it('returns the string trimmed of whitespace', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a string that is lower case with extra whitespace, when the clean string function is called', () => {
    beforeEach(() => {
      input = '    lower-case-whitespace     '
      expected = input.trim().toUpperCase()
      actual = cleanString(input)
    })
    it('returns the string trimmed of whitespace and in upper case', () => {
      expect(actual).toEqual(expected)
    })
  })
  describe('given a variable that is not a string, when the clean string function is called', () => {
    it('returns a type error', () => {
      // @ts-expect-error: expecting a type error
      expect(()=>cleanString(10)).toThrow(TypeError)
    })
  })
})

describe('Sanitize Map', () =>{
  describe('given an empty map', () => {
      let map: SanitizeMap<string,string>
      let sanitize: (key: string) => string
      let key: string
      let value: string
    beforeEach(() => {
      sanitize = (key:string): string => key.toUpperCase()
    })
    describe('when a non-sanitized entry is set', () => {
      beforeEach(() => {
        key = 'lower-case'
        value = 'value'
        map = new SanitizeMap(sanitize)
        map.set(key, value)
      })
      it('stores the value under the sanitized key', () => {
        const actual = [...map][0]
        expect(actual).toEqual([sanitize(key),value])
      })
    })
    describe('when a sanitized entry is set', () => {
      beforeEach(() => {
        key = 'UPPER-CASE'
        value = 'value'
        map = new SanitizeMap(sanitize)
        map.set(key, value)
      })
      it('stores the value under the key unchanged', () => {
        const actual = [...map][0]
        expect(actual).toEqual([key, value])
      })
    })
  })
  describe.todo('given a map with an entry', () => {
    describe.todo('when a non sanitized key is called', () => {
      it.todo('confirms the key exists')
      it.todo('returns the value under the sanitized key')
    })
    describe.todo('when a sanitized key is called', () => {
      it.todo('confirms the key exists')
      it.todo('returns the value under the sanitized key')
    })
    describe.todo('when a non-sanitized entry is set', () => {
      it.todo('stores the value under the sanitized key')
    })
    describe.todo('when a sanitized entry is set', () => {
      it.todo('stores the value under the key unchanged')
    })
  })
})
