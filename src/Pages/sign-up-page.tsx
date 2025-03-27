import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp forceRedirectUrl="/product" />
    </div>
  );
};

export default SignUpPage;