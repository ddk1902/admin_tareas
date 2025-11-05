import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,      // ✅ SIEMPRE true en Render
    sameSite: "none",  // ✅ Necesario para cruzar entre Vercel y Render
    maxAge: 24 * 60 * 60 * 1000, // 1 día
  });
};
