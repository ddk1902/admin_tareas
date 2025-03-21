import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { auth, signInWithEmailAndPassword } from "../utils/firebase"; // Importa desde firebase.js
import { toast } from "sonner";
import Loading from "../components/Loader";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Manejar el envío del formulario
  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const { email, password } = data;

      // Intentar iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Inicio de sesión exitoso.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      const errorMessage =
        error.code === "auth/wrong-password"
          ? "Contraseña incorrecta."
          : error.code === "auth/user-not-found"
          ? "Usuario no encontrado."
          : "Algo salió mal. Inténtalo de nuevo.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      {/* Lado izquierdo: Logo y descripción */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
        <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10">
          {/* Logo */}
          <img
            src="/assets/logo_senepa.png" // Ruta relativa al archivo en la carpeta public
            alt="Logo"
            className="w-64 h-74" // Ajusta el tamaño según sea necesario
          />

          {/* Título */}
          <p className="text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-red-700">
            Administrador de Tareas
          </p>

          {/* Descripción */}
          <p className="text-xl text-center text-gray-600">
            Gestiona tus tareas y proyectos de manera eficiente.
          </p>
        </div>
      </div>

      {/* Lado derecho: Formulario de inicio de sesión */}
      <div className="w-full md:w-1/3 p-4 flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 py-14 rounded-lg shadow-md"
        >
          <div className="text-center">
            <p className="text-red-600 text-3xl font-bold">¡Bienvenido de nuevo!</p>
            <p className="text-base text-gray-700">Ingresa tus credenciales para continuar.</p>
          </div>

          {/* Campo de correo electrónico */}
          <Textbox
            placeholder=""
            type="email"
            name="email"
            label="Correo Electrónico"
            className="w-full rounded-full"
            register={register("email", {
              required: "El correo electrónico es obligatorio.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Ingresa un correo electrónico válido.",
              },
            })}
            error={errors.email ? errors.email.message : ""}
          />

          {/* Campo de contraseña */}
          <Textbox
            placeholder=""
            type="password"
            name="password"
            label="Contraseña"
            className="w-full rounded-full"
            register={register("password", {
              required: "La contraseña es obligatoria.",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres.",
              },
            })}
            error={errors.password ? errors.password.message : ""}
          />

          {/* Enlace para recuperar contraseña */}
          <span className="text-sm text-gray-500 hover:text-red-600 hover:underline cursor-pointer">
            ¿Has olvidado tu contraseña?
          </span>

          {/* Botón de inicio de sesión */}
          {isLoading ? (
            <Loading />
          ) : (
            <Button
              type="submit"
              label="Ingresar"
              className="w-full h-10 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;