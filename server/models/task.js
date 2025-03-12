import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: new Date() },
    priority: {
      type: String,
      default: "normal",
      enum: ["alta", "media", "normal", "baja"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["pendiente", "en progreso", "completada"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "asignada",
          enum: [
            "asignada",
            "iniciada",
            "en progreso",
            "bug",
            "completada",
            "comentada",
          ],
        },
        activity: String,
        date: { type: Date, default: new Date() },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
      },
    ],
    assets: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
