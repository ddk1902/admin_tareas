import React, { useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";

const TABS = [
  { title: "Mosaico", icon: <MdGridView /> },
  { title: "Lista", icon: <FaList /> },
];

const TASK_TYPE = {
  pendiente: "bg-blue-600",
  "en progreso": "bg-yellow-600",
  completada: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  //const [loading,setLoading]=useState(false)
  const status = params?.status || ""; // Estado de la tarea desde la URL

  const { data, isLoading } = useGetAllTaskQuery({
    strQuery: status, // Estado de la tarea
    isTrashed: "",
    search: "",
   
  });

  // Depuración: Registrar los datos recibidos
  //console.log("Datos recibidos desde el backend:", data);

  return isLoading ? (
    <div className='py-10'>
        <Loading />
      </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `Lista ${status} ` : "Todas las tareas"} />

        {!status && (
          <Button
            onClick={() => setOpen(true)}
            label='Crear tarea'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
            <TaskTitle label='Pendientes' className={TASK_TYPE.pendiente} />
            <TaskTitle
              label='En progreso'
              className={TASK_TYPE["en progreso"]}
            />
            <TaskTitle label='Completadas' className={TASK_TYPE.completada} />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView tasks={data?.tasks} />
        ) : (
          <div className='w-full'>
            <Table tasks={data?.tasks} />
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;