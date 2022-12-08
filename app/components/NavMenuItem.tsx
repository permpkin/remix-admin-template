import { Link, useLocation } from '@remix-run/react'
import { classNames } from '~/utils'
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';

interface NavMenuItemProps {
  name: string
  href: string
  items?: NavMenuItemProps[]
  ltr?: boolean
}

export const NavMenuItem = ({ name, href, items, ltr = true }:NavMenuItemProps) => {

  const { pathname } = useLocation()
  const [current, setCurrent] = useState(pathname === href)

  useEffect(() => {
    if (pathname === href) {
      if (!current) {
        setCurrent(true)
      }
    } else {
      if (items) {
        setCurrent(false)
        items.map((child: any) => {
          if (pathname.startsWith(`${href}${child.href}`)) {
            setCurrent(true)
          }
        })
      } else {
        setCurrent(false)
      }
    }
  }, [pathname])

  if (!items) {
    return (
      <Link
        className={classNames(
          current
            ? 'text-indigo-100 bg-indigo-600 cursor-default'
            : 'bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-700 cursor-pointer border-1 border-red-500',
          'flex my-4 rounded-lg items-center px-3 py-2 text-xs font-bold'
        )}
        to={href}
      >
        {name}
      </Link>
    )
  }

  return (
    // <>
    //   <div className="flex justify-between items-center group">
    //     <Link className={classNames(
    //       'flex items-center hover:underline',
    //       current ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'
    //     )} to={href}>
    //       {name}
    //     </Link>
    //     {
    //       items && (
    //         <div onClick={() => setExpanded(!expanded)} className='cursor-pointer'>
    //           {
    //             expanded ? (
    //               <ChevronDownIcon width={14} height={14}/>
    //             ) : (
    //               <ChevronRightIcon width={14} height={14}/>
    //             )
    //           }
    //         </div>
    //       )
    //     }
    //   </div>
    //   {
    //     items && expanded && (
    //       <div className='pl-4'>
    //         {
    //           items?.map((child, index) => (
    //             <NavMenuItem key={`${href}${child.href}-${index}`} {...child} href={`${href}${child.href}`}/>
    //           ))
    //         }
    //       </div>
    //     )
    //   }
    // </>
    // {/* Profile dropdown */}
    <Menu as="div" className="relative flex items-center h-full">
      <Menu.Button
        className={classNames(
          current
            ? 'text-indigo-100 bg-indigo-600'
            : 'bg-gray-50 hover:bg-gray-200 text-gray-500 hover:text-gray-700',
          'flex my-2 rounded-lg items-center px-3 py-2 text-xs font-bold cursor-pointer'
        )}
      >
        <span className="sr-only">Open {name} menu</span>
        {name}
        <ChevronDownIcon className='ml-2 w-4'/>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={classNames(
          "absolute top-full z-10 w-48 rounded-lg -mt-2 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
          ltr ? "left-0 origin-top-left" : "right-0 origin-top-right"
        )}>
          {items.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <Link
                  to={item.href}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'flex my-2 items-center px-3 py-1 text-xs text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}