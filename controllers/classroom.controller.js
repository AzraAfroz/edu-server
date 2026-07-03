import { ClassroomService } from "../services/classroom.service.js";
import { catchAsync } from "../utils/catchAsync.js";

const classroomService = new ClassroomService();

export class ClassroomController {
  create = catchAsync(async (req, res) => {
    const data = await classroomService.createClassroom(req.tenantId, req.body);
    res.status(201).json({ success: true, data });
  });

  getAll = catchAsync(async (req, res) => {
    const result = await classroomService.getAllClassrooms(req.tenantId, req.query);
    res.status(200).json({ success: true, ...result });
  });

  getOne = catchAsync(async (req, res) => {
    const data = await classroomService.getClassroomById(req.params.id, req.tenantId);
    res.status(200).json({ success: true, data });
  });

  update = catchAsync(async (req, res) => {
    const data = await classroomService.updateClassroom(req.params.id, req.tenantId, req.body);
    res.status(200).json({ success: true, data });
  });

  delete = catchAsync(async (req, res) => {
    const result = await classroomService.deleteClassroom(req.params.id, req.tenantId);
    res.status(200).json({ success: true, ...result });
  });

  search = catchAsync(async (req, res) => {
    const result = await classroomService.searchClassrooms(req.tenantId, req.query);
    res.status(200).json({
      success: true,
      results: result.data.length,
      ...result,
    });
  });
}
