import { SectionType } from "@prisma/client";
import HeroSection from "./HeroSection";
import TextSection from "./TextSection";
import PricingSection from "./PricingSection";
import CTASection from "./CTASection";
import ContactSection from "./ContactSection";
import GallerySection from "./GallerySection";
import type {
  HeroContent,
  TextContent,
  PricingContent,
  CTAContent,
  ContactContent,
  GalleryContent,
} from "@/types";

interface SectionRendererProps {
  type: SectionType;
  content: Record<string, unknown>;
}

export default function SectionRenderer({
  type,
  content,
}: SectionRendererProps) {
  switch (type) {
    case "HERO":
      return <HeroSection content={content as unknown as HeroContent} />;
    case "TEXT":
      return <TextSection content={content as unknown as TextContent} />;
    case "PRICING":
      return <PricingSection content={content as unknown as PricingContent} />;
    case "CTA":
      return <CTASection content={content as unknown as CTAContent} />;
    case "CONTACT":
      return <ContactSection content={content as unknown as ContactContent} />;
    case "GALLERY":
      return <GallerySection content={content as unknown as GalleryContent} />;
    default:
      return null;
  }
}
