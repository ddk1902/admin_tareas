import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import {useCreateTaskMutation,useUpdateTaskMutation} from '../../redux/slices/api/taskApiSlice'
import { useGetTeamListQuery } from "../../redux/slices/api/userApiSlice";

const LISTS = ["PENDIENTE", "EN PROGRESO", "COMPLETADA"];
const PRIORIRY = ["ALTA", "MEDIA", "NORMAL", "BAJA"];

const uploadedFileURLs = [];

const AddTask = ({ open, setOpen,task}) => {


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [team, setTeam] = useState(task?.team || []);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { data: users, isLoading: isUsersLoading, error: usersError } = useGetTeamListQuery();

  // Agregar console.log para depurar los datos recibidos
  console.log("Datos de usuarios obtenidos del backend:", users);
  const[createTask,{isLoading}]=useCreateTaskMutation();
  const[updateTask,{isLoading: isUpdating}]=useUpdateTaskMutation();

  const URLS= task?.assets ? [...task.assets]:[];

  const submitHandler = async (data) => {
    for (const file of assets){
      setUploading(true);
      try {
        await uploadedFileURLs(file);
      } catch (error) {
        console.error("Error al subir el recurso",error.message);
        return;
      } finally{
        setUploading(false);
      }
    }
    try {
      const newData={
        ...data,
        assets:[...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };
      const res = task?._id
      ? await updateTask({...newData,_id:task._id}).unwrap()
      : await createTask(newData).unwrap();
      toast.success(res.message);
      setTimeout(()=>{
        setOpen(false);
      },500);

    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message||err.error)
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {task ? "ACTUALIZAR TAREA" : "AGREGAR UNA TAREA"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder=''
              type='text'
              name='title'
              label='Título'
              className='w-full rounded'
              register={register("title", { required: "Campo obligatorio!" })}
              error={errors.title ? errors.title.message : ""}
            />

            {/* <UserList setTeam={setTeam} team={team} /> */}
            {/* Lista de usuarios */}
            {isUsersLoading ? (
              <p>Cargando usuarios...</p>
            ) : usersError ? (
              <p>Error al cargar usuarios.</p>
            ) : (
              <UserList
                users={users || []} // Usuarios obtenidos desde el backend
                selectedUsers={team}
                setSelectedUsers={setTeam}
              />
            )}

            <div className='flex gap-4'>
              <SelectList
                label='Estado de la tarea'
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <div className='w-full'>
                <Textbox
                  placeholder=''
                  type='date'
                  name='date'
                  label='Fecha de la tarea'
                  className='w-full rounded'
                  register={register("date", {
                    required: "La fecha es obligatoria!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
            </div>

            <div className='flex gap-4'>
              <SelectList
                label='Nivel de prioridad'
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className='w-full flex items-center justify-center mt-4'>
                <label
                  className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                  htmlFor='imgUpload'
                >
                  <input
                    type='file'
                    className='hidden'
                    id='imgUpload'
                    onChange={(e) => handleSelect(e)}
                    accept='.jpg, .png, .jpeg'
                    multiple={true}
                  />
                  <BiImages />
                  <span>Agregar recursos</span>
                </label>
              </div>
            </div>

            <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
              {uploading ? (
                <span className='text-sm py-2 text-red-500'>
                  Subiendo recursos
                </span>
              ) : (
                <Button
                  label='Guardar'
                  type='submit'
                  className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-green-700  sm:w-auto'
                />
              )}

              <Button
                type='button'
                className='bg-yellow-500 px-5 text-sm font-semibold text-gray-900 sm:w-auto hover:bg-gray-500'
                onClick={() => setOpen(false)}
                label='Cancelar'
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
