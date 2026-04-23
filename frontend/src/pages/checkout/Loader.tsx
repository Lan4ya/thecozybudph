import z from "zod";
import { useCheckoutStore } from "./store/useCheckoutStore";
import { redirect, type LoaderFunction } from "react-router";

const Loader: LoaderFunction = async ({ params }) => {
  const sessionId = params.sessionId;
  const sessionIdStore = useCheckoutStore.getState().sessionId;
  const isValidUUID = z.uuid().safeParse(sessionId).success;

  if (
    !sessionId ||
    !sessionIdStore ||
    !isValidUUID ||
    sessionIdStore !== sessionId
  ) {
    throw redirect("Not Found", { status: 404 });
  }

  return null;
};

export default Loader;
