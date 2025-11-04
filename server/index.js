import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewaves.js";
import routes from "./routes/index.js";
import { dbConnection } from "./utils/index.js";

dotenv.config();
dbConnection();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://admin-tareas-e7kq-2eavcb3ui-diego-gomezs-projects-db6fbfde.vercel.app",
  "https://admin-tareas.vercel.app",
  "https://admin-tareasserver.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Ver rutas disponibles
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("🧭 Rutas disponibles:");
fs.readdirSync(path.join(__dirname, "routes")).forEach(f => console.log(" -", f));

// Rutas principales
app.get("/", (req, res) => res.json({ message: "API de admin-tareas activa 🚀" }));
app.use("/api", routes);

// Manejo de errores
app.use(routeNotFound);
app.use(errorHandler);

// Localhost solo
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto: ${PORT}`));
}

// 👇 Necesario para Vercel
export default app;

