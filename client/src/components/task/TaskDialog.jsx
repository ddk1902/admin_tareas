import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { HiDuplicate } from "react-icons/hi";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Menu, Transition } from "@headlessui/react";
import ConfirmatioDialog from "../Dialogs";
import { toast } from "sonner";
import {
  useDuplicateTaskMutation,
  useTrashTaskMutation,
  useUpdateTaskMutation,
  useAddCommentMutation,
} from "../../redux/slices/api/taskApiSlice";

const TaskDialog = ({ task }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const [title, setTitle] = useState(task?.title || "");
  const [date, setDate] = useState(task?.date ? task.date.split("T")[0] : "");
  const [priority, setPriority] = useState(task?.priority || "media");
  const [stage, setStage] = useState(task?.stage || "pendiente");

  const navigate = useNavigate();
  const [deleteTask] = useTrashTaskMutation();
  const [duplicateTask] = useDuplicateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [addComment] = useAddCommentMutation();

  // 🟦 Duplicar tarea
  const duplicateHandler = async () => {
    try {
      const res = await duplicateTask(task._id).unwrap();
      toast.success(res?.message || "Tarea duplicada exitosamente.");
      setTimeout(() => navigate(0), 500);
    } catch (error) {
      toast.error(error?.data?.message || "Error al duplicar la tarea.");
    }
  };

  // 🔴 Eliminar tarea
  const deleteHandler = async () => {
    try {
      const res = await deleteTask({ id: task._id, isTrashed: "trash" }).unwrap();
      toast.success(res?.message || "Tarea eliminada exitosamente.");
      setTimeout(() => navigate(0), 800);
    } catch (error) {
      toast.error(error?.data?.message || "Error al eliminar la tarea.");
    }
  };

  // ✏️ Guardar edición
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = { title, priority, stage, date };
      const res = await updateTask({ id: task._id, data: updatedTask }).unwrap();
      toast.success(res?.message || "Tarea actualizada exitosamente.");
      setEditOpen(false);
      setTimeout(() => navigate(0), 600);
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      toast.error(error?.data?.message || "Error al actualizar la tarea.");
    }
  };

  // 💬 Agregar comentario
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Escribe un comentario antes de enviar.");
    try {
      await addComment({ id: task._id, text: comment }).unwrap();
      toast.success("Comentario agregado correctamente.");
      setComment("");
      setTimeout(() => navigate(0), 400);
    } catch (error) {
      toast.error(error?.data?.message || "No se pudo agregar el comentario.");
    }
  };

  // 📋 Menú principal
  const items = [
    {
      label: "Editar",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" />,
      onClick: () => setEditOpen(true),
    },
    {
      label: "Duplicar",
      icon: <HiDuplicate className="mr-2 h-5 w-5" />,
      onClick: duplicateHandler,
    },
    {
      label: "Comentar",
      icon: <MdOutlineEdit className="mr-2 h-5 w-5" />,
      onClick: () => setIsCommentOpen(true),
    },
  ];

  return (
    <>
      {/* Menú principal */}
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
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
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
                    onClick={() => setOpenDialog(true)}
                    className={`${
                      active ? "bg-blue-500 text-white" : "text-red-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <RiDeleteBin6Line className="mr-2 h-5 w-5 text-red-400" />
                    Eliminar
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* 🔴 Confirmación de eliminación */}
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      {/* 🟦 MODAL DE EDICIÓN */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
              ✏️ Editar tarea
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Estado
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:underline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm rounded-md shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💬 MODAL DE COMENTARIOS */}
      {isCommentOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-5">
            <h3 className="text-lg font-semibold mb-3">💬 Comentarios</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 mb-3 text-sm">
              {task.comments?.length ? (
                task.comments.map((c, idx) => (
                  <div key={idx} className="border-b py-1">
                    <span className="font-semibold">{c.by?.name || "Usuario"}</span>
                    <span className="text-gray-500 text-xs ml-1">
                      ({new Date(c.date).toLocaleDateString("es-ES")})
                    </span>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aún no hay comentarios.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 border rounded-md px-2 py-1 text-sm"
                placeholder="Escribe un comentario..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
              >
                Enviar
              </button>
            </form>

            <button
              onClick={() => setIsCommentOpen(false)}
              className="mt-3 text-xs text-gray-500 hover:underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskDialog;

