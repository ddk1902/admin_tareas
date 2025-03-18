import React from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { toast } from "sonner";
const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  const isUpdating=false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [AddNewUser, {isLoading}]=useRegisterMutation();

  const handleOnSubmit = async (data) => {
    try {
      if(userData){
      }else{
        const result= await AddNewUser({...data,password:data.email}).unwrap();
        toast.success("Usuario agregado exitosamente");
      }
      setTimeout(() => {
        setOpen(false);
      },2000);
    } catch (error) {
      toast.error("Ocurrió un error al agregar usuario");
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {userData ? "Actualizar perfil" : "Agregar un nuevo usuario"}
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder=''
              type='text'
              name='name'
              label='Nombre completo'
              className='w-full rounded'
              register={register("name", {
                required: "Campo obligatorio.!",
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder=''
              type='text'
              name='title'
              label='Título'
              className='w-full rounded'
              register={register("title", {
                required: "Campo obligatorio.!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder=''
              type='email'
              name='email'
              label='Email'
              className='w-full rounded'
              register={register("email", {
                required: "Campo obligatorio.!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <Textbox
              placeholder=''
              type='text'
              name='role'
              label='Rol'
              className='w-full rounded'
              register={register("role", {
                required: "Campo obligatorio.!",
              })}
              error={errors.role ? errors.role.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-red-600 px-8 text-sm font-semibold text-white hover:bg-green-700  sm:w-auto'
                label='Guardar'
              />

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Cancelar'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
