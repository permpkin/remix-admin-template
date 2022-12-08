import { Fragment, ReactEventHandler, ReactNode, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from './Forms/Button'
import { FormSubmit } from './Forms/FormSubmit'

interface Props {
  button: (
    props: any
  ) => ReactNode
  children: (
    props: any
  ) => ReactNode
}

export default function Modal({ button, children }:Props) {

  const [openState, setOpenState] = useState(false)

  const open = () => setOpenState(true)
  const close = () => setOpenState(false)

  return (
    <>
      {button(open)}
      <Transition.Root show={openState} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={close}>

          {/** Background */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/** Dialog Panel */}
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white p-4 overflow-hidden rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full text-left">
                {
                  children(close)
                }
              </Dialog.Panel>
              </Transition.Child>
            </div>
            
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}