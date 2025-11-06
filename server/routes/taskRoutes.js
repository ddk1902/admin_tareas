import express from "express";
import { addComment } from "../controllers/taskController.js";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  getUserTasks   // ✅ Nueva función que veremos abajo
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";

const router = express.Router();

// 🧑‍💼 ADMIN → crear, duplicar, eliminar
router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);
router.post("/:id/comment", protectRoute, addComment);
router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

// 👥 TODOS LOS USUARIOS → ver y editar sus tareas asignadas
router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/my-tasks", protectRoute, getUserTasks); // ✅ Nueva ruta
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

// ✏️ Actualizar tarea: permitido para admin o asignado
router.put("/update/:id", protectRoute, updateTask);

router.post("/activity/:id", protectRoute, postTaskActivity);

export default router;

