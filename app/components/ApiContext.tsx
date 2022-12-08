import { FormMethod, useFetcher } from "@remix-run/react";
import { Formik, Form, FormikProps, FormikValues } from "formik";
import { ReactNode, useEffect, useRef } from "react";
import { buildYup } from "schema-to-yup"

interface Props {
  url: string
  method?: FormMethod
  initialData?: { [key: string]: any }
  schema?: any
  messages?: any
  onComplete: Function
  children: (
    props: FormikProps<{
      [key: string]: any
    }>
  ) => ReactNode
}

export const ApiContext = ({ initialData, url, children, method = 'post', schema, messages = {}, onComplete = () => {} }:Props) => {

  const fetcher = useFetcher();
  const formRef = useRef<FormikProps<FormikValues>>(null)

  useEffect(() => {
    if (formRef.current) {
      const { type, data } = fetcher
      const { setSubmitting, setFieldError } = formRef.current
      if (type === "done") {
        if (data.code !== 200) {
          Object.keys(data.errors)
            .forEach((field: string) => {
              setFieldError(field, data.errors[field])
            })
        } else {
          onComplete()
        }
        setSubmitting(false)
      }
    }
  }, [fetcher]);

  const handleSubmit = async (values: any) => {
    if (formRef.current) {
      const { setSubmitting } = formRef.current
      setSubmitting(true)
      Object.keys(values).forEach((key) => {
        const _field = values[key]
        // check fields for array types.
        if (Array.isArray(_field)) {
          // if we find an array, convert them
          // to key[index] format to be compatible
          // with formdata.
          _field.forEach((value, index) => {
            values[`${key}[${index}]`] = value
          })
          delete values[key]
        }
      })
      fetcher.submit(values, {
        method,
        action: `${url}?index`,
        replace: true
      })
    }
  }

  return (
    <Formik innerRef={formRef} validationSchema={buildYup(schema, {
      // for error messages...
      errMessages: {
        ...messages
      },
    })} initialValues={initialData!} onSubmit={handleSubmit}>
      {(props) => (
        <Form onSubmit={props.handleSubmit}>
          {
            children(props)
          }
        </Form>
      )}
    </Formik>
  )
}