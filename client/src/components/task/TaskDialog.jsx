import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { HiDuplicate } from "react-icons/hi";
import { MdAdd, MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Menu, Transition } from "@headlessui/react";
import AddTask from "./AddTask";
import AddSubTask from "./AddSubTask";
import ConfirmatioDialog from "../Dialogs";
import { toast } from "sonner";
import { useDuplicateTaskMutation, useTrashTaskMutation, useUpdateTaskMutation } from "../../redux/slices/api/taskApiSlice";

const TaskDialog = ({ task }) => {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();
  const [deleteTask] = useTrashTaskMutation();
  const [duplicateTask] = useDuplicateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Función para duplicar una tarea
  const duplicateHandler = async () => {
    try {
      if (!task?._id) {
        console.error("ID de tarea no definido");
        toast.error("La tarea no está disponible para duplicar.");
        return;
      }

      const res = await duplicateTask(task._id).unwrap();
      toast.success(res?.message || "Tarea duplicada exitosamente.");

      setTimeout(() => {
        window.location.reload(); // Recarga la página
      }, 500);
    } catch (error) {
      console.error("Error duplicando tarea:", error);
      toast.error(error?.data?.message || "Error al duplicar la tarea.");
    }
  };

  // Función para eliminar una tarea
  const deleteClicks = () => {
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    try {
      if (!task?._id) {
        console.error("ID de tarea no definido");
        toast.error("La tarea no está disponible para eliminar.");
        return;
      }

      const res = await deleteTask({
        id: task._id,
        isTrashed: "trash",
      }).unwrap();
      toast.success(res?.message || "Tarea eliminada exitosamente.");

      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload(); // Recarga la página
      }, 800);
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      toast.error(error?.data?.message || "Error al eliminar la tarea.");
    }
  };

  // Función para editar una tarea
  const editHandler = async () => {
    try {
      if (!task?._id) {
        console.error("ID de tarea no definido");
        toast.error("La tarea no está disponible para editar.");
        return;
      }

      console.log("ID de la tarea:", task._id);

      // Lógica para editar la tarea
      const updatedData = {
        title: "Nuevo título", // Ejemplo de datos actualizados
        priority: "alta",
        stage: "pendiente",
        date: new Date(),
      };

      const response = await updateTask({ id: task._id, data: updatedData }).unwrap();
      toast.success(response?.message || "Tarea actualizada exitosamente.");

      setTimeout(() => {
        window.location.reload(); // Recarga la página
      }, 500);
    } catch (error) {
      console.error("Error editando tarea:", error);
      toast.error(error?.data?.message || "Error al editar la tarea.");
    }
  };

  // Elementos del menú
  const items = [
    {
      label: "Ver la tarea",
      icon: <AiTwotoneFolderOpen className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => navigate(`/task/${task?._id}`),
    },
    {
      label: "Editar",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpenEdit(true),
    },
    {
      label: "Agregar Subtarea",
      icon: <MdAdd className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: () => setOpen(true),
    },
    {
      label: "Duplicar",
      icon: <HiDuplicate className="mr-2 h-5 w-5" aria-hidden="true" />,
      onClick: duplicateHandler,
    },
  ];

  return (
    <>
      {/* Menú desplegable */}
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600">
            <BsThreeDots />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute p-4 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-1 py-1 space-y-2">
                {items.map((el) => (
                  <Menu.Item key={el.label}>
                    {({ active }) => (
                      <button
                        onClick={el.onClick}
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {el.icon}
                        {el.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>

              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={deleteClicks}
                      className={`${
                        active ? "bg-blue-500 text-white" : "text-red-900"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <RiDeleteBin6Line
                        className="mr-2 h-5 w-5 text-red-400"
                        aria-hidden="true"
                      />
                      Eliminar
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Componentes adicionales */}
      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={task}
        key={new Date().getTime()}
      />

      <AddSubTask open={open} setOpen={setOpen} />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default TaskDialog;