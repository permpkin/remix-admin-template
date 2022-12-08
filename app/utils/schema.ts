import invariant from 'tiny-invariant'
import Ajv, { DefinedError } from "ajv";
import addFormats from "ajv-formats";
import { ErrorResponse } from './responders'

const normalise = require('ajv-error-messages');
const SchemaLib = new Ajv({
  allErrors: true,
  removeAdditional: "all",
  strictRequired: false,
  coerceTypes: true
})
addFormats(SchemaLib)

export const ParseSchema = (Schema: any, data: { [key: string]: any }): { errors?: any, data: { [key: string]: any } } => {

  // create the validator instance.
  const validate = SchemaLib.compile(Schema)

  // validate the data
  if (validate(data)) {
    // return the validated data
    return { data }
  } else {
    const { fields } = normalise(validate.errors as DefinedError[])
    // return the validation errors
    throw ErrorResponse(400, fields)
  }

}

/**
 * Filter fields based on given json schema docs
 * @param Schema json schema
 * @param data data to filter
 * @returns { data }
 */
export const FilterSchema = (Schema: any, data?: { [key: string]: any }): { [key: string]: any; } | undefined => {

  // create the validator instance.
  const validate = SchemaLib.compile(Schema)

  // validate the data
  validate(data)

  // verify data
  invariant(data)

  // return the validated data
  return data

}