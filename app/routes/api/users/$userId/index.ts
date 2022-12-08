import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { deleteUser, requireUser, updateUser, UserResponseJson, UserUpdateSchema } from "~/models/user";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, ParseRequestData, SuccessResponse } from "~/utils/responders";
import { FilterSchema, ParseSchema } from "~/utils/schema";

/**
 * [PUT|DELETE] /users/{userId}/
 * @description update and/or remove user by id
 * @returns User | OK
 */
 export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve user (filtering access by user role)
  const { id } = await requireUser(params)

  switch (request.method) {

    case 'PUT':

      // validate/parse inbound body.
      const { data } = ParseSchema(UserUpdateSchema, await ParseRequestData(request))

      // create user environment variable
      const user = await updateUser(id, data)
  
      // return filtered response data
      return SuccessResponse({
        app: FilterSchema(UserResponseJson, user)
      })

    case 'DELETE':

      // remove user environment variable
      await deleteUser(id)
  
      return SuccessResponse()

    // catch all and response with error.
    default: return ErrorResponse(405)

  }
  
}

/**
 * [GET] /users/{userId}/
 * @description retrieve single user by id
 * @returns User
 */
export const loader: LoaderFunction = async ({ request, params }) => {


  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve user (filtering access by user role)
  const user = await requireUser(params)

  // return filtered response data
  return SuccessResponse({
    user: FilterSchema(UserResponseJson, user)
  })

};