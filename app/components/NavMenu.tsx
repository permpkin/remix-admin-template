import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { User } from '@prisma/client';
import { Fragment } from 'react';
import { classNames } from '~/utils';
import { Container } from './Container';
import { NavMenuItem } from './NavMenuItem';

interface NavMenuProps {
  user: User
  navigation: NavMenuItem[]
}

interface NavMenuItem {
  name: string
  href: string
  items?: NavMenuItem[]
}

export const NavMenu = ({ user, navigation }:NavMenuProps) => {

  return (
    // <div className='flex w-48 shrink-0 flex-col'>
    //   <nav className="flex-1 p-4 space-y-2 text-sm border-r border-gray-200 dark:border-gray-700" aria-label="Sidebar">
    //     {
    //       navigation.map((item, index) => <NavMenuItem key={`${item.href}/${index}`} {...item}/>)
    //     }
    //   </nav>
    // </div>
    <Disclosure as="nav" className="bg-gray-100 border-gray-200 border-b">
      {({ open }) => (
        <>
          <Container>
            <div className="w-full flex justify-between">
              <div className="flex">
                <div className="hidden sm:flex sm:space-x-2 items-center">
                  <NavMenuItem key="dashboard-menu" name="Dashboard" href='/'/>
                  {
                    navigation.map((item, index) => (
                      <NavMenuItem key={`${item.href}/${index}`} {...item}/>
                    ))
                  }
                </div>
              </div>

              <div className="flex">
                <div className="hidden sm:flex sm:space-x-4">
                  <NavMenuItem key="user-menu" name={`${user.display}`} href='#' ltr={false} items={[
                    { href: `/users/${user.id}`, name: "Edit Profile" },
                    { href: "/logout", name: "Logout" }
                  ]}/>
                </div>
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>

            </div>
          </Container>
        </>
      )}
    </Disclosure>
  )
  
}