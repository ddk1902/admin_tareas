import { Dialog, DialogTitle } from '@headlessui/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import Button from './Button';
import Loading from './Loader';
import ModalWrapper from './ModalWrapper';
import { useChangePasswordMutation } from '../redux/slices/api/userApiSlice';
import Textbox from './Textbox';
import { toast } from 'sonner';

const ChangePassword = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  // Manejador de envío del formulario
  const handleOnSubmit = async (data) => {
      // Registrar los datos enviados desde el formulario
  console.log("Datos enviados desde el formulario:", data);

  // Validar que las contraseñas coincidan
  if (data.password !== data.cpass) {
    toast.warning('Las contraseñas no coinciden');
    return;
  }

  // Validar que la nueva contraseña no sea igual a la contraseña actual
  if (data.oldPassword === data.password) {
    toast.warning('La nueva contraseña no puede ser igual a la contraseña actual');
    return;
  }

  try {
    // Enviar los datos al backend
    const response = await changePassword({
      oldPassword: data.oldPassword, // Contraseña anterior
      newPassword: data.password,   // Nueva contraseña
    }).unwrap();

    // Mostrar mensaje de éxito
    toast.success(response?.message || 'Contraseña cambiada exitosamente');

    // Cerrar el modal después de 1.5 segundos
    setTimeout(() => {
      setOpen(false);
    }, 1500);
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);

    // Mostrar mensaje de error basado en la respuesta del backend
    toast.error(error?.data?.message || 'Ocurrió un error al cambiar la contraseña');
  }
};

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          {/* Título del modal */}
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            Cambiar contraseña
          </Dialog.Title>

          {/* Campos del formulario */}
          <div className='mt-2 flex flex-col gap-6'>
            {/* Campo para la contraseña actual */}
            <Textbox
              type='password'
              label='Contraseña actual'
              placeholder=''
              className='w-full rounded'
              register={register('oldPassword', {
                required: 'Este campo es obligatorio',
              })}
              error={errors.oldPassword ? errors.oldPassword.message : ''}
            />

            {/* Campo para la nueva contraseña */}
            <Textbox
              type='password'
              label='Nueva contraseña'
              placeholder=''
              className='w-full rounded'
              register={register('password', {
                required: 'Este campo es obligatorio',
                minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              })}
              error={errors.password ? errors.password.message : ''}
            />

            {/* Campo para confirmar la nueva contraseña */}
            <Textbox
              type='password'
              label='Confirmar nueva contraseña'
              placeholder=''
              className='w-full rounded'
              register={register('cpass', {
                required: 'Este campo es obligatorio',
              })}
              error={errors.cpass ? errors.cpass.message : ''}
            />
          </div>

          {/* Botones de acción */}
          {isLoading ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse gap-2'>
              {/* Botón "Cambiar contraseña" */}
              <Button
                type='submit'
                className='bg-red-700 px-8 text-sm font-semibold text-white hover:bg-green-900'
                label='Cambiar contraseña'
              />

              {/* Botón "Cancelar" */}
              <Button
                type='button'
                className='bg-gray-500 px-5 text-sm font-semibold text-white hover:bg-yellow-600'
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

export default ChangePassword;