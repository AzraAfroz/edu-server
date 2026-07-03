import { ClassroomRepository } from "../repositories/classroom.repository.js";
import { AppError } from "../utils/AppError.js";
import { BaseService } from "./base.service.js";

const classroomRepo = new ClassroomRepository();

export class ClassroomService extends BaseService {
  constructor() {
    super(classroomRepo);
  }

  async createClassroom(tenantId, payload) {
    const { name, capacity, location, status, description } = payload;

    if (!name) throw new AppError("Classroom name is required", 400);

    const nameExists = await classroomRepo.existsByName(name.trim(), tenantId);
    if (nameExists) {
      throw new AppError(`Classroom with name '${name}' already exists`, 400);
    }

    const classroom = await classroomRepo.create({
      tenantId,
      name: name.trim(),
      capacity: capacity ?? 40,
      location: location?.trim() || null,
      status: status || "active",
      description: description?.trim() || null,
    });

    return classroom;
  }

  async getAllClassrooms(tenantId, query) {
    const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
    const limit = parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;

    const filters = {};
    if (query.status) filters.status = query.status;
    if (query.capacity) filters.capacity = query.capacity;

    return await classroomRepo.findWithPagination(tenantId, filters, page, limit);
  }

  async getClassroomById(id, tenantId) {
    const classroom = await classroomRepo.findById(id, tenantId);
    if (!classroom) throw new AppError("Classroom not found", 404);
    return classroom;
  }

  async updateClassroom(id, tenantId, payload) {
    const { name, capacity, location, status, description } = payload;

    // Check existence
    const classroom = await classroomRepo.findById(id, tenantId);
    if (!classroom) throw new AppError("Classroom not found", 404);

    if (name) {
      const trimmedName = name.trim();
      const nameExists = await classroomRepo.existsByName(trimmedName, tenantId, id);
      if (nameExists) {
        throw new AppError(`Classroom with name '${trimmedName}' already exists`, 400);
      }
      classroom.name = trimmedName;
    }

    if (capacity !== undefined) classroom.capacity = capacity;
    if (location !== undefined) classroom.location = location?.trim() || null;
    if (status !== undefined) classroom.status = status;
    if (description !== undefined) classroom.description = description?.trim() || null;

    await classroom.save();
    return classroom;
  }

  async deleteClassroom(id, tenantId) {
    const classroom = await classroomRepo.findById(id, tenantId);
    if (!classroom) throw new AppError("Classroom not found", 404);

    await classroom.destroy();
    return { message: "Classroom deleted successfully" };
  }

  async searchClassrooms(tenantId, query) {
    const page = parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
    const limit = parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;
    const searchTerm = query.q || query.search || "";

    if (!searchTerm.trim()) {
      return await this.getAllClassrooms(tenantId, query);
    }

    return await classroomRepo.searchClassrooms(tenantId, searchTerm.trim(), page, limit);
  }
}
