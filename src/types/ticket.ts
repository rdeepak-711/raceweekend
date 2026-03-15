export interface Ticket {
  id: bigint;
  raceId: number;
  ticketmasterEventId: string | null;
  title: string | null;
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string | null;
  quantityAvailable: number | null;
  ticketUrl: string | null;
  ticketSource: string | null;
  section: string | null;
  row: string | null;
  zone: string | null;
  imageUrl: string | null;
  lastSyncedAt: Date | null;
}
