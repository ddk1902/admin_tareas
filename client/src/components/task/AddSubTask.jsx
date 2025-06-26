import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const AddSubTask = ({ open, setOpen, id }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [addSbTask] = useCreateSubTaskMutation();

  const handleOnSubmit = async (data) => {
     try {
      const res = await addSbTask({ data, id }).unwrap();
      toast.success(res.message);
     setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
       console.log(err);
       toast.error(err?.data?.message || err.error);
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
            Agregar sub-tarea
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder=''
              type='text'
              name='title'
              label='Título'
              className='w-full rounded'
              register={register("title", {
                required: "Campo obligatorio!",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <div className='flex items-center gap-4'>
              <Textbox
                placeholder=''
                type='date'
                name='date'
                label='Fecha'
                className='w-full rounded'
                register={register("date", {
                  required: "Campo requerido!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              <Textbox
                placeholder=''
                type='text'
                name='tag'
                label='Etiqueta'
                className='w-full rounded'
                register={register("tag", {
                  required: "Campo requerido!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              />
            </div>
          </div>
          <div className='py-3 mt-4 flex sm:flex-row-reverse gap-4'>
            <Button
              type='submit'
              className='bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto'
              label='Agregar la sub-tarea'
            />

            <Button
              type='button'
              className='bg-gray-300 border text-sm font-semibold text-gray-900 hover:bg-yellow-300 sm:w-auto'
              onClick={() => setOpen(false)}
              label='Cancelar'
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddSubTask;
