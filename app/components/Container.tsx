import { PropsWithChildren } from "react"
import { classNames } from "~/utils"

export const Container = (props:PropsWithChildren & { className?: string }) => {
  return (
    <div className={classNames(
      "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
      props.className || ""
    )}>
      {props.children}
    </div>
  )
}