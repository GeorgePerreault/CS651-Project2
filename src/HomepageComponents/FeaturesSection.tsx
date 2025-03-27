import { BentoCard, BentoGrid } from "../components/magicui/bento-grid";
import { motion } from "framer-motion";
import { Cloud, ImageIcon, Database, Zap, Shield } from "lucide-react";
import UserImg from "@/assets/UserImg.jpeg";
interface Feature {
  Icon: React.ElementType;
  name: string;
  description: string;
  className: string;
  background?: React.ReactNode;
}

const features: Feature[] = [
  {
    Icon: ImageIcon,
    name: "User Photo Analysis",
    description:
      "Automatically analyze user-uploaded photos from SocialNetwork platforms (e.g., Pinterest, Google Photos) using Google’s advanced Computer Vision tools.",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    background: (
      <img src={UserImg} className="absolute bg-contain opacity-100" />
    ),
  },
  {
    Icon: Database,
    name: "Cloud Storage Integration",
    description:
      "Securely store the analysis results in Google Cloud Firestore or Datastore, ensuring scalable and reliable data management.",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Zap,
    name: "Seamless Single-Page Experience",
    description:
      "Enjoy a smooth, interactive single-page application (SPA) that loads quickly and provides real-time analysis results.",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Cloud,
    name: "Google Cloud Deployment",
    description:
      "Hosted on Google Cloud Run or Google App Engine (GAE), ensuring high availability, performance, and automatic scaling.",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Shield,
    name: "Secure and Reliable",
    description:
      "Data storage and processing handled securely with Google Cloud, ensuring privacy and compliance with industry standards",
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
