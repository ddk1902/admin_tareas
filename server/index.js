import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import routes from "./routes/index.js";
import { dbConnection } from "./utils/index.js";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewaves.js";

dotenv.config();

const app = express();
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI ? "definido" : "NO definido");
console.log("🔍 JWT_SECRET:", process.env.JWT_SECRET ? "definido" : "NO definido");

dbConnection();


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin-tareas.onrender.com",  // backend
      "http://localhost:5173",              // para desarrollo local
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ✅ Aquí montamos las rutas correctamente
app.use("/api", routes);

app.get("/", (req, res) => res.json({ message: "API de admin-tareas activa 🚀" }));

app.use(routeNotFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
console.log("🧭 PORT (Render):", process.env.PORT);

// Render necesita que el servidor escuche explícitamente
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});


export default app; // 


