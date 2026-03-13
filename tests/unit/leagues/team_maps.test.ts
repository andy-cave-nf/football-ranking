import { cleanString } from '../../../src/leagues/team_maps';

describe('clean string sanitizing function', () => {
    let input:string
    let actual:string
    let expected:string
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
      expect(()=>cleanString(10)).toThrow(TypeError)
    })
  })
})