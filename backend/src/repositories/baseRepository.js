/**
 * Base Repository Class
 * 
 * Provides common CRUD operations for all repositories.
 * Extend this class to create model-specific repositories.
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find a single record by ID
   */
  async findById(id, options = {}) {
    return this.model.findUnique({
      where: { id },
      ...options,
    });
  }

  /**
   * Find a single record by custom criteria
   */
  async findOne(where, options = {}) {
    return this.model.findFirst({
      where,
      ...options,
    });
  }

  /**
   * Find multiple records
   */
  async findAll(options = {}) {
    return this.model.findMany(options);
  }

  /**
   * Create a new record
   */
  async create(data) {
    return this.model.create({ data });
  }

  /**
   * Update a record by ID
   */
  async update(id, data) {
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Count records matching criteria
   */
  async count(where = {}) {
    return this.model.count({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Find with pagination
   */
  async findPaginated({ where = {}, orderBy = {}, page = 1, limit = 10, include = {} }) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
      }),
      this.count(where),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Bulk create records
   */
  async createMany(data) {
    return this.model.createMany({ data });
  }

  /**
   * Bulk update records
   */
  async updateMany(where, data) {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Bulk delete records
   */
  async deleteMany(where) {
    return this.model.deleteMany({ where });
  }
}

module.exports = BaseRepository;
