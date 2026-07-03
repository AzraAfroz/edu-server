import { Op } from "sequelize";
import { Classroom } from "../models/index.js";
import { BaseRepository } from "./base.repository.js";

export class ClassroomRepository extends BaseRepository {
  constructor() {
    super(Classroom);
  }

  async findWithPagination(tenantId, filters = {}, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const where = { tenantId, ...filters };

    const { count, rows } = await this.model.findAndCountAll({
      where,
      offset,
      limit,
      order: [["name", "ASC"]],
    });

    return {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }

  async searchClassrooms(tenantId, searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: {
        tenantId,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { location: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      offset,
      limit,
      order: [["name", "ASC"]],
    });

    return {
      total: count,
      page,
      limit,
      pages: Math.ceil(count / limit),
      data: rows,
    };
  }

  async existsByName(name, tenantId, excludeId = null) {
    const where = { name, tenantId };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await this.model.count({ where });
    return count > 0;
  }
}
