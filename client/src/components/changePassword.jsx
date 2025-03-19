import {Dialog, DialogTitle} from '@headlessui/react';
import React from 'react';
import {useForm} from 'react-hook-form';
import Button from './Button';
import Loading from './Loader';
import ModalWrapper from './ModalWrapper';
import {useChangePasswordMutation} from '../redux/slices/api/userApiSlice';
import Textbox from './textbox';
import {toast}  from 'sonner';
import { use } from 'react';


const ChangePassword= ({open, setOpen})=>{
    const {
      register,
      handleSubmit,
      formState: {errors},
    }= useForm();
    const [ChangePassword,{isLoading}]=useChangePasswordMutation();

    const handleOnSubmit= async (data)=>{
        if (data.password !== data.cpass){
            toast.warning('Las contraseñas no coinciden');
            return;
        }
        try{
            const res= await ChangePassword(data).unwrap();
            toast.success('Contraseña cambiada exitosamente');
            setTimeout(()=>{
                setOpen(false);
            }, 1500);
        }catch(err){
            toast.error('Error al cambiar la contraseña');
        }
    }
return (
    <>
    <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)}className=''>
            <Dialog.Title
            as='h2'
            className='taxt-base font-bold leading-6 text-gray-900 mb-4'
            >
                Cambiar contraseña
            </Dialog.Title>
            <div className='mt-2 flex flex-col gap-6'>
                <Textbox
                type='password'
                label='Nueva Contraseña'
                placeholder=''
                className='w-full rounded'
                register={register('password', 
                    {required: 'Este campo es obligatorio',
                    minLength: {value: 6, message: 'La contraseña debe tener al menos 6 caracteres'}})}
                error={errors.password ? errors.password.message : ''}
                />
                <Textbox
                type='password'
                label='Confirmar contraseña'
                placeholder=''
                className='w-full rounded'
                register={register('cpass',
                     {required: 'Este campo es obligatorio',

                    })} 
                error={errors.cpass ? errors.cpass.message : ''}
                />
            </div>  

            {isLoading ? (
                <div className='py-5'>
                <Loading />
                </div>
            ):(
                <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
                    <Button type='submit'
                    className='bg-red-700 px-8 text-sm font-semibold text-white hover:bg-green-600'
                    label='Cambiar contraseña'
                    />
                    <Button 
                    type='button'
                    className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                    onClick={()=>setOpen(false)}>
                        Cancelar
                    </Button>
                </div>
            )}
            </form>
    </ModalWrapper>
    </>
);
    };

export default ChangePassword
