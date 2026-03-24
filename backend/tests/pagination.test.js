const {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  getPagination,
  buildPaginationMeta,
} = require('../src/utils/pagination');

describe('pagination utils', () => {
  test('uses default pagination values when query is empty', () => {
    expect(getPagination()).toEqual({
      page: DEFAULT_PAGE,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
    });
  });

  test('parses and caps page size correctly', () => {
    const pagination = getPagination({ page: '2', pageSize: String(MAX_PAGE_SIZE + 50) });

    expect(pagination).toEqual({
      page: 2,
      pageSize: MAX_PAGE_SIZE,
      skip: MAX_PAGE_SIZE,
      take: MAX_PAGE_SIZE,
    });
  });

  test('builds pagination metadata correctly', () => {
    expect(
      buildPaginationMeta({
        page: 2,
        pageSize: 10,
        totalItems: 45,
      })
    ).toEqual({
      page: 2,
      pageSize: 10,
      totalItems: 45,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  test('handles zero results without false pagination', () => {
    expect(
      buildPaginationMeta({
        page: 1,
        pageSize: 10,
        totalItems: 0,
      })
    ).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });
});
