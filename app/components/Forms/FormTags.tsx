import { ErrorMessage, Field, useFormikContext } from "formik"
import { useState } from "react"
import { classNames } from "~/utils"
import { FieldLabel } from "./FieldLabel"

interface Props {
  label?: string
  description?: string
  placeholder?: string
}

export const FormTags = ({ label, description, placeholder }:Props) => {
  
  const { errors, values, handleChange, isSubmitting, setFieldValue } = useFormikContext();

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const removeTag = (index: number) => {
    const tagarray = [...(values!["tags" as keyof typeof values] as string[])]
    tagarray.splice(index, 1)
    setFieldValue("tags", tagarray)
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <FieldLabel>{label}</FieldLabel>
        {
          !editing && <button className="hover:underline text-sm" onClick={() => setEditing(true)}>Add Tag</button>
        }
      </div>
      {
        editing &&
        <input
          type="text"
          className={classNames(
            "block flex-shrink-0 mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs",
            ("tags" in errors ? "border-red-500 dark:border-red-500" : "")
          )}
          placeholder={placeholder}
          disabled={isSubmitting}
          onKeyDown={(e) => {
            switch(e.key) {
              case 'Tab':
              case 'Enter':
              case ',':
                e.preventDefault()
                // append tag to value array
                setFieldValue("tags", [
                  ...(values!["tags" as keyof typeof values] as string[]),
                  value
                ])
                // reset value
                setValue('')
                setEditing(false)
              break;
            }
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      }
      <ul className="flex flex-wrap w-full">
        {
          (values!["tags" as keyof typeof values] as string[]).map((tag, index) =>
            <span
            key={`field-tags-${index}`}
            onClick={() => removeTag(index)}
            className={classNames(
              "mt-2 mr-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5",
              "border border-gray-300 bg-gray-100 text-gray-800"
            )}>
              {tag}
            </span>
          )
        }
      </ul>
      <Field
        id="tags"
        name="tags"
        type="hidden"
        onChange={handleChange}
        values={values!["tags" as keyof typeof values]}
      />
      <ErrorMessage name="tags"/>
      {
        description && (
          <small>{description}</small>
        )
      }
    </div>
  )
}