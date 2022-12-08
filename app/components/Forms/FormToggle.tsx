import { ErrorMessage, useFormikContext } from "formik"
import { classNames } from "~/utils"
import { FieldLabel } from "./FieldLabel"

interface Props {
  name: string
  label?: string
  description?: string
  placeholder?: string
}

export const FormToggle = ({ name, label, description, placeholder }:Props) => {
  
  const { values, handleBlur, handleChange, isSubmitting } = useFormikContext();

  return (
    <div className="flex items-center group">
      <input
        id={name}
        name={name}
        type="checkbox"
        disabled={isSubmitting}
        onBlur={handleBlur}
        onChange={handleChange}
        className={classNames(
          "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group-hover:cursor-pointer"
        )}
        placeholder={placeholder || name.toUpperCase()}
        value={values![name as keyof typeof values]}
      />
      {
        label && label !== "" && (
          <FieldLabel htmlFor={name} className="ml-2 group-hover:underline group-hover:cursor-pointer">
            {label}
          </FieldLabel>
        )
      }
      <ErrorMessage name={name}/>
      {
        description && (
          <small className="ml-2">{description}</small>
        )
      }
    </div>
  )
}