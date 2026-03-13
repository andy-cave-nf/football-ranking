import { cleanString, SanitizeMap } from '../../../src/leagues/team_maps';

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
