import type { Group, Tag, User } from "@prisma/client";
import { Params } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "~/utils/database";
import { ErrorResponse } from "~/utils/responders";
import { UserWithIncludes } from "./user";

export const include = {
  tags: true,
  users: true,
  activity: true
}

export interface GroupWithIncludes extends Group {
  tags?: Tag[]
  users?: any
  activity?: any
}

export const getAllGroups = async (user?: UserWithIncludes) => {
  return prisma.group.findMany({
    ...(user?.type !== "Admin" ?
    {
      where: {
        id: {
          equals: `${user?.groupId}`
        }
      }
    } : {}),
    include
  })
}

export const checkIfGroupExists = async (data: Group | any) => {
  const count = await prisma.group.count({
    where: data
  });
  return (count > 0)
}

// create new group
export const createGroup = async (data: GroupWithIncludes) => {

  const { tags } = data

  return prisma.group.create({
    data: {
      ...data,
      ...{
        tags: tags && tags.length > 0 ? {
          connectOrCreate: (typeof tags === "string" ? (tags as string).split(',') : tags).map((tag: string) => {
            return {
              where: {
                name: tag
              },
              create: {
                name: tag
              }
            }
          })
        } : undefined
      }
    },
    include
  })
}

// get group using id
export const getGroup = async (groupId: Group["id"]) => {
  return prisma.group.findUnique({ where: { id: groupId } });
}

export const getGroupsWhere = async (filter: any = {}) => {
  return prisma.group.findMany({
    where: {
      ...filter,
    },
    include
  })
}

// udpate existing group
export const updateGroup = async (groupId: Group["id"], data: { [key: string]: any }) => {

  const { tags } = data

  return prisma.group.update({
    where: {
      id: groupId
    },
    data: {
      ...data,
      ...{
        tags: tags.length > 0 ? {
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
        } : undefined
      }
    }
  });
  
}

export const addTagToGroup = async (groupId: Group["id"], tags: string | string[]) => {
  return prisma.group.update({
    where: {
      id: groupId
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

export const removeTagFromGroup = async (groupId: Group["id"], tag: string) => {
  return prisma.group.update({
    where: {
      id: groupId
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

export const deleteGroup = async (groupId: Group["id"]) => {
  return prisma.group.delete({
    where: {
      id: groupId
    }
  });
}

export async function requireGroup(params: Params<string>, user?: User) {
  
  // grab group.
  const group = await prisma.group.findUnique({
    where: {
      id: params.groupId
    },
    include: GroupIncludes
  })

  // check if group exists user can access group.
  if (!group) {
    return ErrorResponse(404, {group: 'Group not found'})
  }

  // check if group exists user can access group.
  if (user && user.type !== "Admin" && user.groupId !== group.id) {
    return ErrorResponse(401)
  }
  
  return group;

}

export const GroupResponseJson = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: ["string", "null"] },
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
    },
    activity: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          description: { type: "string" },
          createdAt: { type: "string" }
        }
      }
    },
    users: {
      type: "array",
      items: {
        type: "object",
        properties: {
          display: { type: "string" },
          email: { type: "string" },
          type: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    apps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string" },
          repo: { type: "string" }
        }
      }
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" }
  }
}

export const CommonGroupResponse = {
  type: "object",
  properties: {
    code: { type: "number" },
    message: { type: "string" },
    group: GroupResponseJson
  }
}

export const GroupIncludes = {
  tags: true,
  users: true
}

export const GroupCreateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    tags: { type: 'string' },
  }
} as const

export const GroupUpdateSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title'],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    tags: { type: 'string' },
  }
} as const