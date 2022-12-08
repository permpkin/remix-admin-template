import type { LoaderFunction } from "@remix-run/node";

import { logout } from "~/session.server";

/**
 * [GET] /logout 
 * @returns redirect to /login
 */
export const loader: LoaderFunction = async ({ request }) => {
  return logout(request);
};
