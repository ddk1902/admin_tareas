import React from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import Loading from "../components/Loader";
import clsx from "clsx";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import UserInfo from "../components/UserInfo";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import moment from "moment";
import "moment/locale/es"; // Importa la localización en español
import { PiEquals} from "react-icons/pi";
import { useSelector } from "react-redux";
import{user} from 
// Configura moment para usar español globalmente
moment.locale("es");
// Personaliza los textos relativos
moment.updateLocale("es", {
  relativeTime: {
    future: "en %s", // "en 5 minutos"
    past: "hace %s", // "hace 5 minutos"
    s: "unos segundos", // Menos de un minuto
    ss: "%d segundos", // Varios segundos
    m: "un minuto", // 1 minuto
    mm: "%d minutos", // Varios minutos
    h: "una hora", // 1 hora
    hh: "%d horas", // Varias horas
    d: "un día", // 1 día
    dd: "%d días", // Varios días
    M: "un mes", // 1 mes
    MM: "%d meses", // Varios meses
    y: "un año", // 1 año
    yy: "%d años", // Varios años
  },
});


const TaskTable = ({ tasks,user }) => {
  const ICONS = {
    alta: <MdKeyboardDoubleArrowUp />,
    media: <MdKeyboardArrowUp />,
    baja: <MdKeyboardArrowDown />,
    normal: <PiEquals/>
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Título de la tarea</th>
        <th className="py-2">Prioridad</th>
        <th className="py-2">Responsable(s)</th>
        <th className="py-4">Vence/Venció:</th>
        {/* Solo mostrar columna Acciones si puede editar */}
        <th className="py-2">Acciones</th>
      </tr>
    </thead>
  );

    const TableRow = ({ task }) => {
    // Verificar si el usuario tiene permisos
    const canEdit = user?.isAdmin || task.team.some(m => m._id === user?._id);

    return (
      <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
        <td className="py-2">
          <div className="flex items-center gap-6">
            <div className={clsx("w-6 h-6 rounded-full", TASK_TYPE[task.stage])} />
            <p className="text-base text-black">{task.title}</p>
          </div>
        </td>

        <td className="py-2">
          <div className="flex gap-1 items-center">
            <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
              {ICONS[task.priority]}
            </span>
            <span className="capitalize">{task.priority}</span>
          </div>
        </td>

        <td className="py-4">
          <div className="flex">
            {task.team.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS.length]
                )}
              >
                <UserInfo user={m} />
              </div>
            ))}
          </div>
        </td>

        <td className="py-2 hidden md:block">
          <span className="text-base text-gray-600">
            {moment(task?.date).fromNow()}
          </span>
        </td>

        {/* Solo mostrar acciones si el usuario puede editar */}
        <td className="py-2">
          {canEdit ? (
            <div className="flex gap-2">
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">
                Editar
              </button>
              <button className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                En progreso
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Sin permiso</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="w-full bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
      <table className="w-full">
        <TableHeader />
        <tbody>
          {tasks?.map((task, id) => (
            <TableRow key={id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  if (error) {
    console.error("Error al obtener los datos del dashboard:", error);
    return (
      <div className="py-10 text-red-500 text-center">
        Error al cargar los datos del dashboard.
      </div>
    );
  }

  // 🔹 Si no es admin, solo mostrar sus propias tareas
  const filteredTasks = user?.isAdmin
    ? data?.last20Task
    : data?.last20Task?.filter((t) =>
        t.team.some((m) => m._id === user?._id)
      );

  const totals = data?.tasks || {};
  const stats = [
    {
      _id: "1",
      label: "Total de tareas",
      total: data?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "Tareas completadas",
      total: totals["completada"] || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "Tareas en progreso",
      total: totals["en progreso"] || 0,
      icon: <FaEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "Pendientes",
      total: totals["pendiente"] || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]" || 0,
    },
  ];

  const Card = ({ label, count, bg, icon }) => (
    <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
      <div className="h-full flex flex-1 flex-col justify-between">
        <p className="text-base text-gray-600">{label}</p>
        <span className="text-2xl font-semibold">{count}</span>
      </div>

      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center text-white",
          bg
        )}
      >
        {icon}
      </div>
    </div>
  );
 if (!user) return <div>Cargando usuario...</div>;

  return (
    <div className="h-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-20 py-10">
        {/* Tareas visibles según permisos */}
        <TaskTable tasks={filteredTasks} user={user} />
      </div>
    </div>
  );
};

export default Dashboard;