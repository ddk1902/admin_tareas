import React, { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList"; // Componente corregido
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { useGetTeamListQuery } from "../../redux/slices/api/userApiSlice";
import { toast } from "sonner";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../utils/firebase";
import { formatDateToInput } from "../../utils";

const LISTS = ["PENDIENTE", "EN PROGRESO", "COMPLETADA"];
const PRIORIRY = ["ALTA", "MEDIA", "NORMAL", "BAJA"];

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: task?.date ? formatDateToInput(task.date) : formatDateToInput(new Date()),
    team: task?.team || [],
    stage: task?.stage?.toUpperCase() || LISTS[0],
    priority: task?.priority?.toUpperCase() || PRIORIRY[0],
    assets: task?.assets || [],
    subTasks: task?.subTasks || [],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [team, setTeam] = useState(task?.team || []);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [priority, setPriority] = useState(task?.priority?.toUpperCase() || PRIORIRY[0]);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileURLs, setUploadedFileURLs] = useState([]);
  const [subTasks, setSubTasks] = useState(task?.subTasks || []);

  const { data: users, isLoading: isUsersLoading, error: usersError } = useGetTeamListQuery();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const URLS = task?.assets ? [...task.assets] : [];
    // Cargar subTasks iniciales
    useEffect(() => {
      if (task?.subTasks) {
        setSubTasks([...task.subTasks]);
      }
    }, [task]);

  const uploadFiles = async () => {
    if (assets.length === 0) {
      toast.info("No hay nuevos archivos.");
      return;
    }

    setUploading(true);

    for (const file of assets) {
      try {
        const url = await uploadFile(file);
        setUploadedFileURLs((prev) => [...prev, url]);
      } catch (error) {
        console.error("Error al subir archivo:", error.message);
        toast.error("Hubo un error al subir uno o más archivos");
        setUploading(false);
        return;
      }
    }

    setUploading(false);
  };

  const submitHandler = async (data) => {
    if (!team.length) {
      toast.warning("Debes asignar al menos un responsable.");
      return;
    }

    if (assets.length > 0) {
      await uploadFiles();
    }

    try {
      const parsedDate = data.date.split('-');
      const isoDate = new Date(`${parsedDate[0]}-${parsedDate[1]}-${parsedDate[2]}T00:00:00`);

      const newData = {
        ...data,
        date: isoDate.toISOString(),
        assets: [...URLS, ...uploadedFileURLs],
        team, // ✅ Aquí mandamos los objetos o _id
        stage,
        priority,
        subTasks,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

        toast.success(res.message);
          setTimeout(() => setOpen(false), 800);
        } catch (err) {
          console.error("Error al guardar:", err);
          toast.error(err?.data?.message || "Hubo un error al guardar los datos");
        }
      };

  const handleSelect = (e) => {
    setAssets(Array.from(e.target.files));
  };
// Componente para editar subtareas
  const SubTaskEditor = () => {
    const [newSubTask, setNewSubTask] = useState({
      title: "",
      date: new Date().toISOString().split("T")[0],
      tag: "En progreso",
    });

    const addSubTask = () => {
      if (!newSubTask.title.trim()) {
        toast.warning("El título es obligatorio");
        return;
      }
      setSubTasks([...subTasks, { ...newSubTask }]);
      setNewSubTask({
        title: "",
        date: new Date().toISOString().split("T")[0],
        tag: "En progreso",
      });
    };

    const removeSubTask = (index) => {
      const updated = [...subTasks];
      updated.splice(index, 1);
      setSubTasks(updated);
    };
return (
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">Subtareas</h3>
        <div className="space-y-3">
          {/* Lista de subtareas */}
          {subTasks.map((el, index) => (
            <div key={index} className="flex items-center gap-3 border-b pb-2">
              <input
                type="text"
                value={el.title}
                onChange={(e) =>
                  setSubTasks(
                    subTasks.map((st, i) => (i === index ? { ...st, title: e.target.value } : st))
                  )
                }
                className="border rounded px-2 py-1 w-full"
                placeholder="Título"
              />
              <input
                type="date"
                value={el.date.split("T")[0]}
                onChange={(e) =>
                  setSubTasks(
                    subTasks.map((st, i) => (i === index ? { ...st, date: e.target.value } : st))
                  )
                }
                className="border rounded px-2 py-1"
              />
              <select
                value={el.tag}
                onChange={(e) =>
                  setSubTasks(
                    subTasks.map((st, i) => (i === index ? { ...st, tag: e.target.value } : st))
                  )
                }
                className="border rounded px-2 py-1"
              >
                <option>En progreso</option>
                <option>Completada</option>
                <option>Pendiente</option>
              </select>
              <button
                type="button"
                onClick={() => removeSubTask(index)}
                className="text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Agregar nueva subtarea */}
          <div className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Título de la subtarea"
              value={newSubTask.title}
              onChange={(e) => setNewSubTask({ ...newSubTask, title: e.target.value })}
              className="w-full border rounded p-2"
            />
            <input
              type="date"
              value={newSubTask.date}
              onChange={(e) => setNewSubTask({ ...newSubTask, date: e.target.value })}
              className="w-full border rounded p-2"
            />
            <select
              value={newSubTask.tag}
              onChange={(e) => setNewSubTask({ ...newSubTask, tag: e.target.value })}
              className="w-full border rounded p-2"
            >
              <option>En progreso</option>
              <option>Completada</option>
              <option>Pendiente</option>
            </select>
            <button
              type="button"
              onClick={addSubTask}
              className="bg-violet-600 text-white px-3 py-1 rounded mt-2 hover:bg-violet-700"
            >
              + Agregar subtarea
            </button>
          </div>
        </div>
      </div>
    );
  };

  const uploadFile = (file) => {
    return new Promise(async (resolve, reject) => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error("Inicia sesión para subir archivos.");
        return reject("Usuario no autenticado");
      }

      const name = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Subiendo archivo: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error("Error al subir archivo:", error.message);
          toast.error("Ocurrió un error al subir el archivo.");
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    });
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          {task ? "ACTUALIZAR TAREA" : "AGREGAR UNA TAREA"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          {/* Campo título */}
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

          {/* Estado y Fecha */}
          <div className="flex gap-4">
            <SelectList label="Estado de la tarea" lists={LISTS} selected={stage} setSelected={setStage} />
            <Textbox
              placeholder=""
              type="date"
              defaultValue={task?.date ? formatDateToInput(task.date) : ""}
              name="date"
              label="Fecha de vencimiento"
              register={register("date", { required: "La fecha es obligatoria!" })}
              error={errors.date ? errors.date.message : ""}
            />
          </div>

          {/* Prioridad y recursos */}
          <div className="flex gap-4">
            <SelectList label="Nivel de prioridad" lists={PRIORIRY} selected={priority} setSelected={setPriority} />
            <div className="w-full flex items-center justify-center mt-4">
              <label
                className="flex items-center gap-1 text-base hover:text-ascent-1 cursor-pointer my-4"
                htmlFor="imgUpload"
              >
                <input
                  type="file"
                  className="hidden"
                  id="imgUpload"
                  onChange={handleSelect}
                  accept=".jpg, .png, .jpeg, .docx, .txt"
                  multiple
                />
                <BiImages />
                <span>Agregar recursos</span>
              </label>
            </div>
          </div>
           {/* Editor de subtareas */}
          <SubTaskEditor />
          {/* Botones */}
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
  );
};

export default AddTask;