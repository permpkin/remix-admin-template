import type { Group, Tag, User } from "@prisma/client";
import { prisma } from "~/utils/database";

import bcrypt from "bcryptjs";
import { Params } from "@remix-run/react";
import { ErrorResponse } from "~/utils/responders";

export interface UserWithIncludes extends User {
  tags?: Tag[]
  activity?: any
  group?: any
}

export const include = {
  tags: true,
  activity: true,
  group: true
}

export async function requireUser(params: Params<string>) {
  
  // grab user.
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId
    },
    include: UserIncludes
  })

  // check if user exists user can access user.
  if (!user) {
    return ErrorResponse(404)
  }
  
  return user as UserWithIncludes;

}

export const getAllUsers = async (user?: UserWithIncludes) => {
  return prisma.user.findMany({
    ...(user?.type !== "Admin" ?
    {
      where: {
        groupId: {
          equals: `${user?.groupId}`
        }
      }
    } : {}),
    include
  })
}

export const getUsersWhere = async (user: UserWithIncludes, filter: any = {}) => {
  return prisma.user.findMany({
    ...(user.type !== "Admin" ?
    {
      // if not admin, only show
      // users from same user group.
      where: {
        ...filter,
        groupId: {
          equals: `${user.groupId}`
        },
      }
    } : {
      where: {
        ...filter,
      }
    }),
    include
  })
}

export const checkIfUserExists = async (data: User | any) => {
  const { _count } = await prisma.user.aggregate({
    where: data,
    _count: true
  });
  return (_count > 0)
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: {
      id
    },
    include: {
      group: true
    }
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string, type: string = "Standard", status: string = "Pending") {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      type,
      status
    },
  });
}

export async function createUserWithData(data: any) {

  const { group, tags } = data

  if (group) {

    const $group = await prisma.group.findUnique({
      where: {
        id: group
      }
    })

    // check if the group exists
    if (!$group) {
      throw ErrorResponse(404, {group:'Group not found'})
    }

  }

  // default display field to email if not set.
  if (!data.display || data.display == "") {
    data.display = data.email
  }
  
  const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      ...(tags ? {
        tags: {
          connectOrCreate: (typeof tags === "string" ? tags.split(',') : tags).map((tag: string) => {
            return {
              where: {
                name: tag
              },
              create: {
                name: tag
              }
            }
          })
        }
      } : {
        tags: undefined
      }),
      ...(group ? {
        group: {
          connect: {
            id: group
          }
        }
      } : {
        group: undefined
      }),
    }
  });

}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export const deleteUser = async (userId: User["id"]) => {
  return prisma.user.delete({
    where: {
      id: userId
    }
  });
}

// udpate existing app
export const updateUser = async (userId: User["id"], data: { [key: string]: any }) => {

  const { group, tags } = data

  if (group && group !== "null") {

    const $group = await prisma.group.findUnique({
      where: {
        id: group
      }
    })

    // check if the group exists
    if (!$group) {
      throw ErrorResponse(404, {group:'Group not found'})
    }

  }
  
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      ...data,
      ...(tags ? {
        tags: {
          connectOrCreate: (typeof tags === "string" ? tags.split(',') : tags).map((tag: string) => {
            return {
              where: {
                name: tag
              },
              create: {
                name: tag
              }
            }
          })
        }
      } : {}),
      ...(group && group !== "null" ? {
        group: {
          connect: {
            id: group
          }
        }
      } : {
        group: undefined
      }),
    }
  });
}

// add app to group ( replaces existing )
export const addUserToGroup = async (userId: User["id"], groupId: Group["id"]) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      group: {
        connect: {
          id: groupId
        }
      }
    },
    include
  });
}

// remove app from current group
export const removeUserFromGroup = async (userId: User["id"]) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })
  if (user && user.groupId === null) {
    return ErrorResponse(406, {user:'User Not In Group'})
  }
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      group: {
        disconnect: true
      }
    },
    include
  });
}

export const addTagToUser = async (userId: User["id"], tags: string | string[]) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      tags: {
        connectOrCreate: (
          // if tags is a string, assume it's comma seperated
          // values ( or a single value ), then iterate.
          typeof tags === "string" ? tags.split(',') : tags
        ).map((tag) => {
          return {
            where: {
              name: tag
            },
            create: {
              name: tag
            }
          }
        })
      }
    },
    include
  });
}

export const removeTagFromUser = async (userId: User["id"], tag: string) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      tags: {
        disconnect: {
          name: tag
        }
      }
    },
    include
  })
}

export async function verifyLogin(
  email: User["email"],
  password: User["password"]
) {

  const userWithPassword = await prisma.user.findUnique({
    where: { email }
  });

  if (!userWithPassword || !password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    `${userWithPassword.password}`
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
  
}

export const UserResponseJson = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string" },
    display: { type: "string" },
    status: { type: "string" },
    tags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" }
        }
      }
    }
  }
}

export const CommonUserResponse = {
  type: "object",
  properties: {
    code: { type: "string" },
    message: { type: "string" },
    user: UserResponseJson
  }
}

export const UserIncludes = {
  tags: true,
  activity: true,
  group: true
}

export const FailResponse = {
  type: 'object',
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    message: { type: 'string' }
  }
}

export const UserCreateSchema = {
  description: 'user create schema',
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    email: { type: 'string', format: "email" },
    display: { description: "Name of the person", type: 'string' },
    type: { type: 'string', enum: ["Admin","Client"] },
    password: { type: 'string' },
    tags: { type: 'string' },
    group: { type: 'string' }
  }
} as const

export const UserUpdateSchema = {
  description: 'user update schema',
  type: 'object',
  additionalProperties: false,
  properties: {
    email: { type: 'string' },
    display: { type: 'string' },
    password: { type: 'string' },
    tags: { type: 'string' },
    group: { type: 'string' }
  }
} as const