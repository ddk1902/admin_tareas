import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation, useDeleteUserMutation } from "../redux/slices/api/userApiSlice";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { toast } from "sonner";
import ConfirmatioDialog from "./Dialogs";
import { storage } from "../utils/firebase"; // Importa el servicio de Firebase Storage

const AddUser = ({ open, setOpen, userData }) => {
  const { user } = useSelector((state) => state.auth);

  // Estados para manejar la subida de archivos
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFileURLs, setUploadFileURLs] = useState([]); // Almacenar URLs de archivos subidos

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
      reset(userData);
    }
  }, [userData, reset]);

  const dispatch = useDispatch();
  const [AddNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Estado para controlar la visibilidad del diálogo de confirmación
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

  const handleOnSubmit = async () => {
    
    const formData = getValues(); // Obtiene los valores actuales del formulario
    console.log("Datos del formulario:", formData)
    console.log("Datos enviados desde el formulario:", formData);

    try {
      if (userData?._id) {
        // Verifica si el usuario ya existe
              const hasChanges = Object.keys(formData).some((key) => {
          const formValue = formData[key];
          const userValue = userData[key];

          // Para evitar errores en comparaciones de objetos o arrays
          if (typeof formValue === 'object' && formValue !== null) {
            return JSON.stringify(formValue) !== JSON.stringify(userValue);
          }

          return formValue !== userValue;
        });

        // Agregar URLs de archivos subidos al formData
        formData.assets = uploadFileURLs;

        // Actualizar usuario existente
        const result = await updateUser({ id: userData._id, ...formData }).unwrap();
        console.log("Respuesta del backend al actualizar usuario:", result);
        toast.success(result?.message || "Usuario actualizado exitosamente");
        window.location.reload();
        if (userData._id === user._id) {
          dispatch(setCredentials({ ...result.user }));
        }
      } else {
        // Agregar URLs de archivos subidos al formData
        formData.assets = uploadFileURLs;

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

  const handleDeleteUser = async () => {
    if (!userData?._id) {
      toast.error("No se puede eliminar un usuario sin ID.");
      return;
    }

    try {
      // Eliminar el usuario
      const result = await deleteUser(userData._id).unwrap();
      console.log("Respuesta del backend al eliminar usuario:", result);
      toast.success(result?.message || "Usuario eliminado exitosamente");

      // Recargar la página o actualizar los datos
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(error?.data?.message || "Ocurrió un error al eliminar el usuario.");
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  const uploadFiles = async () => {
    if (assets.length === 0) {
      toast.error("No hay archivos seleccionados para subir.");
      return;
    }

    setUploading(true);
    const uploadedURLs = [];

    try {
      for (const file of assets) {
        const name = new Date().getTime() + "-" + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              console.log("Subiendo archivo...");
            },
            (error) => {
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref)
                .then((downloadURL) => {
                  uploadedURLs.push(downloadURL);
                  resolve();
                })
                .catch((error) => {
                  reject(error);
                });
            }
          );
        });
      }

      setUploadFileURLs(uploadedURLs);
      toast.success("Archivos subidos exitosamente.");
    } catch (error) {
      console.error("Error al subir archivos:", error);
      toast.error("Ocurrió un error al subir los archivos.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Modal principal para agregar/editar usuarios */}
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            {userData ? "Actualizar perfil" : "Agregar un nuevo usuario"}
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder=""
              type="text"
              name="name"
              label="Nombre completo"
              className="w-full rounded"
              register={register("name", {
                required: "Campo obligatorio.!",
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder=""
              type="text"
              name="title"
              label="Título"
              className="w-full rounded"
              register={register("title", {
                required: "Campo obligatorio.!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder=""
              type="email"
              name="email"
              label="Email"
              className="w-full rounded"
              register={register("email", {
                required: "Campo obligatorio.!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <Textbox
              placeholder=""
              type="text"
              name="role"
              label="Rol"
              className="w-full rounded"
              register={register("role", {
                required: "Campo obligatorio.!",
              })}
              error={errors.role ? errors.role.message : ""}
            />

            {/* Input para seleccionar archivos */}
            
          </div>

          {isLoading || isUpdating || isDeleting ? (
            <div className="py-5">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
              {/* Botón Guardar */}
              <Button
                type="submit"
                className="bg-yellow-600 px-8 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto sm:ml-4"
                label="Guardar"
              />


              {/* Botón Eliminar */}
              {userData?._id && (
                <Button
                  type="button"
                  className="bg-purple-700 px-5 text-sm font-semibold text-white hover:bg-red-800 sm:w-auto sm:ml-4"
                  onClick={() => setIsConfirmationOpen(true)}
                  label="Eliminar"
                />
              )}

              {/* Botón Cancelar */}
              <Button
                type="button"
                className="bg-blue-400 px-5 text-sm font-semibold text-white hover:bg-gray-500 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancelar"
              />
            </div>
          )}
        </form>
      </ModalWrapper>

      {/* Diálogo de confirmación para eliminar usuario */}
      <ConfirmatioDialog
        open={isConfirmationOpen}
        setOpen={setIsConfirmationOpen}
        msg="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        onClick={handleDeleteUser}
        type="delete"
      />
    </>
  );
};


export default AddUser;