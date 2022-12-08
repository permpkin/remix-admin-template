import { ActionFunction } from "@remix-run/node";
import { addTagToGroup, GroupResponseJson, removeTagFromGroup, requireGroup } from "~/models/group";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, SuccessResponse } from "~/utils/responders";
import { FilterSchema } from "~/utils/schema";

/**
 * /group/{groupId}/tag/{tag}
 * @description handles adding/removing group tags
 * @returns AppResponse
 */
export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve app (filtering access by user role)
  await requireGroup(params)

  // descontruct params
  const { groupId, tag } = params

  if (!groupId)
    return ErrorResponse(400, {group:'Missing Group Identifier'})

  if (!tag)
    return ErrorResponse(400, {tag:'Missing Tag'})

  let group;

  switch (request.method) {

    case 'POST':

      // create group environment variable
      group = await addTagToGroup(groupId, tag.split(','))

    break;
    case 'DELETE':

      // remove group environment variable
      group = await removeTagFromGroup(groupId, tag)

    break;

    // catch all and response with error.
    default: return ErrorResponse(405)

  }
  
  return SuccessResponse({
    group: FilterSchema(GroupResponseJson, group)
  })
  
}