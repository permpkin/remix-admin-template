import { FormMethod, useFetcher } from "@remix-run/react";
import { Formik, FormikProps, FormikValues } from "formik";
import { ReactNode, useEffect, useRef, useState } from "react";
import { buildYup } from "schema-to-yup"

interface Props {
  url: string
  method?: FormMethod
  initialData?: { [key: string]: any }
  schema?: any
  messages?: any
  onComplete?: Function
  className?: string
  children: ReactNode | ReactNode[] | ((
    props: FormikProps<{
      [key: string]: any
    }>
  ) => ReactNode)
}

export const FormContext = ({ initialData, url, children, method = 'post', schema, messages = {}, className = '', onComplete = () => {} }:Props) => {

  const fetcher = useFetcher();
  const formRef = useRef<FormikProps<FormikValues>>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (formRef.current) {

      const { type, data } = fetcher
      const { setSubmitting, setFieldError } = formRef.current

      if (type === "done") {
        
        if (data.code !== 200) {
          
          // if we have errors, loop through
          // and populate the local errors
          Object.keys(data.errors)
            .forEach((field: string) => {
              setFieldError(field, data.errors[field])
            })

        } else {

          onComplete(data)

        }

        setSubmitting(false)
        setBusy(false)

      }

    }
  }, [fetcher]);

  const handleSubmit = async (values: any) => {
    if (formRef.current) {

      const { setSubmitting } = formRef.current
      if (!busy) {
        
        setBusy(true)
        setSubmitting(true)

        const payload = {
          ...values
        }

        Object.keys(payload).forEach((key) => {
          const _field = payload[key]
          // check fields for array types.
          if (Array.isArray(_field)) {
            // convert to csv, avoids annoying
            // type checking issues elsewhere.
            payload[key] = payload[key].join(',')
          }
        })

        // send the payload
        fetcher.submit(payload, {
          method,
          action: url,
          replace: true
        })

      }

    }
  }

  return (
    <Formik innerRef={formRef} validationSchema={schema ? buildYup(schema, {
      // for error messages...
      errMessages: {
        ...messages
      },
    }) : undefined} initialValues={initialData!} onSubmit={handleSubmit}>
      {(props) => (
        <fetcher.Form className={className} action={url} method={method} onSubmit={props.handleSubmit}>
          {
            typeof children === "function" && children(props)
          }
        </fetcher.Form>
      )}
    </Formik>
  )
}