import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { checkIfUserExists, createUserWithData, getAllUsers, UserCreateSchema, UserResponseJson } from "~/models/user";
import { requireAdminSession } from "~/session.server";
import { ErrorResponse, ParseRequestData, SuccessResponse } from "~/utils/responders";
import { FilterSchema, ParseSchema } from "~/utils/schema";

/**
 * [POST] /users/
 * @description create new user
 * @returns User
 */
 export const action: ActionFunction = async ({ request, params }) => {

  // require admin access to run.
  await requireAdminSession(request)

  if (request.method === 'POST') {
    
    // validate/parse inbound form body.
    const { data } = ParseSchema(UserCreateSchema, await ParseRequestData(request))

    if (
      // check if user exists already with same name
      await checkIfUserExists({
        email: data.email
      })
    ) {

      return ErrorResponse(409, { email:'Email address in use' })
      
    }

    // create user
    const user = await createUserWithData(data)
  
    // return filtered response data
    return SuccessResponse({
      user: FilterSchema(UserResponseJson, user)
    })

  } else {

    return ErrorResponse(405)

  }
  
}

/**
 * [GET] /users/
 * @description retrieve all (accessible) users
 * @returns User[]
 */
export const loader: LoaderFunction = async ({ request }) => {

  // require admin access to run.
  const admin = await requireAdminSession(request)

  // if we aren't an admin, return apps associated to the user group.
  const users = await getAllUsers(admin)
  
  // filter array of users
  return SuccessResponse({
    users: users.map((user) => FilterSchema(UserResponseJson, user))
  })
  
}