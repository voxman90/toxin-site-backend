import { describe, expect, test } from 'vitest';

import { customQueryParser } from '../../src/config/queryParser';

describe('customQueryParser (Unit)', () => {
  test('should parse types: number, string, boolean, null, undefined', () => {
    const queryString = 'page=1&price=-50.5&isAvailable=true&promo=null&selected=undefined';
    const result = customQueryParser(queryString);

    expect(result).toEqual({
      page: 1,
      price: -50.5,
      isAvailable: true,
      promo: null,
      selected: undefined,
    });
  });

  test('should keep zip codes and phone numbers as strings', () => {
    const queryString = 'zipCode=01234&phone=%2B7999&empty=%20%20%20';
    const result = customQueryParser(queryString);

    expect(result).toEqual({
      zipCode: '01234',
      phone: '+7999',
      empty: '   ',
    });
  });

  test('should parse arrays and cast values inside them', () => {
    const queryString = 'tags[]=hotel&ids[]=101&ids[]=102&flags[]=true&flags[]=false';
    const result = customQueryParser(queryString);

    expect(result).toEqual({
      tags: ['hotel'],
      ids: [101, 102],
      flags: [true, false],
    });
  });

  test('should parse deeply nested objects and cast values', () => {
    const queryString =
      'filters[price][min]=500&filters[options][active]=true&filters[options][discount]=null';
    const result = customQueryParser(queryString);

    expect(result).toEqual({
      filters: {
        price: {
          min: 500,
        },
        options: {
          active: true,
          discount: null,
        },
      },
    });
  });
});
