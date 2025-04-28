import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, ImageIcon, HeartIcon, BookOpenIcon } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { motion } from "framer-motion";

// Nothing fancy basically just an html file with some general semi-pretend stuff in it
const About = () => {
  return (
      <>
        <Navbar />
        <div className="flex min-h-screen flex-col items-center bg-white text-black dark:bg-black dark:text-white">
          <main className="flex-1 w-full max-w-6xl px-6 py-12">
            {/* About Section */}
            <section className="text-center space-y-6 mb-20 pt-24 sm:pt-32 scroll-mt-24" id="about">
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4">
                <span>About </span>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                VisionCloud
              </span>
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Discover how we’re redefining the way you experience images using advanced cloud-based vision AI and creative technology.
              </p>
            </section>

            {/* Our Story Section */}
            <section className="bg-white/70 dark:bg-white/10 rounded-2xl p-8 md:p-10 shadow-lg mb-24">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                VisionCloud was born from a simple question: What stories lie hidden within the brushstrokes, colors, and compositions of artwork? We believed that every piece of art contains narratives waiting to be discovered—emotions, themes, and stories embedded in visual expression.
                <br /><br />
                Founded in 2025 by a team of artists, and AI researchers, our platform uses advanced machine learning to analyze visual art and generate creative stories inspired by what it sees. We're passionate about creating new connections between visual and written art forms, helping people appreciate artwork from new perspectives.
                <br /><br />
                Our mission is to make image understanding and storytelling accessible to everyone, while inspiring creativity across different mediums. Whether you're an artist seeking new dimensions in your work, a writer exploring visual inspiration, or simply someone curious about the stories your images hold — VisionCloud offers a unique experience at the intersection of AI, creativity, and storytelling.
              </p>
            </section>

            {/* Technology Section */}
            <section className="text-center mb-24" id="technology">
              <h2 className="text-3xl font-bold mb-6">
                Our <span className="text-purple-400">Technology</span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
                Leveraging cutting-edge AI to bring intelligent insights to your photos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 place-items-center">
                {[
                  {
                    icon: <ImageIcon className="mx-auto mb-3 text-sky-400" size={36} />,
                    title: "Visual Analysis",
                    text: "Our AI detects objects, colors, and visual patterns to help you understand the deeper meaning behind your images."
                  },
                  {
                    icon: <HeartIcon className="mx-auto mb-3 text-pink-400" size={36} />,
                    title: "Emotional Insight",
                    text: "Understand the emotional tone, mood, and style that your visuals express through AI interpretation."
                  },
                  {
                    icon: <BookOpenIcon className="mx-auto mb-3 text-orange-400" size={36} />,
                    title: "Story Generation",
                    text: "Our generative AI helps craft imaginative stories inspired by the images you upload."
                  }
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        className="w-full max-w-[320px] bg-white/70 dark:bg-white/10 hover:dark:bg-white/20 hover:bg-white rounded-xl p-8 text-center cursor-default transition duration-300 ease-in-out shadow-md hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                    >
                      {card.icon}
                      <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                      <p className="text-md text-gray-600 dark:text-gray-400">{card.text}</p>
                    </motion.div>
                ))}
              </div>
            </section>
            {/* FAQ Section */}
            <section className="text-center mb-32 px-4" id="faq">
              <h2 className="text-3xl font-bold mb-10">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
              </h2>

              <div className="space-y-8 max-w-5xl mx-auto">
                {[
                  {
                    q: "What types of artwork can I upload?",
                    a: "You can upload almost any type of visual art: paintings, drawings, digital art, photographs, sculptures (as images), collages, and more. Our system works best with clear images that show the complete artwork.",
                  },
                  {
                    q: "Are my uploads and generated stories private?",
                    a: "Yes, your uploads are private by default. You can choose to share your analyses and stories publicly in our gallery, but this is optional and under your control.",
                  },
                  {
                    q: "Can I view the generated stories from my artwork in the slideshow?",
                    a: "Yes, you can view the generated stories by clicking the \"Create Slideshow\" button at the top right. This will compile your artwork and the corresponding creative interpretations into a viewable slideshow.",
                  },
                  {
                    q: "How accurate is the artwork analysis?",
                    a: "Our AI provides insightful analysis based on visual elements, but art interpretation is subjective. The analysis offers a technological perspective that can complement, not replace, human interpretation.",
                  },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        className="bg-white/70 dark:bg-white/10 hover:dark:bg-white/20 hover:bg-white rounded-xl p-6 text-left shadow-md hover:shadow-xl cursor-default transition duration-300 ease-in-out"
                        whileHover={{ scale: 1.05 }}
                    >
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-3">{item.q}</h3>
                      <p className="text-md text-gray-700 dark:text-gray-300">{item.a}</p>
                    </motion.div>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section className="text-center mb-24" id="contact">
              <h2 className="text-3xl font-bold mb-6">
                Get in <span className="text-indigo-400">Touch</span>
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                Have a question or suggestion? We’d love to hear from you.
              </p>
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Us
                </Button>
              </Link>
            </section>


          </main>

          <footer className="w-full py-6 px-4 border-t border-gray-300 dark:border-gray-700 text-sm text-center text-gray-600 dark:text-gray-400">
            © 2024 VisionCloud. All rights reserved.
          </footer>
        </div>
      </>
  );
};

export default About;
