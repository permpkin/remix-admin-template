import type { PropsWithChildren } from "react"
import { classNames } from "~/utils"

export const FieldLabel = (props:PropsWithChildren & any) => {
  return (
    <label {...props} className={
      classNames(
        "block text-sm font-medium text-gray-700",
        props.className || ""
      )
    }>{props.children}</label>
  )
}