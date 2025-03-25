import mongoose from "mongoose";
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;

    const { title, team, stage, date, priority, assets } = req.body;

    let text = "Una nueva tarea le ha sido asignada a usted";
    if (team?.length > 1) {
      text = text + ` y ${team?.length - 1} otros.`;
    }

    text =
      text +
      ` La tarea es de  ${priority} prioridad, por favor verifique. La fecha en que se creó la tarea es: ${new Date(
        date
      ).toDateString()}. Gracias!!!`;

    const activity = {
      type: "asignada",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res
      .status(200)
      .json({ status: true, task, message: "Tarea creada con éxito.!." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la tarea original
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Tarea no encontrada" });
    }

    // Eliminar el campo _id del objeto original
    const { _id, ...taskData } = task.toObject();

    // Crear una nueva tarea duplicada con un título modificado
    const newTask = await Task.create({
      ...taskData,
      title: task.title + " - Duplicado",
    });

    res.status(200).json({
      status: true,
      message: "Tarea duplicada exitosamente.",
    });
  } catch (error) {
    console.error("Error en duplicateTask:", error);
    res.status(500).json({ status: false, message: "Error interno del servidor" });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Actividad publicada con éxito." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    // Group tasks by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // Calculate total tasks
    const totalTasks = allTasks?.length;
    const last20Task = allTasks?.slice(0, 20);

    const summary = {
      totalTasks,
      last20Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Realizado..!",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed, search } = req.query;

    let query = {};

    // Filtrar por estado si stage está presente
    if (stage && typeof stage === "string") {
      query.stage = decodeURIComponent(stage).toLowerCase();
    }

    // Filtrar por isTrashed si es necesario
    if (isTrashed !== undefined) {
      query.isTrashed = isTrashed === "true";
    }

    // Aplicar búsqueda si search está presente
    if (search && typeof search === "string") {
      query.title = { $regex: search, $options: "i" };
    }

    // Ignorar el parámetro cacheBuster
    console.log("Consulta construida:", query);

    // Obtener las tareas
    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Error interno del servidor." });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Tarea no encontrada" });
    }

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.error("Error en getTask:", error);
    res.status(500).json({ status: false, message: "Error interno del servidor" });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Sub-Tarea agregada!." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const {id} = req.params; // Extraer el ID de los parámetros
    const updatedData = req.body;

    console.log("ID recibido:",id); // Log del ID recibido
    console.log("Datos recibidos para actualizar:", updatedData); // Log de los datos recibidos

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "ID de tarea no válido" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ status: false, message: "Tarea no encontrada" });
    }

    // Normalizar los valores recibidos
    if (updatedData.priority) {
      updatedData.priority = updatedData.priority.toLowerCase();
    }
    if (updatedData.stage) {
      updatedData.stage = updatedData.stage.toLowerCase();
    }

    // Actualiza los campos de la tarea
    Object.assign(task, updatedData);

    await task.save();

    console.log("Tarea actualizada en la base de datos:", task); // Log de la tarea actualizada

    res.status(200).json({
      status: true,
      message: "Tarea actualizada exitosamente.",
    });
  } catch (error) {
    console.error("Error en updateTask:", error);
    res.status(500).json({ status: false, message: "Error interno del servidor" });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Tarea eliminada!.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }
    res.status(200).json({
      status: true,
      message: `Operación realizada exitosamente.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};