import { GraphQLError } from 'graphql';

import {
  assertCompositionNameNotTaken,
  compositionNameTakenError,
  normalizeCompositionName,
  throwIfCompositionNameDuplicateKey
} from './compositionNameValidation';
import type { Composition } from '~/domain/entities/Composition';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';

const existingComposition: Composition = {
  id: 'composition-1',
  name: { uk: 'Соната', en: 'Sonata' },
  year: null,
  genre: null,
  audioAvailable: false,
  sheetAvailable: false,
  sheetMusic: [],
  audios: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
};

const repository = (findByName: jest.MockedFunction<ICompositionRepository['findByName']>): ICompositionRepository =>
  ({ findByName } as unknown as ICompositionRepository);

describe('composition name validation', () => {
  it('normalizes names and builds a typed duplicate error', () => {
    expect(normalizeCompositionName('  Соната  ')).toBe('Соната');

    const error = compositionNameTakenError('  Соната  ');
    expect(error).toBeInstanceOf(GraphQLError);
    expect(error.message).toBe('Композиція "Соната" вже існує');
    expect(error.extensions.code).toBe('COMPOSITION_NAME_TAKEN');
  });

  it('rejects empty names before querying the repository', async () => {
    const findByName = jest.fn();

    await expect(assertCompositionNameNotTaken(repository(findByName), '   ')).rejects.toMatchObject({
      message: 'Composition name is required',
      extensions: { code: 'BAD_USER_INPUT' }
    });
    expect(findByName).not.toHaveBeenCalled();
  });

  it('allows an unused name and the same name for the excluded composition', async () => {
    const findByName = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(existingComposition);

    await expect(assertCompositionNameNotTaken(repository(findByName), '  New name ')).resolves.toBeUndefined();
    await expect(assertCompositionNameNotTaken(repository(findByName), ' Sonata ', existingComposition.id)).resolves.toBeUndefined();
  });

  it('rejects a name owned by another composition', async () => {
    const findByName = jest.fn().mockResolvedValue(existingComposition);

    await expect(assertCompositionNameNotTaken(repository(findByName), ' Sonata ', 'other-id')).rejects.toMatchObject({
      message: 'Композиція "Sonata" вже існує',
      extensions: { code: 'COMPOSITION_NAME_TAKEN' }
    });
  });

  it('translates Mongo duplicate-key errors and ignores other errors', () => {
    expect(() => throwIfCompositionNameDuplicateKey({ code: 11000, keyValue: { 'name.uk': 'Соната' } }, 'fallback'))
      .toThrow('Композиція "Соната" вже існує');
    expect(() => throwIfCompositionNameDuplicateKey({ code: 11000 }, ' fallback '))
      .toThrow('Композиція "fallback" вже існує');
    expect(() => throwIfCompositionNameDuplicateKey({ code: 1 }, 'fallback')).not.toThrow();
    expect(() => throwIfCompositionNameDuplicateKey(null, 'fallback')).not.toThrow();
  });
});
