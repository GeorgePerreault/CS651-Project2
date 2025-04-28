import { SignIn } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

// Sign in is handled by clerk so we just display clerk's react component
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