export const formatDate = (date) => {
  // Get the month, day, and year
  const month = date.toLocaleString("es-ES", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export function dateFormatter(dateString) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate)) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

/* export function getInitials(name) {
  if (!name) return ""; // Manejo de caso undefined o null
  const names = names.split(" ");//

  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());

  const initialsStr = initials.join("");

  return initialsStr;
} */
  export function getInitials(name) {
    if (!name) return "";  // Manejo seguro si name es undefined o vacío
    
    const names = name.split(" ");  // Ahora no habrá error en la línea 29
    return names.map(word => word[0]?.toUpperCase()).join("");
}
export const PRIOTITYSTYELS = {
  alta: "text-red-600",
  media: "text-yellow-600",
  baja: "text-blue-600",
};

export const TASK_TYPE = {
  pendiente: "bg-blue-600",
  "en progreso": "bg-yellow-600",
  completada: "bg-green-600",
};

export const BGS = [
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-green-600",
];
