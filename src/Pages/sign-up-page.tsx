import { SignUp } from "@clerk/clerk-react";

// Sign up is handled by clerk so we just display clerk's react component
const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp forceRedirectUrl="/product" />
    </div>
  );
};

export default SignUpPage;