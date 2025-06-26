import { apiSlice } from '../apiSlice';
//import { createJWT} from '../../../utils/index'; // Función para obtener el token JWT

const TASKS_URL = '/task';

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
  getDashboardStats: builder.query({
      query: () => ({
        url: `${TASKS_URL}/dashboard`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Tasks"],
    }),
    getAllTask: builder.query({
        query: ({strQuery,isTrashed,search}) => ({
          url: `${TASKS_URL}?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
          method: 'GET',
          credentials: 'include', // Incluye cookies si es necesario
        }),
        providesTags: ['Tasks'],
      }),

      createTask: builder.mutation({
        query: (data) => ({
          url: `${TASKS_URL}/create`,
          method: 'POST',
          body: data,
          credentials: 'include',
        }),
        invalidatesTags: ['Tasks'],
      }),
    trashTask: builder.mutation({
  query: ({ id, actionType = 'delete' }) => ({
    url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`,
    method: 'DELETE',
    credentials: 'include',
  }),
  invalidatesTags: ['Tasks'],
      }),
      restoreTask: builder.mutation({
        query: (id) => ({
          url: `${TASKS_URL}/restore/${id}`,
          method: 'PUT',
          credentials: 'include',
        }),
        invalidatesTags: ['Tasks'],
      }),
      duplicateTask: builder.mutation({
        query: (id) => ({
          url: `${TASKS_URL}/duplicate/${id}`,
          method: 'POST',
          body: {},
          credentials: 'include',
        }),
        invalidatesTags: ['Tasks'],
      }),
      updateTask: builder.mutation({
        query: (data) => ({
          url: `${TASKS_URL}/update/${data._id}`,
          method: 'PUT',
          body: data,
          credentials: 'include',
        }),
        invalidatesTags: ['Tasks'],
      }),

      getTaskById: builder.query({
      query: (_id) => ({
        url: `${TASKS_URL}/${_id}`, // Ejemplo: /task/65f34e7d90d5f821c0844a6b
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Task"], // Si usas tags específicos
    }),
    createSubTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `${TASKS_URL}/create-subtask/${id}`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Tasks'],
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
  useTrashTaskMutation,
  useRestoreTaskMutation,
  useUpdateTaskMutation,
  useGetTaskByIdQuery, useCreateSubTaskMutation
} = taskApiSlice;