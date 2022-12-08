import { Link } from "@remix-run/react";
import { LoaderFunction } from "@remix-run/server-runtime";
import { Fragment } from "react";
import { Container } from "~/components/Container";
import { requireSession } from "~/session.server";
import { SuccessResponse } from "~/utils/responders";

export const loader: LoaderFunction = async ({ request }) => {

  const user = await requireSession(request)

  return SuccessResponse({ user })

}

export default function Index() {
  return (
    // <Container>

      <h1>OVERVIEW</h1>

    // </Container>
  );
}
