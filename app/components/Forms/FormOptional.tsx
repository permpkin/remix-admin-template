import { ReactNode, useState } from "react";

interface Props {
  children: ReactNode
}

export const FormOptional = ({ children }:Props) => {
  
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col mt-4">
      <div className="hover:underline text-xs cursor-pointer" onClick={() => setShow(!show)}>
        <span>{show ? 'Hide' : 'Show'} Optional Fields</span>
      </div>
      {
        show && (
          <div className="mt-4">
            {children}
          </div>
        )
      }
    </div>
  )
}