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
    getAllTask: builder.query({
        query: ({strQuery,isTrashed,search}) => ({
          url: `${TASKS_URL}?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
          method: 'GET',
          credentials: 'include', // Incluye cookies si es necesario
        }),
      }),

      createTask: builder.mutation({
        query: (data) => ({
          url: `${TASKS_URL}/create`,
          method: 'POST',
          body: data,
          credentials: 'include',
        }),
      }),
      deleteTask: builder.mutation({
        query: (id) => ({
          url: `${TASKS_URL}/${id}`,
          method: 'DELETE',
          credentials: 'include',
        }),
      }),
      restoreTask: builder.mutation({
        query: (id) => ({
          url: `${TASKS_URL}/restore/${id}`,
          method: 'PUT',
          credentials: 'include',
        }),
      }),
      duplicateTask: builder.mutation({
        query: (id) => ({
          url: `${TASKS_URL}/duplicate/${id}`,
          method: 'POST',
          body: {},
          credentials: 'include',
        }),
      }),
      updateTask: builder.mutation({
        query: ({id, data}) => ({
          url: `${TASKS_URL}/update/${data._id}`,
          method: 'PUT',
          body: data,
          credentials: 'include',
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
export const { useGetDashboardStatsQuery,
  useGetAllTaskQuery,
  useCreateTaskMutation,
  useDuplicateTaskMutation,
  useDeleteTaskMutation,
  useRestoreTaskMutation,
  useUpdateTaskMutation
} = taskApiSlice;