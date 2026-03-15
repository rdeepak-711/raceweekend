export type Category = 'food' | 'culture' | 'adventure' | 'daytrip' | 'nightlife';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ReviewSnapshot {
  author: string;
  rating: number;
  text: string;
  date: string;
  country?: string;
}

export interface OptionSnapshot {
  optionId: number;
  title: string;
  description: string;
  price: number;
  skipTheLine: boolean;
  instantConfirmation: boolean;
  languages: string[];
  meetingPoint: string;
}

export interface Experience {
  id: number;
  raceId: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  abstract?: string | null;
  category: Category;
  durationHours: number;
  durationLabel: string;
  priceAmount: number;
  priceCurrency: string;
  priceLabel: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  imageEmoji: string;
  affiliateUrl: string;
  affiliateProductId: string | null;
  affiliatePartner: 'getyourguide' | 'ticketmaster';
  sourceEventId: string | null;
  isFeatured: boolean;
  sortOrder: number;
  // Enrichment fields
  highlights: string[] | null;
  includes: string[] | null;
  excludes: string[] | null;
  importantInfo: string | null;
  photos: string[] | null;
  reviewsSnapshot: ReviewSnapshot[] | null;
  f1Context: string | null;
  meetingPoint: string | null;
  bestseller: boolean | null;
  originalPrice: number | null;
  discountPct: number | null;
  hasPickUp: boolean | null;
  mobileVoucher: boolean | null;
  instantConfirmation: boolean | null;
  skipTheLine: boolean | null;
  optionsSnapshot: OptionSnapshot[] | null;
  seoKeywords: string[] | null;
  f1WindowsLabel: string | null;
  lat: number | null;
  lng: number | null;
  languages: string[] | null;
  distanceKm: number | null;
  neighborhood: string | null;
  travelMins: number | null;
  guideArticle: string | null;
  faqItems: FAQItem[] | null;
}

export interface ExperienceFilter {
  raceSlug: string;
  series?: 'f1' | 'motogp';
  category?: Category;
  windowSlug?: string;
  affiliatePartner?: 'getyourguide' | 'ticketmaster';
  sort?: 'popular' | 'price-low' | 'price-high' | 'duration-short' | 'rating';
}
