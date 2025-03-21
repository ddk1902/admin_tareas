import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { toast } from "sonner";
import Loading from "../components/Loader";
import { setCredentials } from "../redux/slices/authSlice";

const Login = () => {
  const { user } = useSelector((state) => state.auth); // Obtener el estado del usuario
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [login, { isLoading }] = useLoginMutation(); // Hook para iniciar sesión

  // Redirigir al usuario si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Manejar el envío del formulario
  const submitHandler = async (data) => {
    try {
      const result = await login(data).unwrap(); // Intentar iniciar sesión
      console.log("Inicio de sesión exitoso:", result);
      dispatch(setCredentials(result)); // Guardar las credenciales en Redux
      navigate("/dashboard"); // Redirigir al dashboard
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const errorMessage = error?.data?.message || "Credenciales incorrectas. Inténtalo de nuevo.";
      toast.error(errorMessage); // Mostrar mensaje de error específico
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]">
      {/* Lado izquierdo: Logo y descripción */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center">
        <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10">
        <img
            src="/assets/logo_senepa.png" // Ruta relativa al archivo en la carpeta public
            alt="Logo"
            className="w-45 h-45 mb-2" // Logo más pequeño y margen reducido
          />
          <p className="text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-red-700">
            Administrador de Tareas
          </p>
       
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