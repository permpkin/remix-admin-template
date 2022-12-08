import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { Container } from "~/components/Container";
import { FormBuilder } from "~/components/Forms/FormBuilder";
import { FormContext } from "~/components/Forms/FormContext";
import { FormField } from "~/components/Forms/FormField";
import { FormSubmit } from "~/components/Forms/FormSubmit";
import { FormTags } from "~/components/Forms/FormTags";
import { MenuButton } from "~/components/Forms/MenuButton";
import { Toolbar } from "~/components/Toolbar";
import { GroupResponseJson, GroupWithIncludes, requireGroup } from "~/models/group";
import { requireAdminSession } from "~/session.server";
import { classNames } from "~/utils";
import { FilterSchema } from "~/utils/schema";

export const loader: LoaderFunction = async ({ request, params }) => {
  
  // require admin access to run.
  await requireAdminSession(request)
    
  // retrieve group (filtering access by user role)
  const group = await requireGroup(params)

  return json({
    group: FilterSchema(GroupResponseJson, {
      ...group,
      tags: (group as GroupWithIncludes).tags!.map(tag => tag.name) || []
    })
  });

};

const FormSchema = {
  type: "object",
  required: ['title'],
  properties: {
    title: { type: "string" },
    display: { type: "string" },
    tags: { type: "array", items: { type: "string" } }
  }
}

export default function Index() {

  const { group } = useLoaderData()
  
  return (
    <FormContext
      className="min-h-full"
      url={`/api/groups/${group.id}?index`}
      method="put"
      schema={FormSchema}
      initialData={{
        title: group.title,
        description: group.description || '',
        tags: group.tags,
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
              <Link to="/groups" className="text-sm hover:underline">Groups</Link>
              <div className="text-sm text-gray-200 mx-2">/</div>
              <div className="text-sm text-indigo-600">{group.title}</div>
              <span className={classNames(
                "inline-flex ml-2 rounded-full px-2 text-xs font-semibold leading-5",
                group.status === "Active" ? "bg-green-100 text-green-800" :
                group.status === "Pending" ? "bg-yellow-300 text-yellow-900" :
                "bg-gray-100 text-gray-800"
              )}>
                {group.status}
              </span>
            </div>

            <div className="flex flex-row items-center space-x-2">

              <MenuButton/>

              <FormSubmit text="Save" />

            </div>

          </Toolbar>
        
        </Container>

        <Container className="w-full flex flex-row min-h-full">
        
          <div className="flex-1 py-4 px-4 border-l border-gray-200">

            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Group details and attributes.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <FormField name="title" label="Display Name"/>
              </div>
              <div className="sm:col-span-4">
                <FormField name="description" label="Description"/>
              </div>
              <div className="sm:col-span-4">
                <FormTags label="Tags"/>
              </div>
            </div>
            {/* <FormBuilder/> */}
                  
          </div>
          <div className="flex-shrink-0 min-h-full min-w-64 w-1/3 px-4 border-x border-gray-200 py-4">
              ACTIVITY
          </div>

        </Container>
        </>
      )}
    </FormContext>
  );
}
