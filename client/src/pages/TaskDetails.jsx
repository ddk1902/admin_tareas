import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTaskByIdQuery } from "../redux/slices/api/taskApiSlice";
import Tabs from "../components/Tabs";
import Loading from "../components/Loader";
import Button from "../components/Button";
import { clsx } from "clsx";
import moment from "moment";

// Componente para crear/editar tareas
import AddTask from "../components/task/AddTask";

// Iconos
import {
  FaThumbsUp,
  FaBug,
  FaUser,
} from "react-icons/fa";
import {
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdKeyboardDoubleArrowUp,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowDown,
} from "react-icons/md";
import { GrInProgress } from "react-icons/gr";
import { FaEquals } from "react-icons/fa6";

// Utilidades
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";

const TABS = [
  { title: "Detalles de la tarea", icon: null },
  { title: "Actividades / Timeline", icon: null },
];

const TaskDetails = () => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
     task,
    isLoading,
    error,
  } = useGetTaskByIdQuery(id);

  if (isLoading) return <Loading />;
  if (error) {
    console.error("Error al obtener la tarea:", error);
    return <p className="text-red-500">Error al cargar la tarea</p>;
  }
  if (!task) return <p className="text-yellow-500">Tarea no encontrada</p>;

  return (
    <div className="w-full flex flex-col gap-3 mb-4">
      {/* Botón de edición */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-gray-600 font-bold">{task.title}</h1>
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Editar Tarea
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} setSelected={setSelectedTab} />

      {/* Contenido según pestaña seleccionada */}
      {selectedTab === 0 ? (
        <Details task={task} />
      ) : (
        <Activities activity={task.activities || []} id={id} />
      )}

      {/* Modal de edición */}
      {showEditModal && (
        <AddTask
          open={showEditModal}
          setOpen={setShowEditModal}
          task={task}
        />
      )}
    </div>
  );
};

// Componente para mostrar detalles
const Details = ({ task }) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-5 bg-white shadow-md p-8 mt-4 rounded-md">
      <div className="w-full md:w-1/2 space-y-6">
        {/* Prioridad y estado */}
        <div className="flex items-center gap-5">
          <div
            className={clsx(
              "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
              PRIOTITYSTYELS[task.priority]
            )}
          >
            <span>{getPriorityIcon(task.priority)}</span>
            <span className="uppercase">{task.priority} prioridad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}></div>
            <span className="text-black uppercase">{task.stage}</span>
          </div>
        </div>

        {/* Fecha de creación */}
        <p className="text-gray-500">
          Creada en: {new Date(task.date).toLocaleDateString()}
        </p>

        {/* Recursos y subtareas */}
        <div className="flex items-center gap-8 p-4 border-y border-gray-200">
          <div className="space-x-2">
            <span className="font-semibold">Recursos:</span>
            <span>{task.assets?.length || 0}</span>
          </div>
          <span className="text-gray-400">|</span>
          <div className="space-x-2">
            <span className="font-semibold">Sub-Tareas:</span>
            <span>{task.subTasks?.length || 0}</span>
          </div>
        </div>

        {/* Responsables */}
        <div className="space-y-4 py-6">
          <p className="text-gray-600 font-semibold text-sm">Responsable/es</p>
          {task.team && task.team.length > 0 ? (
            task.team.map((member, index) => (
              <div key={index} className="flex gap-4 items-center border-t border-gray-200 pt-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                  <span>{getInitials(member.name)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold">{member.name}</p>
                  <span className="text-gray-500">{member.title}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No hay responsables asignados.</p>
          )}
        </div>

        {/* Subtareas */}
<div className="space-y-4 py-6">
  <p className="text-gray-500 font-semibold text-sm">SUB-TAREAS</p>
  {task.subTasks && task.subTasks.length > 0 ? (
    task.subTasks.map((el, index) => (
      <div key={index} className="flex gap-3 items-start">
        {/* Icono de sub-tarea */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-500 text-white">
          <MdOutlineDoneAll size={20} />
        </div>

        {/* Contenido de la sub-tarea */}
        <div className="space-y-1 w-full">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">
              {new Date(el.date).toLocaleDateString()}
            </span>
            {el.tag && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700 font-semibold">
                {el.tag}
              </span>
            )}
          </div>
          <p className="text-gray-700">{el.title}</p>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-400 italic">No hay sub-tareas disponibles.</p>
  )}
</div>

        {/* Recursos */}
        <div className="space-y-4 py-6">
          <p className="text-gray-500 font-semibold text-sm">RECURSOS</p>
          <div className="grid grid-cols-2 gap-4">
            {task.assets && task.assets.length > 0 ? (
              task.assets.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Recurso ${index + 1}`}
                  className="w-full rounded h-28 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              ))
            ) : (
              <p>No hay recursos disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para actividades
const Activities = ({ activity }) => {
  const Card = ({ item }) => {
    return (
      <div className="flex space-x-4 mb-6">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {ACTIVITY_ICONS[item.type]}
          </div>
          <div className="w-0.5 bg-gray-300 h-full"></div>
        </div>
        <div className="flex flex-col gap-y-1">
          <p className="font-semibold">{item.by?.name}</p>
          <div className="text-gray-500 space-y-2">
            <span className="capitalize">{item.type}</span>
            <span className="text-sm">{moment(item.date).fromNow()}</span>
          </div>
          <div className="text-gray-700">{item.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 min-h-screen px-10 py-8 bg-white shadow rounded-md overflow-y-auto">
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Actividades</h4>
        {activity.length > 0 ? (
          activity.map((item, index) => <Card key={index} item={item} />)
        ) : (
          <p>No hay actividades disponibles.</p>
        )}
      </div>
    </div>
  );
};

// Función para iconos de prioridad
const getPriorityIcon = (priority) => {
  switch (priority) {
    case "alta":
      return <MdKeyboardDoubleArrowUp />;
    case "media":
      return <MdKeyboardArrowUp />;
    case "baja":
      return <MdKeyboardDoubleArrowDown />;
    default:
      return <FaEquals />;
  }
};

export default TaskDetails;