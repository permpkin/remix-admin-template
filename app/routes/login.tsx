import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getSessionUserId } from "~/session.server";
import { verifyLogin } from "~/models/user";
import { safeRedirect, validateEmail } from "~/utils";
import { Button } from "~/components/Forms/Button";
import { FormContext } from "~/components/Forms/FormContext";
import { FormField } from "~/components/Forms/FormField";
import { FormToggle } from "~/components/Forms/FormToggle";
import { ParseSchema } from "~/utils/schema";
import { ErrorResponse, ParseRequestData } from "~/utils/responders";

const FormSchema = {
  type: "object",
  required: ['email', 'password'],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
    remember: { type: "boolean" },
    redirectTo: { type: "string" }
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getSessionUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {

  const { data } = ParseSchema(FormSchema, await ParseRequestData(request))
  
  const { email, password, remember } = data
  
  const redirectTo = safeRedirect(data.redirectTo, "/");

  if (!validateEmail(email)) {
    return ErrorResponse(400, { email: "Email is invalid" })
  }

  if (typeof password !== "string" || password.length === 0) {
    return ErrorResponse(400, { password: "Password is required" })
  }

  if (password.length < 8) {
    return ErrorResponse(400, { password: "Password is too short" })
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return ErrorResponse(400, { email: "Invalid email or password" })
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });

};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const actionData = useActionData() as ActionData;

  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  // focus on relevant field that
  // returned errors ( if any ).
  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        <FormContext
          url="/login"
          method="post"
          schema={FormSchema}
          initialData={{
            remember: true,
            email: 'admin@admin.com',
            password: 'adminadmin!?',
            redirectTo
          }}
          onComplete={() => {
            alert("LOGIN")
          }}
        >
          {({ isSubmitting }) => (
            <div className="flex flex-col space-y-4">

              <FormField label="Email address" name="email"/>

              <FormField label="Password" name="password"/>

              <div className="flex items-center justify-between">

                <FormToggle name="remember" label="Remember me"/>

                <div className="text-sm">
                  <Link to={{
                    pathname: "/reset-password",
                    search: searchParams.toString(),
                  }} className="font-medium hover:underline text-gray-800 hover:text-black dark:text-gray-400 dark:hover:text-white">
                    Forgot your password?
                  </Link>
                </div>

              </div>

              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="flex items-center justify-center">

                <div className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    className="underline hover:text-black dark:hover:text-white"
                    to={{
                      pathname: "/register",
                      search: searchParams.toString(),
                    }}
                  >
                    Register
                  </Link>
                </div>

              </div>
            </div>
          )}
        </FormContext>

      </div>
    </div>
  );
}
