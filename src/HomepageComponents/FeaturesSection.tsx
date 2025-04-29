import { BentoCard, BentoGrid } from "../components/magicui/bento-grid";
import { motion } from "framer-motion";
import { PlayCircle, Camera, Eye, MessageSquare, ImageIcon } from "lucide-react";


interface Feature {
  Icon: React.ElementType;
  name: string;
  description: string;
  className: string;
  background?: React.ReactNode;
}

const features: Feature[] = [
  {
    Icon: Camera,
    name: "Photo Upload & Import",
    description:
      "Upload images from your device or import directly from Pinterest and Google Photos in one click.",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Eye,
    name: "AI Image Analysis",
    description:
      "Leverage Google Vision API to extract labels, faces, text, colors, and more from every photo.",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: MessageSquare,
    name: "Story Generation",
    description:
      "Use Gemini’s generative API to turn those image insights into a rich, coherent narrative.",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon:  ImageIcon,
    name: "AI-Generated Illustrations",
    description:
      "Automatically create bespoke illustrations for each story segment using the Gemini image model.",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: PlayCircle,
    name: "Interactive Slideshow",
    description:
      "Seamlessly combine text and images into a dynamic slideshow with built-in narration controls.",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

const FeatureSection = () => {
  return (
    <section className="mt-20">
      <h1 className="text-center mb-10 text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
        Features
      </h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.8, ease: "easeOut" },
        }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <BentoGrid className="mt-10 p-10 lg:grid-rows-3">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </motion.div>
      
    </section>
  );
};

export default FeatureSection;
