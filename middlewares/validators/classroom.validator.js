import { AppError } from "../../utils/AppError.js";

const createValidator = (validateFn) => (req, res, next) => {
  try {
    validateFn(req);
    next();
  } catch (error) {
    next(error);
  }
};

const ensureString = (value, fieldName, { min = 1, max = 255 } = {}) => {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new AppError(`${fieldName} must be between ${min} and ${max} characters`, 400);
  }
};

const ensureOptionalString = (value, fieldName, options = {}) => {
  if (value === undefined || value === null || value === "") return;
  ensureString(value, fieldName, options);
};

const ensureUUID = (value, fieldName) => {
  if (!value) throw new AppError(`${fieldName} is required`, 400);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new AppError(`${fieldName} must be a valid UUID`, 400);
  }
};

const ensureEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(", ")}`, 400);
  }
};

const ensureInteger = (value, fieldName, { min = 1 } = {}) => {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min) {
    throw new AppError(`${fieldName} must be an integer and at least ${min}`, 400);
  }
};

const ensureOptionalInteger = (value, fieldName, options = {}) => {
  if (value === undefined || value === null || value === "") return;
  ensureInteger(value, fieldName, options);
};

export const classroomIdValidator = createValidator((req) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!id || !uuidRegex.test(id)) {
    throw new AppError("Invalid or missing Classroom ID", 400);
  }
});

export const createClassroomValidator = createValidator((req) => {
  const { name, capacity, location, status, description } = req.body;

  if (!name) throw new AppError("Classroom name is required", 400);
  ensureString(name, "name", { min: 2, max: 100 });

  ensureOptionalInteger(capacity, "capacity", { min: 1 });
  ensureOptionalString(location, "location", { min: 1, max: 255 });
  ensureOptionalString(description, "description", { min: 1, max: 1000 });

  if (status !== undefined) {
    ensureEnum(status, "status", ["active", "inactive"]);
  }
});

export const updateClassroomValidator = createValidator((req) => {
  const { name, capacity, location, status, description } = req.body;

  ensureOptionalString(name, "name", { min: 2, max: 100 });
  ensureOptionalInteger(capacity, "capacity", { min: 1 });
  ensureOptionalString(location, "location", { min: 1, max: 255 });
  ensureOptionalString(description, "description", { min: 1, max: 1000 });

  if (status !== undefined) {
    ensureEnum(status, "status", ["active", "inactive"]);
  }
});

export const searchClassroomValidator = createValidator((req) => {
  const searchTerm = req.query.q || req.query.search || "";
  if (searchTerm && searchTerm.trim().length < 2) {
    throw new AppError("Search query must be at least 2 characters", 400);
  }
});
