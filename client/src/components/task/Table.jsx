import React, { useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardDoubleArrowUp,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowDown,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaList, FaEquals } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";
import AddTask from "./AddTask"; // El modal para crear/editar
// Importa tus hooks de RTK Query
import {  useTrashTaskMutation } from "../../redux/slices/api/taskApiSlice";

// Utils e iconos
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import {toast} from "sonner";

// Iconos de prioridad
export const ICONS = {
  alta: <MdKeyboardDoubleArrowUp className="text-red-600" title="Prioridad Alta" />,
  media: <MdKeyboardArrowUp className="text-yellow-600" title="Prioridad Media" />,
  baja: <MdKeyboardDoubleArrowDown className="text-blue-600" title="Prioridad Baja" />,
  normal: <FaEquals className="text-green-600" title="Prioridad Normal" />,
};

const Table = ({ tasks }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteTask, { isLoading: isDeleting }] =  useTrashTaskMutation();

  const deleteClicks = (id) => {
    setSelectedTaskId(id);
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    try {
      await deleteTask({ id: selectedTaskId }).unwrap();
      toast.success("Tarea eliminada correctamente");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      toast.error("No se pudo eliminar la tarea");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="w-full border-b border-gray-300">
              <tr className="text-black text-left">
                <th className="py-2">Título de la tarea</th>
                <th className="py-2">Prioridad</th>
                <th className="py-2 line-clamp-1">Fecha Vencimiento:</th>
                <th className="py-2">Recursos</th>
                <th className="py-2">Responsables</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 text-gray-600 hover:bg-gray-300/10"
                >
                  {/* Título */}
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={clsx(
                          "w-4 h-4 rounded-full",
                          TASK_TYPE[task.stage]
                        )}
                      />
                      <p className="w-full line-clamp-2 text-base text-black">
                        {task.title}
                      </p>
                    </div>
                  </td>

                  {/* Prioridad */}
                  <td className="py-2">
                    <div className="flex gap-1 items-center">
                      <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
                        {ICONS[task.priority]}
                      </span>
                      <span className="capitalize">{task.priority} Prioridad</span>
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="py-2">
                    <span className="text-sm text-gray-600">
                      {formatDate(new Date(task.date))}
                    </span>
                  </td>

                  {/* Recursos */}
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 items-center text-sm text-gray-600">
                        <BiMessageAltDetail />
                        <span>{task.activities?.length || 0}</span>
                      </div>
                      <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
                        <MdAttachFile />
                        <span>{task.assets?.length || 0}</span>
                      </div>
                      <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaList />
                        <span>0/{task.subTasks?.length || 0}</span>
                      </div>
                    </div>
                  </td>

                  {/* Responsables */}
                  <td className="py-2">
                    {task.team && Array.isArray(task.team) && task.team.length > 0 ? (
                      <div className="flex">
                        {task.team.map((m, i) => (
                          <div
                            key={m._id}
                            className={clsx(
                              "w-7 h-7 rounded-full flex items-center justify-center text-sm -mr-1",
                              BGS[i % BGS.length]
                            )}
                          >
                            {UserInfo({ user: m })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin responsables</span>
                    )}
                  </td>

                  {/* Acciones: Editar / Eliminar */}
                  <td className="py-2 flex gap-2 md:gap-4 justify-end">
                    <Button
                      label="Editar"
                      type="button"
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-500 text-sm md:text-base"
                    />

                    <Button
                      label="Eliminar"
                      type="button"
                      onClick={() => deleteClicks(task._id)}
                      className="text-red-700 hover:text-red-500 text-sm md:text-base"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg="¿Estás seguro de que deseas eliminar esta tarea?"
        onClick={deleteHandler}
        type="delete"
      />

      {/* Modal de edición */}
      {isEditModalOpen && editingTask && (
        <AddTask
          open={true}
          setOpen={setIsEditModalOpen}
          task={editingTask}
        />
      )}
    </>
  );
};

export default Table;