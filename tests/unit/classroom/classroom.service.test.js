import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClassroomService } from "../../../services/classroom.service.js";
import { ClassroomRepository } from "../../../repositories/classroom.repository.js";
import { AppError } from "../../../utils/AppError.js";

vi.mock("../../../repositories/classroom.repository.js", () => {
  return {
    ClassroomRepository: vi.fn().mockImplementation(() => {
      return {
        create: vi.fn(),
        findById: vi.fn(),
        findWithPagination: vi.fn(),
        searchClassrooms: vi.fn(),
        existsByName: vi.fn(),
      };
    }),
  };
});

describe("ClassroomService", () => {
  let service;
  let mockRepo;
  const tenantId = "123e4567-e89b-12d3-a456-426614174000";

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClassroomService();
    
    mockRepo = service.repository;
  });

  describe("createClassroom", () => {
    it("should successfully create a classroom", async () => {
      const payload = {
        name: "Classroom A",
        capacity: 35,
        location: "Building 1",
        description: "Standard classroom",
      };

      const mockClassroom = { id: "class-1", tenantId, ...payload };

      mockRepo.existsByName.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue(mockClassroom);

      const result = await service.createClassroom(tenantId, payload);

      expect(mockRepo.existsByName).toHaveBeenCalledWith("Classroom A", tenantId);
      expect(mockRepo.create).toHaveBeenCalledWith({
        tenantId,
        name: "Classroom A",
        capacity: 35,
        location: "Building 1",
        status: "active",
        description: "Standard classroom",
      });
      expect(result).toEqual(mockClassroom);
    });

    it("should throw a 400 error if name already exists", async () => {
      const payload = { name: "Duplicate Room" };

      mockRepo.existsByName.mockResolvedValue(true);

      await expect(service.createClassroom(tenantId, payload)).rejects.toThrow(
        new AppError("Classroom with name 'Duplicate Room' already exists", 400)
      );
    });
  });

  describe("getAllClassrooms", () => {
    it("should retrieve paginated classrooms", async () => {
      const query = { page: "1", limit: "10", status: "active" };
      const mockResult = {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
        data: [{ id: "class-1", name: "Classroom A" }],
      };

      mockRepo.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getAllClassrooms(tenantId, query);

      expect(mockRepo.findWithPagination).toHaveBeenCalledWith(
        tenantId,
        { status: "active" },
        1,
        10
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getClassroomById", () => {
    it("should return the classroom if found", async () => {
      const classroomId = "class-1";
      const mockClassroom = { id: classroomId, name: "Classroom A", tenantId };

      mockRepo.findById.mockResolvedValue(mockClassroom);

      const result = await service.getClassroomById(classroomId, tenantId);

      expect(mockRepo.findById).toHaveBeenCalledWith(classroomId, tenantId);
      expect(result).toEqual(mockClassroom);
    });

    it("should throw a 404 error if not found", async () => {
      const classroomId = "class-non-existent";
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getClassroomById(classroomId, tenantId)).rejects.toThrow(
        new AppError("Classroom not found", 404)
      );
    });
  });

  describe("updateClassroom", () => {
    it("should update classroom fields", async () => {
      const classroomId = "class-1";
      const payload = { name: "Updated Room Name", capacity: 50 };
      
      const mockClassroom = {
        id: classroomId,
        name: "Old Room Name",
        capacity: 40,
        tenantId,
        save: vi.fn(),
      };

      mockRepo.findById.mockResolvedValue(mockClassroom);
      mockRepo.existsByName.mockResolvedValue(false);

      const result = await service.updateClassroom(classroomId, tenantId, payload);

      expect(mockRepo.findById).toHaveBeenCalledWith(classroomId, tenantId);
      expect(mockRepo.existsByName).toHaveBeenCalledWith("Updated Room Name", tenantId, classroomId);
      expect(mockClassroom.name).toBe("Updated Room Name");
      expect(mockClassroom.capacity).toBe(50);
      expect(mockClassroom.save).toHaveBeenCalled();
      expect(result).toEqual(mockClassroom);
    });
  });

  describe("deleteClassroom", () => {
    it("should delete the classroom", async () => {
      const classroomId = "class-1";
      const mockClassroom = {
        id: classroomId,
        name: "Classroom A",
        tenantId,
        destroy: vi.fn(),
      };

      mockRepo.findById.mockResolvedValue(mockClassroom);

      const result = await service.deleteClassroom(classroomId, tenantId);

      expect(mockRepo.findById).toHaveBeenCalledWith(classroomId, tenantId);
      expect(mockClassroom.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: "Classroom deleted successfully" });
    });
  });
});
