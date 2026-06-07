import qs from 'qs';

const isValidNumericString = (str: string): boolean => {
  const num = Number(str);

  if (isNaN(num)) return false;

  if (str.startsWith('+')) return false;

  const absoluteStr = str.startsWith('-') ? str.slice(1) : str;
  if (absoluteStr.length > 1 && absoluteStr.startsWith('0') && !absoluteStr.startsWith('0.')) {
    return false;
  }

  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    return false;
  }

  return true;
};

const castValues = (obj: Record<string, unknown>): Record<string, unknown> => {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue;

    const val = obj[key];

    if (typeof val === 'string') {
      const trimmed = val.trim();

      if (trimmed === '') continue;

      if (trimmed === 'true') {
        obj[key] = true;
        continue;
      }

      if (trimmed === 'false') {
        obj[key] = false;
        continue;
      }

      if (trimmed === 'null') {
        obj[key] = null;
        continue;
      }

      if (trimmed === 'undefined') {
        obj[key] = undefined;
        continue;
      }

      if (isValidNumericString(trimmed)) {
        obj[key] = Number(trimmed);
      }
    } else if (typeof val === 'object' && val !== null) {
      obj[key] = castValues(val as Record<string, unknown>);
    }
  }

  return obj;
};

export const customQueryParser = (str: string): Record<string, unknown> => {
  const parsed = qs.parse(str);

  return castValues(parsed as Record<string, unknown>);
};
