import { ActionFunction } from "@remix-run/node";
import { addUserToGroup, UserResponseJson, removeUserFromGroup, requireUser } from "~/models/user";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, SuccessResponse } from "~/utils/responders";
import { FilterSchema } from "~/utils/schema";

/**
 * /users/{userId}/groupd/{groupId}
 * @description handles adding/removing users from group
 * @returns AppResponse
 */
export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)
  
  // retrieve user (filtering access by user role)
  await requireUser(params)

  const { userId, groupId } = params

  if (!userId)
    return ErrorResponse(400, {user:'Missing id'})

  if (!groupId)
    return ErrorResponse(400, {group:'Missing id'})

  let user;

  switch (request.method) {

    case 'PUT':

      // create user environment variable
      user = await addUserToGroup(userId, groupId)

    break;
    case 'DELETE':

      // remove user environment variable
      user = await removeUserFromGroup(userId)

    break;

    // catch all and response with error.
    default: return ErrorResponse(405)

  }
  
  return SuccessResponse({
    user: FilterSchema(UserResponseJson, user)
  })
  
}