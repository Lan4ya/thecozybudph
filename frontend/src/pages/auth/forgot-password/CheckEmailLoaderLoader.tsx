import { redirect } from "react-router";

const CheckEmailLoader = () => {
  const email = sessionStorage.getItem("forgot_password_recovery_email");
  if (!email) {
    return redirect("/auth/forgot-password");
  }
  return null;
};

export default CheckEmailLoader;
