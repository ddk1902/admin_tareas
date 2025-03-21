import clsx from "clsx";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null); // Estado para almacenar los datos de la tarea
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error
  
  // Obtener los datos de la tarea desde la BD
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/tasks/${id}`); // Ruta del backend

        // Verifica si la respuesta es exitosa
        if (!response.ok) {
          const errorText = await response.text(); // Intenta obtener detalles del error
          throw new Error(errorText || "Error al cargar la tarea");
        }

        // Verifica si la respuesta es JSON
        if (response.headers.get("content-type")?.includes("application/json")) {
          const data = await response.json();
          setTask(data); // Guarda los datos de la tarea
        } else {
          throw new Error("Respuesta del servidor no es JSON");
        }
      } catch (err) {
        setError(err.message || "Error desconocido al cargar la tarea");
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchTask();
  }, [id]);

  // Manejar estados de carga y error
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!task) {
    return <p className="text-gray-600">Tarea no encontrada.</p>;
  }

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1>
      {/* Resto del código del componente */}
    </div>
  );
};

export default TaskDetails;