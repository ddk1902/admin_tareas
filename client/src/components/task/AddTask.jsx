import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { useGetTeamListQuery } from "../../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const LISTS = ["PENDIENTE", "EN PROGRESO", "COMPLETADA"];
const PRIORIRY = ["ALTA", "MEDIA", "NORMAL","BAJA"];

const AddTask = ({ open, setOpen, task }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [team, setTeam] = useState(task?.team || []);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [priority, setPriority] = useState(task?.priority?.toUpperCase() || PRIORIRY[3]);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileURLs, setUploadedFileURLs] = useState([]); // Estado para almacenar las URLs de los archivos subidos

  const { data: users, isLoading: isUsersLoading, error: usersError } = useGetTeamListQuery();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const URLS = task?.assets ? [...task.assets] : [];

  // Función para subir archivos a Firebase Storage
  const uploadFiles = async () => {
    if (assets.length === 0) {
      toast.error("No hay archivos seleccionados para subir.");
      return;
    }

    const uploadedURLs = []; // Array temporal para almacenar las URLs de los archivos subidos

    for (const file of assets) {
      try {
        const url = await uploadFile(file); // Sube el archivo y obtén su URL
        uploadedURLs.push(url); // Almacena la URL en el array temporal
      } catch (error) {
        console.error("Error al subir el archivo:", error.message);
        toast.error("Ocurrió un error al subir uno o más archivos.");
        return;
      }
    }

    setUploadedFileURLs(uploadedURLs); // Actualiza el estado con las URLs de los archivos subidos
    toast.success("Archivos subidos exitosamente.");
  };

  // Función para subir un archivo individual a Firebase Storage
  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const name = new Date().getTime() + "-" + file.name; // Nombre único para el archivo
      const storageRef = ref(storage, name); // Referencia al archivo en Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Opcional: Muestra el progreso de la subida
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Subiendo archivo: ${progress.toFixed(2)}% completado`);
        },
        (error) => {
          reject(error); // Rechaza la promesa si ocurre un error
        },
        () => {
          // Cuando la subida termina, obtén la URL del archivo
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL); // Resuelve la promesa con la URL
            })
            .catch((error) => {
              reject(error); // Rechaza la promesa si ocurre un error
            });
        }
      );
    });
  };

  const submitHandler = async (data) => {
    if (assets.length > 0) {
      setUploading(true);
      try {
        await uploadFiles(); // Sube los archivos antes de enviar el formulario
      } catch (error) {
        console.error("Error al subir archivos:", error.message);
        toast.error("Ocurrió un error al subir los archivos.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs], // Combina las URLs existentes con las nuevas
        team,
        stage,
        priority,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);
      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(Array.from(e.target.files)); // Convierte FileList a un array
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
            {task ? "ACTUALIZAR TAREA" : "AGREGAR UNA TAREA"}
          </Dialog.Title>

          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder=""
              type="text"
              name="title"
              label="Título"
              className="w-full rounded"
              register={register("title", { required: "Campo obligatorio!" })}
              error={errors.title ? errors.title.message : ""}
            />

            {/* Lista de usuarios */}
            {isUsersLoading ? (
              <p>Cargando usuarios...</p>
            ) : usersError ? (
              <p>Error al cargar usuarios.</p>
            ) : (
              <UserList
                users={users || []}
                selectedUsers={team}
                setSelectedUsers={setTeam}
              />
            )}

            <div className="flex gap-4">
              <SelectList
                label="Estado de la tarea"
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <div className="w-full">
                <Textbox
                  placeholder=""
                  type="date"
                  name="date"
                  label="Fecha de la tarea"
                  className="w-full rounded"
                  register={register("date", { required: "La fecha es obligatoria!" })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <SelectList
                label="Nivel de prioridad"
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className="w-full flex items-center justify-center mt-4">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    onChange={handleSelect}
                    accept=".jpg, .png, .jpeg"
                    multiple={true}
                  />
                  <BiImages />
                  <span>Agregar recursos</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
              {uploading ? (
                <span className="text-sm py-2 text-red-500">Subiendo recursos</span>
              ) : (
                <Button
                  label="Guardar"
                  type="submit"
                  className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
                />
              )}

              <Button
                type="button"
                className="bg-yellow-500 px-5 text-sm font-semibold text-gray-900 sm:w-auto hover:bg-gray-500"
                onClick={() => setOpen(false)}
                label="Cancelar"
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;