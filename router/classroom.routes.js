import express from "express";
import { ClassroomController } from "../controllers/classroom.controller.js";
import {
  createClassroomValidator,
  updateClassroomValidator,
  classroomIdValidator,
  searchClassroomValidator,
} from "../middlewares/validators/classroom.validator.js";

const router = express.Router();
const ctrl = new ClassroomController();

router.use((req, res, next) => {
  req.tenantId = "f3a9d8c2-7b41-4e8d-9c12-a1b2c3d4e5f6";
  next();
});

// Create: Create a new classroom
router.post("/", createClassroomValidator, ctrl.create);

// Get all classrooms with pagination & filtering
router.get("/", ctrl.getAll);

// Search classrooms
router.get("/search", searchClassroomValidator, ctrl.search);

// Get specific classroom by ID
router.get("/:id", classroomIdValidator, ctrl.getOne);

// Update classroom by ID
router.patch("/:id", classroomIdValidator, updateClassroomValidator, ctrl.update);

// Delete classroom by ID
router.delete("/:id", classroomIdValidator, ctrl.delete);

export default router;
