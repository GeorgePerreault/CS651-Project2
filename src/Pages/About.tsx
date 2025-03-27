import HeroImg from "@/assets/hero1.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { BorderBeam } from "@/components/magicui/border-beam";
const About = () => {
  return (
    <>
      <Navbar />

      <div className="flex min-h-screen flex-col justify-center items-center">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-8 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    VisionCloud
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    At VisionCloud, we aim to revolutionize how you interact
                    with images. Our platform leverages the powerful
                    capabilities of Google SaaS Computer Vision to analyze and
                    process photos from your favorite social networks, like
                    Pinterest and Google Photos.
                  </p>
                </div>

                <div className="z-0 relative w-full max-w-[800px] rounded-xl overflow-hidden shadow-xl">
                  <img src={HeroImg} /> <BorderBeam className="z-100" duration={5} size={170} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl shadow-xl w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Our Mission
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our mission is to bring sophisticated image processing
                    technology to everyone. By simplifying the integration of
                    computer vision and cloud storage, we allow users to focus
                    on what matters most their creativity and insights - without
                    worrying about the technical aspects.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Get in Touch
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    If you have any questions or feedback, feel free to contact
                    us. We would love to hear from you!
                  </p>
                </div>

                <div className="space-x-4">
                  <Link to="/contact">
                    <Button size="lg" className="gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 VisionCloud. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <a className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </a>
            <a className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </a>
          </nav>
        </footer>
      </div>
    </>
  );
};

export default About;
