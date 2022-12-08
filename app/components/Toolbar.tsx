import { PropsWithChildren } from "react"
import { classNames } from "~/utils"

export const Toolbar = (props:PropsWithChildren & { className?: string }) => {
  return (
    <div className={classNames(
      "w-full shrink-0 py-4 flex flex-row",
      props.className || ""
    )} aria-label="Toolbar">
      {props.children}
    </div>
  )
}