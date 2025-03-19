import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";

const AddUser = ({ open, setOpen, userData }) => {
  const { user } = useSelector((state) => state.auth);

  // Inicializa useForm con defaultValues
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues, // Para obtener los valores actuales del formulario
  } = useForm({ defaultValues: userData ?? {} });

  // Actualiza los valores del formulario cuando userData cambia
  React.useEffect(() => {
    if (userData) {
      console.log("Datos recibidos en userData:", userData); // Verifica los datos iniciales
      reset(userData);
    }
  }, [userData, reset]);

  const dispatch = useDispatch();
  const [AddNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isUpdating }] = useUpdateUserMutation();

  const handleOnSubmit = async () => {
    const formData = getValues(); // Obtiene los valores actuales del formulario
    console.log("Datos enviados desde el formulario:", formData);

    try {
      if (userData?._id) {
        // Verifica si el usuario ya existe
        const hasChanges = Object.keys(formData).some(
          (key) => formData[key] !== userData[key]
        );

        if (!hasChanges) {
          // Si no hay cambios, muestra un mensaje y no envía la solicitud
          toast.info("No se realizaron cambios.");
          return;
        }

        // Actualizar usuario existente
        const result = await updateUser({ id: userData._id, ...formData }).unwrap();
        console.log("Respuesta del backend al actualizar usuario:", result);
        toast.success(result?.message || "Usuario actualizado exitosamente");
        window.location.reload();
        if (userData._id === user._id) {
          dispatch(setCredentials({ ...result.user }));
        }
      } else {
        // Agregar nuevo usuario
        const result = await AddNewUser({ ...formData, password: formData.email }).unwrap();
        console.log("Respuesta del backend al agregar usuario:", result);
        toast.success("Usuario agregado exitosamente");
        window.location.reload();
      }

      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Error completo:", error);
      toast.error(error?.data?.message || "Ocurrió un error, por favor verifique");
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {userData ? "Actualizar perfil" : "Agregar un nuevo usuario"}
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder=''
              type='text'
              name='name'
              label='Nombre completo'
              className='w-full rounded'
              register={register("name", {
                required: "Campo obligatorio.!",
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder=''
              type='text'
              name='title'
              label='Título'
              className='w-full rounded'
              register={register("title", {
                required: "Campo obligatorio.!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder=''
              type='email'
              name='email'
              label='Email'
              className='w-full rounded'
              register={register("email", {
                required: "Campo obligatorio.!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <Textbox
              placeholder=''
              type='text'
              name='role'
              label='Rol'
              className='w-full rounded'
              register={register("role", {
                required: "Campo obligatorio.!",
              })}
              error={errors.role ? errors.role.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-yellow-600 px-8 text-sm font-semibold text-white hover:bg-green-700  sm:w-auto sm:ml-4'
                label='Guardar'
              />
               
              <Button
                type='button'
                className='bg-red-700 px-5 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Cancelar'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;