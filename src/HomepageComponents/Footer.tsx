import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
    
      <section className="bg-black text-white border-t mt-20 w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Unlock insights from your photos with Google Cloud-powered
                Computer Vision.
              </p>
            </div>
            <div>
              <Button className="mt-6 px-5 py-5 rounded-sm relative bg-black text-white text-sm hover:shadow-2xl hover:shadow-white/[0.1] transition duration-200 border border-slate-600">
                <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                <span className="relative z-20">Get Started for Free →</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 VisonCloud. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" to="https://www.google.com/">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" to="https://www.google.com/">
            Privacy
          </Link>
        </nav>
      </footer>
     
    </>
  );
};

export default Footer;
