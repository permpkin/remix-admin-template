import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { deleteGroup, GroupResponseJson, GroupUpdateSchema, requireGroup, updateGroup } from "~/models/group";
import { requireAdminSession, requireSession } from "~/session.server";
import { ErrorResponse, ParseRequestData, SuccessResponse } from "~/utils/responders";
import { FilterSchema, ParseSchema } from "~/utils/schema";

/**
 * [PUT|DELETE] /groups/{groupId}/
 * @description update and/or remove group by id
 * @returns Group | OK
 */
 export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve app (filtering access by user role)
  const { id } = await requireGroup(params)

  let group;

  switch (request.method) {

    case 'PUT':

      // validate/parse inbound body.
      const { data } = ParseSchema(GroupUpdateSchema, await ParseRequestData(request))

      // create group environment variable
      group = await updateGroup(id, data)
  
      // return filtered response data
      return SuccessResponse({
        group: FilterSchema(GroupResponseJson, group)
      })

    case 'DELETE':

      // remove group environment variable
      await deleteGroup(id)
  
      return SuccessResponse()

    // catch all and response with error.
    default: return ErrorResponse(405)

  }
  
}

export const loader: LoaderFunction = async ({ request, params }) => {

  // require admin access to run.
  const user = await requireSession(request)
    
  // retrieve group (filtering access by user role)
  const group = await requireGroup(params, user)
  
  // return filtered response data
  return SuccessResponse({
    group: FilterSchema(GroupResponseJson, group)
  })

};