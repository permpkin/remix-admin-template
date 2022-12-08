import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid"
import { PropsWithChildren } from "react"
import { classNames } from "~/utils"

export const MenuButton = (props: PropsWithChildren & any) => {
  return (
    <button
      {...props}
      className={classNames(
        "flex flex-shrink-0 justify-center items-center rounded-md border py-1 px-4 text-xs focus:ring-indigo-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
        "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        props.className || ""
      )}
    >
      <EllipsisHorizontalIcon width={16} height={16}/>
    </button>
  )
}