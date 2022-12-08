import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { checkIfGroupExists, createGroup, getAllGroups, GroupCreateSchema, GroupResponseJson, GroupWithIncludes, include } from "~/models/group";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, ParseRequestData, SuccessResponse } from "~/utils/responders";
import { FilterSchema, ParseSchema } from "~/utils/schema";

/**
 * [POST] /groups/
 * @description creates a new group
 * @returns Group
 */
 export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)

  if (request.method === 'POST') {

    // validate/parse inbound form body.
    const { data } = ParseSchema(GroupCreateSchema, await ParseRequestData(request))

    if (
      // check if group exists already with same name
      await checkIfGroupExists({
        title: data.title
      })
    ) {

      return ErrorResponse(409, {title:'Group already exists with that name/title'})
      
    }

    // create group
    const group = await createGroup(data as GroupWithIncludes)
  
    // return filtered response data
    return SuccessResponse({
      group: FilterSchema(GroupResponseJson, group)
    })

  } else {

    return ErrorResponse(405)

  }
  
}

/**
 * [GET] /groups/
 * @description retrieve all (accessible) groups
 * @returns Group[]
 */
export const loader: LoaderFunction = async ({ request }) => {

  // require admin access to run.
  const user = await requireAdminSession(request)

  // if we aren't an admin, return groups associated to the user group.
  const groups = await getAllGroups(user)
  
  // filter array of groups
  return SuccessResponse({
    groups: groups.map((group) => FilterSchema(GroupResponseJson, group))
  })
  
}