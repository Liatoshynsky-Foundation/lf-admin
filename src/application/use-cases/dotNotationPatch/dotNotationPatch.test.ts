import { createDotNotationPatch } from './dotNotationPatch';
import { JsonObject, Patch } from '~/back-shared/types/pages/types';

describe('createDotNotationPatch', () => {
  it('should return an empty patch for identical objects', () => {
    const original: JsonObject = { a: 1, b: { c: 'hello' } };
    const updated: JsonObject = { a: 1, b: { c: 'hello' } };
    const expectedPatch: Patch = {};
    expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
  });

  it('should return an empty patch for two empty objects', () => {
    const original: JsonObject = {};
    const updated: JsonObject = {};
    const expectedPatch: Patch = {};
    expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
  });

  describe('Top-level field modifications', () => {
    it('should generate a $set patch for a new top-level field', () => {
      const original: JsonObject = { a: 1 };
      const updated: JsonObject = { a: 1, b: 'new' };
      const expectedPatch: Patch = { $set: { b: 'new' } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate an $unset patch for a removed top-level field', () => {
      const original: JsonObject = { a: 1, b: 'removed' };
      const updated: JsonObject = { a: 1 };
      const expectedPatch: Patch = { $unset: { b: '' } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate a $set patch for a modified primitive value', () => {
      const original: JsonObject = { a: 1 };
      const updated: JsonObject = { a: 2 };
      const expectedPatch: Patch = { $set: { a: 2 } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate a $set patch when a field type changes', () => {
      const original: JsonObject = { a: 1 };
      const updated: JsonObject = { a: { nested: true } };
      const expectedPatch: Patch = { $set: { a: { nested: true } } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });
  });

  describe('Nested field modifications', () => {
    it('should generate a $set patch for a new nested field', () => {
      const original: JsonObject = { data: { a: 1 } };
      const updated: JsonObject = { data: { a: 1, b: 2 } };
      const expectedPatch: Patch = { $set: { 'data.b': 2 } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate an $unset patch for a removed nested field', () => {
      const original: JsonObject = { data: { a: 1, b: 2 } };
      const updated: JsonObject = { data: { a: 1 } };
      const expectedPatch: Patch = { $unset: { 'data.b': '' } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate a $set patch for a modified nested value', () => {
      const original: JsonObject = { user: { name: 'Alex', role: 'admin' } };
      const updated: JsonObject = { user: { name: 'Alex', role: 'editor' } };
      const expectedPatch: Patch = { $set: { 'user.role': 'editor' } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should correctly diff deeply nested objects', () => {
      const original: JsonObject = { a: { b: { c: { d: 1 } } } };
      const updated: JsonObject = { a: { b: { c: { d: 2 } } } };
      const expectedPatch: Patch = { $set: { 'a.b.c.d': 2 } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });
  });

  describe('Array modifications', () => {
    it('should generate a $set patch for a modified array', () => {
      const original: JsonObject = { tags: ['a', 'b'] };
      const updated: JsonObject = { tags: ['a', 'b', 'c'] };
      const expectedPatch: Patch = { $set: { tags: ['a', 'b', 'c'] } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });

    it('should generate a $set patch when replacing an array with a primitive', () => {
      const original: JsonObject = { data: [1, 2] };
      const updated: JsonObject = { data: 'not an array' };
      const expectedPatch: Patch = { $set: { data: 'not an array' } };
      expect(createDotNotationPatch(original, updated)).toEqual(expectedPatch);
    });
  });
});
