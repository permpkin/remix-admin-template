import { json } from '@remix-run/server-runtime';
import {
	StatusCodes,
	getReasonPhrase
} from 'http-status-codes';

export const ErrorResponse = (code: StatusCodes, errors?: {[key: string]: string}) => {
  // throw new Response(JSON.stringify({
  return new Response(JSON.stringify({
    code,
    message: getReasonPhrase(code),
    errors
  }), {
    status: code,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  })
}

export const SuccessResponse = (data: any = {}) => {
  return json({
    code: 200,
    message: 'Success',
    ...data
  })
}

export const ParseRequestData = async (request: Request) => {
  switch (request.headers.get('content-type')) {
    case 'application/json':
    case 'application/json; charset=utf-8':
      return await request.json()
    default:
      return Object.fromEntries(await request.formData())
  }
}