import { ActionFunction } from "@remix-run/node";
import { addTagToUser, UserResponseJson, removeTagFromUser, requireUser } from "~/models/user";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, SuccessResponse } from "~/utils/responders";
import { FilterSchema } from "~/utils/schema";

/**
 * /user/{userId}/tag/{tag}
 * @description handles adding/removing user tags
 * @returns AppResponse
 */
export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve app (filtering access by user role)
  await requireUser(params)

  // descontruct params
  const { userId, tag } = params

  if (!userId)
    return ErrorResponse(400, {user:'Missing id'})

  if (!tag)
    return ErrorResponse(400, {tag:'Missing Tag'})

  let user;

  switch (request.method) {

    case 'POST':

      // create user environment variable
      user = await addTagToUser(userId, tag.split(','))

    break;
    case 'DELETE':

      // remove user environment variable
      user = await removeTagFromUser(userId, tag)

    break;

    // catch all and response with error.
    default: return ErrorResponse(405)

  }
  
  return SuccessResponse({
    user: FilterSchema(UserResponseJson, user)
  })
  
}