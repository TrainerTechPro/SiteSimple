import { Role, SiteStatus, SectionType } from "@prisma/client";

export type { Role, SiteStatus, SectionType };

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

export interface TextContent {
  title: string;
  body: string;
}

export interface PricingItem {
  name: string;
  price: string;
  description: string;
}

export interface PricingContent {
  title: string;
  items: PricingItem[];
}

export interface CTAContent {
  headline: string;
  buttonText: string;
  buttonLink: string;
}

export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  showMap: boolean;
}

export interface GalleryContent {
  images: string[];
}

export type SectionContent =
  | HeroContent
  | TextContent
  | PricingContent
  | CTAContent
  | ContactContent
  | GalleryContent;
