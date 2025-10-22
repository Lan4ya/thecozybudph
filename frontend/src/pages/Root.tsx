import { Outlet, useRouteError, isRouteErrorResponse } from "react-router";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ErrorPage from "./ErrorPage";

export function RootError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <ErrorPage status={error.status} title={`${error.status}`} />;
  }

  if (error instanceof Error) {
    return <ErrorPage title="Error" message={error.message} />;
  }

  return <ErrorPage title="Unknown Error" message="Something went wrong." />;
}

function Root() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Root;
