import isEqual from 'fast-deep-equal';

import { JsonObject, JsonValue, Patch } from '~/back-shared/types/pages/types';

export const createDotNotationPatch = (original: JsonObject, updated: JsonObject): Patch => {
  const $set: Record<string, JsonValue> = {};
  const $unset: Record<string, ''> = {};

  const diff = (o: JsonObject, u: JsonObject, prefix = '') => {
    for (const key of new Set([...Object.keys(o), ...Object.keys(u)])) {
      const path = prefix ? `${prefix}.${key}` : key;
      const oVal = o[key];
      const uVal = u[key];

      if (!(key in u)) {
        $unset[path] = '';
      } else if (!(key in o)) {
        $set[path] = uVal;
      } else if (!isEqual(oVal, uVal)) {
        if (
          oVal &&
          uVal &&
          typeof oVal === 'object' &&
          typeof uVal === 'object' &&
          !Array.isArray(oVal) &&
          !Array.isArray(uVal)
        ) {
          diff(oVal, uVal, path);
        } else {
          $set[path] = uVal;
        }
      }
    }
  };

  diff(original, updated);
  return { ...(Object.keys($set).length && { $set }), ...(Object.keys($unset).length && { $unset }) };
};
