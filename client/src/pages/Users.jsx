import React, { useState } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { summary } from "../assets/data";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import { useDeleteUserMutation, useGetTeamListQuery, useUserActionMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);

  const {data,isloading,refetch}=useGetTeamListQuery();
  const [deleteUser]=useDeleteUserMutation();
  const [userAction]=useUserActionMutation();


  const userActionHandler = async () => {
    try {
      const result=await userAction({
        isActive:!selected.isActive,
        id:selected?._id
      });
     
     toast.success(result?.data?.message || "Usuario actualizado correctamente");
     window.location.reload();
     setSelected(null);
     setTimeout(() => {
      setOpenAction(false);
     }, 1500);
     window.location.reload();
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "An error occurredAlgo salió mal..por favor verifique");
    }
  };



  const deleteHandler = async () => {
    try {
      const result=await deleteUser(selected)
     
      
      refetch();
      toast.success( "Usuario eliminado correctamente");  
     setSelected(null);

     setTimeout(() => {
      setOpenAction(false);
     }, 1500);
     window.location.reload();
    } catch (error) {
      console.log(err);
      toast.error(err?.data?.message || "Algo salió mal..por favor verifique");
      
    }
  };

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };
  const userStatusClick = (el) => {
    setSelected(el);
    setOpenAction(true);
  }
  const TableHeader = () => (
    <thead className='border-b border-gray-300'>
      <tr className='text-black text-center'>
        <th className='py-2'>Nombre</th>
        <th className='py-2'>Título</th>
        <th className='py-2'>Email</th>
        <th className='py-2'>Rol</th>
        <th className='py-2'>Estado</th>
        <th className='py-2'>Opciones</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='p-2'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-red-700'>
            <span className='text-xs md:text-sm text-center'>
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>

      <td className='p-2'>{user.title}</td>
      <td className='p-2'>{user.email || "user.emal.com"}</td>
      <td className='p-2'>{user.role}</td>

      <td>
        <button
          onClick={() => userStatusClick(user)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-green-200" : "bg-red-100"
          )}
        >
          {user?.isActive ? "Activo" : "Inactivo"}
        </button>
      </td>

      <td className='p-2 flex gap-4 justify-end'>
        <Button
          className='bg-red-200 text-white-600 hover:text-red-500 font-semibold sm:px-4 rounded-lg'
          label='Editar'
          type='button'
          onClick={() => editClick(user)}
        />

      {/*   <Button
          className='text-red-700 hover:text-yellow-500 font-semibold sm:px-0'
          label='Eliminar'
          type='button'
          onClick={() => deleteClick(user?._id)}
        /> */}
      </td>
    </tr>
  );

  return (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title=' Miembros del equipo' />
          <Button
            label='Agregar un nuevo usuario'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-green-600 text-white rounded-md 2xl:py-2.5'
            onClick={() => setOpen(true)}
          />
        </div>

        <div className='bg-white px-2 md:px-4 py-4 shadow-md rounded'>
          <div className='overflow-x-auto'>
            <table className='w-full mb-5'>
              <TableHeader />
              <tbody>
                {data?.map((user, index) => (
                  <TableRow key={index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        key={new Date().getTime().toString()}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;