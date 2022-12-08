import { User } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { ChangeEventHandler, useMemo, useState } from "react";
import { AddUserModal } from "~/components/AddUserModal";
import { Container } from "~/components/Container";
import { Button } from "~/components/Forms/Button";
import { FormContext } from "~/components/Forms/FormContext";
import { FormField } from "~/components/Forms/FormField";
import { FormOptional } from "~/components/Forms/FormOptional";
import { FormSelect } from "~/components/Forms/FormSelect";
import { FormSubmit } from "~/components/Forms/FormSubmit";
import { FormTags } from "~/components/Forms/FormTags";
import { FormToggle } from "~/components/Forms/FormToggle";
import Modal from "~/components/Modal";
import { Table } from "~/components/Table";
import { TableFilter } from "~/components/TableFilter";
import { Toolbar } from "~/components/Toolbar";
import { getUsersWhere, UserWithIncludes } from "~/models/user";
import { getSessionUser } from "~/session.server";
import { classNames } from "~/utils";

type LoaderData = {
  user: User
  users: User[]
}

export const loader: LoaderFunction = async ({ request }) => {

  // get current user.
  const user = await getSessionUser(request)

  if (user === null) return null;

  // parse url ( for filters )
  const { searchParams } = new URL(request.url);

  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const tags = searchParams.get("tags")
  const group = searchParams.get("group")
  
  // get all users current user has access to.
  // applying conditional filters.
  const users = await getUsersWhere(user!, {
    ...(
      type && {
        type
      }
    ),
    ...(
      status && {
        status
      }
    ),
    ...(
      tags && {
        tags
      }
    ),
    ...(
      group && {
        groupId: group
      }
    )
  })

  // return users result.
  return json<LoaderData>({ users, user });

};

export default function Index() {

  const { users, user } = useLoaderData()

  // the filter columns to populate.
  const filters = {
    'type': ['Admin', 'Client'],
    'status': ['Pending', 'Active', 'Paused']
  }

  // the fields to query strings against.
  const queryFields = ['display']

  const [filter, setFilter] = useState({
    type: '',
    status: ''
  })

  // set the string query state.
  const [query, setQuery] = useState('')
  
  // update data when filter or query changes
  const data = useMemo(() => {
    return users.filter((item: any) => {
      let include = true
      Object.keys(filters).map((key: string) => {
        if ( include && filter[key as keyof typeof filter] !== '' ) {
          include = item[key as keyof typeof item] == filter[key as keyof typeof filter]
        }
      })
      if ( query.length >= 2 ) {
        queryFields.forEach((queryField) => {
          if (item.hasOwnProperty(queryField)) {
            include = `${item[queryField as keyof typeof item]}`.toLowerCase().indexOf(query) >= 0
          }
        })
      }
      return include
    })
  }, [users, query, filter])

  return (
    <Container className="w-full">
      
      <div className="flex flex-col w-full">

        <Toolbar className="items-center justify-between">
        
          <div className="flex flex-row items-center">
            <div className="text-sm text-indigo-600">Users</div>
          </div>

          <Modal button={(open) => (
            <Button type="button" className='flex whitespace-nowrap ml-2' onClick={open}>Add User</Button>
          )}>
            {(close) => (
              <FormContext
                url="/api/users?index"
                method="post"
                schema={{
                  type: "object",
                  required: ['email'],
                  properties: {
                    email: { type: "string", format: "email" },
                    display: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    notify: { type: "boolean" },
                  }
                }}
                initialData={{
                  email: '',
                  display: '',
                  type: 'Client',
                  tags: [],
                  notify: 'true'
                }}
                onComplete={close}
              >
                {() => (
                  <>

                    <FormField name="email" label="Email Address"/>
                    
                    <div className="mt-2">
                      <FormToggle name="notify" label="Notify user via email?"/>
                    </div>
                    
                    <FormOptional>
                      <FormField name="display" label="Display Name"/>
                      <div className="mt-2">
                        <FormTags label="User Tags" placeholder="e.g. Orange" />
                      </div>
                    </FormOptional>

                    <div className="h-8 mt-4 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <Button inverse onClick={close}>
                        Cancel
                      </Button>
                      <FormSubmit />
                    </div>

                  </>
                )}
              </FormContext>
            )}
          </Modal>

        </Toolbar>
        
        <main className="flex-1">
          
          <Table
            data={data}
            cols={[
              { id: 'id', header: 'ID/Display', cell: (ctx) => {
                const { id, display } = ctx.row.original as UserWithIncludes
                return (
                  <Link className="group" to={`/users/${id}`}>
                    <div className="text-sm text-gray-800">
                      {
                        user.id === id ? (
                          <span className={classNames(
                            "inline-flex rounded-full px-2 mr-1 text-xs font-semibold leading-5",
                            "bg-indigo-200 text-indigo-800"
                          )}>You</span>
                        ) : null
                      }
                      {display}
                    </div>
                    <div className="group-hover:underline text-xs">{id}</div>
                  </Link>
                )
              } },
              { id: 'email', header: 'Email' },
              { id: 'status', header: 'Status', cell: (ctx) => {
                const { status } = ctx.row.original as UserWithIncludes
                return (
                  <span className={classNames(
                    "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                    status === "Active" ? "bg-green-100 text-green-800" :
                    status === "Pending" ? "bg-yellow-300 text-yellow-900" :
                    "bg-gray-100 text-gray-800"
                  )}>
                    {status}
                  </span>
                )
              } },
              { id: 'tags', header: 'Tags', cell: (ctx) => {
                const { id, tags } = ctx.row.original as UserWithIncludes
                return (
                  <div>
                  {
                    tags?.map((tag, index) => (
                        <span
                        key={`field-tags-${id}-${index}`}
                        className={classNames(
                          "ml-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          "border border-gray-300 bg-gray-100 text-gray-800"
                        )}>{tag.name}</span>
                      ))
                  }
                  </div>
                )
              } },
              { id: 'createdAt', header: 'Created/Modified', cell: (ctx) => {
                const { createdAt, updatedAt } = ctx.row.original as UserWithIncludes
                return (
                  <>
                    <div className="text-sm text-gray-800">{`${createdAt}`}</div>
                    <div className="group-hover:underline text-xs">{`${updatedAt}`}</div>
                  </>
                )
              } },
            ]}
          />
          
        </main>

      </div>

    </Container>
  );
}
