import { z } from "zod";

export const heroSchema = z.object({
  headline: z.string().max(200),
  subheadline: z.string().max(500),
  ctaText: z.string().max(100),
  ctaLink: z.string().max(500),
  backgroundImage: z.string().max(500),
});

export const textSchema = z.object({
  title: z.string().max(200),
  body: z.string().max(10000),
});

export const pricingItemSchema = z.object({
  name: z.string().max(100),
  price: z.string().max(50),
  description: z.string().max(500),
});

export const pricingSchema = z.object({
  title: z.string().max(200),
  items: z.array(pricingItemSchema).max(50),
});

export const ctaSchema = z.object({
  headline: z.string().max(200),
  buttonText: z.string().max(100),
  buttonLink: z.string().max(500),
});

export const contactSchema = z.object({
  phone: z.string().max(50),
  email: z.string().max(200),
  address: z.string().max(1000),
  showMap: z.boolean(),
});

export const gallerySchema = z.object({
  images: z.array(z.string().max(500)).max(50),
});

export const sectionSchemas = {
  HERO: heroSchema,
  TEXT: textSchema,
  PRICING: pricingSchema,
  CTA: ctaSchema,
  CONTACT: contactSchema,
  GALLERY: gallerySchema,
} as const;
