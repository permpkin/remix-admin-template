import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { Container } from "~/components/Container";
import { FormContext } from "~/components/Forms/FormContext";
import { FormField } from "~/components/Forms/FormField";
import { FormSubmit } from "~/components/Forms/FormSubmit";
import { FormTags } from "~/components/Forms/FormTags";
import { Toolbar } from "~/components/Toolbar";
import { requireUser, UserResponseJson, UserWithIncludes } from "~/models/user";
import { requireAdminSession } from "~/session.server";
import { classNames } from "~/utils";
import { FilterSchema } from "~/utils/schema";

export const loader: LoaderFunction = async ({ request, params }) => {
  
  // require admin access to run.
  await requireAdminSession(request)

  //TODO: check if "self" user (or admin if not)
    
  // retrieve user (filtering access by user role)
  const user = await requireUser(params)

  return json({
    user: FilterSchema(UserResponseJson, {
      ...user,
      tags: (user as UserWithIncludes).tags!.map(tag => tag.name) || []
    })
  });

};

const FormSchema = {
  type: "object",
  required: ['email'],
  properties: {
    email: { type: "string", format: "email" },
    display: { type: "string" },
    tags: { type: "array", items: { type: "string" } }
  }
}

export default function Index() {

  const { user } = useLoaderData()
  
  return (
    <FormContext
      className="h-full"
      url={`/api/users/${user.id}/?index`}
      method="put"
      schema={FormSchema}
      initialData={{
        email: user.email,
        display: user.display,
        tags: user.tags,
      }}
      onComplete={() => {
        // console.log("FINISHED")
      }}
    >
      {() => (
        <>

        <Container className="w-full">
        
          <Toolbar className="border-b border-gray-200 justify-between">
            
            <div className="flex flex-row items-center">
              <Link to="/users" className="text-sm hover:underline">Users</Link>
              <div className="text-sm text-gray-200 mx-2">/</div>
              <div className="text-sm text-indigo-600">{user.display}</div>
              <span className={classNames(
                "inline-flex ml-2 rounded-full px-2 text-xs font-semibold leading-5",
                user.status === "Active" ? "bg-green-100 text-green-800" :
                user.status === "Pending" ? "bg-yellow-300 text-yellow-900" :
                "bg-gray-100 text-gray-800"
              )}>
                {user.status}
              </span>
            </div>

            <FormSubmit text="Save" />

          </Toolbar>
        
        </Container>

        <Container className="w-full flex flex-row h-full">
        
          <div className="flex-1 py-4 pl-4 border-l border-gray-200">

            <FormField name="email" label="Email Address"/>
            
            <div className="mt-4">
              
              <FormField name="display" label="Display Name"/>

            </div>

            <div className="mt-4">
              
              <FormTags label="User Tags" placeholder="e.g. Orange" />

            </div>
                  
          </div>
          <div className="flex-shrink-0 h-full w-64 px-4 ml-4 border-x border-gray-200 py-4">
              ACTIVITY
          </div>

        </Container>
        </>
      )}
    </FormContext>
  );
}
