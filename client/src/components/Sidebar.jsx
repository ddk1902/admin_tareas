import React from "react";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlineAdjust,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import clsx from "clsx";

const linkData = [
  {
    label: "Inicio",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tareas",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completadas",
    link: "completada/completada",
    icon: <MdTaskAlt />,
  },
  {
    label: "En progreso",
    link: "en progreso/en progreso",
    icon: <MdOutlineAdjust />,
  },
  {
    label: "Pendientes",
    link: "pendiente/pendiente",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Papelera",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const location = useLocation();

  const path = location.pathname.split("/")[1];

  const sidebarLinks = user?.isAdmin ? linkData : linkData.slice(0, 5);

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        to={el.link}
        onClick={closeSidebar}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#0f6606] hover:text-white",
          path === el.link.split("/")[0] ? "bg-red-700 text-neutral-100" : ""
        )}
      >
        {el.icon}
        <span className='hover:text-[#010a00]'>{el.label}</span>
      </Link>
    );
  };
  return (
    <div className='w-full  h-full flex flex-col gap-6 p-5'>
      <h1 className='flex gap-1 items-center'>
      <div className='bg-white p-5 rounded-full'>
  <img
    src='/assets/logo_senepa.png' // Ruta relativa al archivo en la carpeta public
    alt='Logo'
    className='w-30 h-30' // Ajusta el tamaño del logo según sea necesario
  />
   </div>
        <span className='text-2xl font-bold text-red-600'>Administrador de tareas</span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-5 py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div className=''>
        <button className='w-full flex gap-2 p-2 items-center text-lg text-gray-800'>
          <MdSettings />
          <span>Configuraciones</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
