import { Group } from "@prisma/client";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { useMemo, useState } from "react";
import { Container } from "~/components/Container";
import { Button } from "~/components/Forms/Button";
import { FormContext } from "~/components/Forms/FormContext";
import { FormField } from "~/components/Forms/FormField";
import { FormOptional } from "~/components/Forms/FormOptional";
import { FormSubmit } from "~/components/Forms/FormSubmit";
import { FormTags } from "~/components/Forms/FormTags";
import Modal from "~/components/Modal";
import { Table } from "~/components/Table";
import { Toolbar } from "~/components/Toolbar";
import { getGroupsWhere, GroupCreateSchema, GroupWithIncludes } from "~/models/group";
import { requireSession } from "~/session.server";
import { classNames } from "~/utils";

type LoaderData = {
  groups: Group[]
}

export const loader: LoaderFunction = async ({ request }) => {

  // require session.
  await requireSession(request)

  // parse url ( for filters )
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status")
  const tags = searchParams.get("tags")
  
  // get all users current user has access to.
  // applying conditional filters.
  const groups = await getGroupsWhere({
    ...(
      status && {
        status
      }
    ),
    ...(
      tags && {
        tags
      }
    )
  })

  // return groups result.
  return json<LoaderData>({ groups });

};

export default function Index() {

  const { groups } = useLoaderData()

  // the filter columns to populate.
  const filters = {
    'status': ['Active', 'Paused']
  }

  // the fields to query strings against.
  const queryFields = ['display']

  const [filter, setFilter] = useState({
    status: ''
  })

  // set the string query state.
  const [query, setQuery] = useState('')
  
  // update data when filter or query changes
  const data = useMemo(() => {
    return groups.filter((item: any) => {
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
  }, [groups, query, filter])

  return (
    <Container className="w-full">
      
      <div className="flex flex-col w-full">

        <Toolbar className="items-center justify-between">
        
          <div className="flex flex-row items-center">
            <div className="text-sm text-indigo-600">Groups</div>
          </div>

          <Modal button={(open) => (
            <Button type="button" className='flex whitespace-nowrap ml-2' onClick={open}>Add Group</Button>
          )}>
            {(close) => (
              <FormContext
                url="/api/groups?index"
                method="post"
                schema={{
                  type: 'object',
                  additionalProperties: false,
                  required: ['title'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } } // TODO: make this and serverside match
                  }
                }}
                initialData={{
                  title: '',
                  tags: []
                }}
                onComplete={close}
              >
                {() => (
                  <>

                    <FormField name="title" label="Group Name"/>
                    
                    <FormOptional>
                      <div className="mt-2">
                        <FormTags label="Group Tags" placeholder="e.g. Orange" />
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
                const { id, title } = ctx.row.original as GroupWithIncludes
                return (
                  <Link className="group" to={`/groups/${id}`}>
                    <div className="text-sm text-gray-800">
                      {title}
                    </div>
                    <div className="group-hover:underline text-xs">{id}</div>
                  </Link>
                )
              } },
              { id: 'status', header: 'Status', cell: (ctx) => {
                const { status } = ctx.row.original as GroupWithIncludes
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
                const { id, tags } = ctx.row.original as GroupWithIncludes
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
                const { createdAt, updatedAt } = ctx.row.original as GroupWithIncludes
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
