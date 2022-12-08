import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import TailwindStylesheetUrl from "../public/tailwind.css";
import { Container } from "./components/Container";
import { NavMenu } from "./components/NavMenu";
import { getSystemNav } from "./models/system";
import { getSessionUser } from "./session.server";
import { SuccessResponse } from "./utils/responders";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: TailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: 'Remix Admin Template',
  viewport: "width=device-width,initial-scale=1"
});


export const loader: LoaderFunction = async ({ request }) => {

  const user = await getSessionUser(request)

  const nav = user ? await getSystemNav(user) : null

  return SuccessResponse({ user, nav })

}

export default function AppRoot() {

  const { user, nav } = useLoaderData()

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white text-gray-800">
        {
          user ? (
            <main className="flex flex-col w-full h-full">
              <NavMenu user={user} navigation={nav} />
              <Outlet context={{ session: { user } }} />
            </main>
          ) : (
            <Outlet />
          )
        }
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
