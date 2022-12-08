import { User } from "@prisma/client"

interface NavMenuItem {
  name: string
  href: string
  items?: NavMenuItem[]
}

/**
 * Construct navigation array for admin area use.
 * @param user
 * @returns navigation array used in admin panel
 */
export const getSystemNav = async (user: User) => {

  const navigation = [
    
    // { name: 'Users', href: '/users', items: [
    //   { name: 'All Users', href: '/users' },
    //   // require admin role to view user groups.
    //   user.type === 'Admin' && { name: 'Groups', href: '/groups' },
    // ] },
    { name: 'Users', href: '/users' },
    user.type === 'Admin' && { name: 'Groups', href: '/groups' },

  ]
  .filter((item) => Boolean(item))
  .map((item: NavMenuItem | false) => {
    if (item && "items" in item) {
      item.items = item.items!.filter((child) => Boolean(child))
    }
    return item
  })

  return navigation

}