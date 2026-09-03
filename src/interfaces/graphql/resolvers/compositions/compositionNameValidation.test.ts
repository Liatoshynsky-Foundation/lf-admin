import { GraphQLError } from 'graphql';

import {
  assertCompositionGenreValid,
  assertCompositionNameNotTaken,
  assertCompositionYearValid,
  compositionNameTakenError,
  normalizeCompositionName,
  throwIfCompositionNameDuplicateKey
} from './compositionNameValidation';
import { compositionsServiceErrors } from '~/back-constants/errors';
import { COMPOSITION_VALIDATION_MESSAGES } from '~/constants/opus';
import type { Composition } from '~/domain/entities/Composition';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';

const COMPOSITION_NAME = 'Sonata';

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
  ({ findByName }) as unknown as ICompositionRepository;

describe('composition name validation', () => {
  describe('name helpers', () => {
    it('normalizes names and builds a typed duplicate error', () => {
      expect(normalizeCompositionName(`  ${COMPOSITION_NAME}  `)).toBe(COMPOSITION_NAME);

      const error = compositionNameTakenError(`  ${COMPOSITION_NAME}  `);
      expect(error).toBeInstanceOf(GraphQLError);
      expect(error.message).toBe(compositionsServiceErrors.COMPOSITION_NAME_TAKEN(COMPOSITION_NAME));
      expect(error.extensions.code).toBe('COMPOSITION_NAME_TAKEN');
    });
  });

  describe('assertCompositionNameNotTaken', () => {
    it('rejects empty names before querying the repository', async () => {
      const findByName = jest.fn();

      await expect(assertCompositionNameNotTaken(repository(findByName), '   ')).rejects.toMatchObject({
        message: COMPOSITION_VALIDATION_MESSAGES.titleRequired,
        extensions: { code: 'BAD_USER_INPUT' }
      });
      expect(findByName).not.toHaveBeenCalled();
    });

    it('allows an unused name and the same name for the excluded composition', async () => {
      const findByName = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(existingComposition);

      await expect(assertCompositionNameNotTaken(repository(findByName), '  New name ')).resolves.toBeUndefined();
      await expect(
        assertCompositionNameNotTaken(repository(findByName), ` ${COMPOSITION_NAME} `, existingComposition.id)
      ).resolves.toBeUndefined();
    });

    it('rejects a name owned by another composition', async () => {
      const findByName = jest.fn().mockResolvedValue(existingComposition);

      await expect(
        assertCompositionNameNotTaken(repository(findByName), ` ${COMPOSITION_NAME} `, 'other-id')
      ).rejects.toMatchObject({
        message: compositionsServiceErrors.COMPOSITION_NAME_TAKEN(COMPOSITION_NAME),
        extensions: { code: 'COMPOSITION_NAME_TAKEN' }
      });
    });
  });

  describe('assertCompositionGenreValid', () => {
    it('allows undefined genre', () => {
      expect(() => assertCompositionGenreValid(undefined)).not.toThrow();
    });

    it('allows null genre', () => {
      expect(() => assertCompositionGenreValid(null)).not.toThrow();
    });

    it('allows valid genre', () => {
      expect(() => assertCompositionGenreValid(COMPOSITION_NAME)).not.toThrow();
    });

    it('throws when genre is too short', () => {
      expect(() => assertCompositionGenreValid('a')).toThrow(
        COMPOSITION_VALIDATION_MESSAGES.genreTooShort
      );
    });

    it('throws when genre is too long', () => {
      expect(() => assertCompositionGenreValid('a'.repeat(151))).toThrow(
        COMPOSITION_VALIDATION_MESSAGES.genreTooLong
      );
    });
  });

  describe('assertCompositionYearValid', () => {
    it('allows undefined year', () => {
      expect(() => assertCompositionYearValid(undefined)).not.toThrow();
    });

    it('allows null year', () => {
      expect(() => assertCompositionYearValid(null)).not.toThrow();
    });

    it('allows valid year', () => {
      expect(() => assertCompositionYearValid(2026)).not.toThrow();
    });

    it('throws when year is invalid', () => {
      expect(() => assertCompositionYearValid(202)).toThrow(
        COMPOSITION_VALIDATION_MESSAGES.yearInvalid
      );
    });
  });

  describe('throwIfCompositionNameDuplicateKey', () => {
    it('throws composition name taken error for Mongo duplicate-key error', () => {
      expect(() =>
        throwIfCompositionNameDuplicateKey(
          {
            code: 11000,
            keyValue: { 'name.uk': COMPOSITION_NAME },
          },
          'fallback'
        )
      ).toThrow(
        compositionsServiceErrors.COMPOSITION_NAME_TAKEN(COMPOSITION_NAME)
      );
    });

    it('uses the trimmed fallback name when no name is present', () => {
      expect(() =>
        throwIfCompositionNameDuplicateKey({ code: 11000 }, ' fallback ')
      ).toThrow(
        compositionsServiceErrors.COMPOSITION_NAME_TAKEN('fallback')
      );
    });

    it('does not throw for non-duplicate-key errors', () => {
      expect(() =>
        throwIfCompositionNameDuplicateKey({ code: 1 }, 'fallback')
      ).not.toThrow();
    });

    it('does not throw for null error', () => {
      expect(() =>
        throwIfCompositionNameDuplicateKey(null, 'fallback')
      ).not.toThrow();
    });
  });
});
