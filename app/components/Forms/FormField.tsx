import { ErrorMessage, Field, useFormikContext } from "formik"
import { ReactEventHandler } from "react"
import { classNames } from "~/utils"
import { FieldLabel } from "./FieldLabel"

interface Props {
  name: string
  label?: string
  type?: 'text' | 'password' | 'hidden'
  description?: string
  placeholder?: string
  onChange?: Function
}

export const FormField = ({ name, label, type = 'text', description, placeholder, onChange }:Props) => {
  
  const { values, errors, handleBlur, handleChange, isSubmitting } = useFormikContext();

  return (
    <div className="flex flex-col flex-1">
      {
        type !== 'hidden' && label && (
          <FieldLabel htmlFor={name}>
            {label}
          </FieldLabel>
        )
      }
      <Field
        id={name}
        name={name}
        type={type}
        className={classNames(
          "block flex-shrink-0 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs",
          (name in errors ? "border-red-500 dark:border-red-500" : "")
        )}
        disabled={isSubmitting}
        onBlur={handleBlur}
        onChange={(e: ReactEventHandler<HTMLInputElement>) => {
          handleChange(e)
          if (onChange) {
            onChange(e)
          }
        }}
        placeholder={placeholder || name.toUpperCase()}
        value={values![name as keyof typeof values]}
      />
      <ErrorMessage render={msg => <div className="text-xs text-red-500">{msg}</div>} name={name}/>
      {
        description && (
          <small>{description}</small>
        )
      }
    </div>
  )
}