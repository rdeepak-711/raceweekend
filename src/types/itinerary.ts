export interface Itinerary {
  id: string;
  raceId: number;
  sessionsSelected: number[];
  experiencesSelected: number[];
  itineraryJson: string | null;
  groupSize: number;
  notes: string | null;
  viewCount: number;
  createdAt: Date;
}

export interface CreateItineraryInput {
  raceId: number;
  sessionsSelected: number[];
  experiencesSelected: number[];
  notes?: string;
  groupSize?: number;
}
