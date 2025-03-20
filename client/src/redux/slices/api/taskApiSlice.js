import { apiSlice } from '../apiSlice';
//import { createJWT} from '../../../utils/index'; // Función para obtener el token JWT

const TASKS_URL = '/task';

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/dashboard`,
        method: 'GET',
        credentials: 'include', // Incluye cookies si es necesario
      }),
    }),
  }),
});

// Middleware para agregar el token JWT a las cabeceras
apiSlice.enhanceEndpoints({
  addTagTypes: ['Tasks'],
  endpoints: {
    getDashboardStats: {
      query: (data) => ({
        url: `${TASKS_URL}/dashboard`,
        method: 'GET',
        credentials: 'include',
      }),
    },
  },
});

// Agregar el token JWT a las cabeceras de todas las solicitudes
apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/dashboard`,
        method: 'GET',
        credentials: 'include',
      }),
    }),
  }),
});

// Exportar el hook generado
export const { useGetDashboardStatsQuery } = taskApiSlice;