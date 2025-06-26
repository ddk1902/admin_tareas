import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardDoubleArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils";
import TaskDialog from "./task/TaskDialog";
import { BiMessageAltDetail } from "react-icons/bi";
import UserInfo from "./UserInfo";
import { IoMdAdd } from "react-icons/io";
import AddSubTask from "./task/AddSubTask";
import { PiEquals } from "react-icons/pi";
import { FaList } from "react-icons/fa";
import { getInitials } from "../utils/index.js";
const ICONS = {
  alta: <MdKeyboardDoubleArrowUp />,
  media: <MdKeyboardArrowUp />,
  baja: <MdKeyboardDoubleArrowDown />,
  normal: <PiEquals />,
};

const TaskCard = ({ task }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full h-fit bg-white shadow-md p-4 rounded">
        {/* Prioridad */}
        <div className="w-full flex justify-between items-center">
          <div
            className={clsx(
              "flex gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className="text-lg">{ICONS[task?.priority]}</span>
            <span className="uppercase">Prioridad {task?.priority}</span>
          </div>

          {user?.isAdmin && <TaskDialog task={task} />}
        </div>

        {/* Estado + Título */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div
              className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
            />
            <h4 className="line-clamp-1 text-black">{task?.title}</h4>
          </div>
          <span className="text-sm text-gray-600">
            {formatDate(new Date(task?.date))}
          </span>
        </div>

        {/* Recursos y estadísticas */}
        <div className="w-full border-t border-gray-200 my-2" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <BiMessageAltDetail />
              <span>{task?.activities?.length || 0}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <MdAttachFile />
              <span>{task?.assets?.length || 0}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <FaList />
              <span>0/{task?.subTasks?.length || 0}</span>
            </div>
          </div>

          {/* Responsables */}
          <div className="flex flex-row-reverse">
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS.length]
                )}
              >
                {getInitials(m.name)}
              </div>
            ))}
          </div>
        </div>

        {/* Lista de subtareas */}
        <div className="mt-4 w-full">
          {task?.subTasks && task.subTasks.length > 0 ? (
            <div className="space-y-3">
              {task.subTasks.map((subTask, index) => (
                <div key={index} className="border-t pt-2 border-gray-200">
                  <h5 className="text-base text-black">{subTask.title}</h5>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      {formatDate(new Date(subTask.date))}
                    </span>
                    <span className="bg-blue-600/10 px-3 py-1 rounded text-blue-700 font-medium">
                      {subTask.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 border-t border-gray-200">
              <span className="text-gray-500">No hay sub-tareas</span>
            </div>
          )}

          {/* Botón para abrir modal de nueva subtarea */}
     
        </div>
      </div>

      {/* Modal para agregar nueva sub-tarea */}
      {open && <AddSubTask open={true} setOpen={setOpen} id={task._id} />}
    </>
  );
};

export default TaskCard;