import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

const SignInPage = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn forceRedirectUrl={redirectUrl} />
    </div>
  );
};

export default SignInPage;