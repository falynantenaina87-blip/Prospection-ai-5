export interface Lead {
  id: string;
  name: string;
  address: string;
  mapUri?: string;
  rating?: number;
  userRatingCount?: number;
  phone?: string; // Raw phone
  // Enriched fields
  website?: string;
  email?: string;
  mobileFriendly?: boolean;
  weakness?: string;
  pitch?: string;
  status: 'discovered' | 'analyzing' | 'completed' | 'failed';
  
  // Validated Data for Export
  cleanPhone?: string;
  cleanEmail?: string;
  cleanWebsite?: string;
}

export interface SearchParams {
  activity: string;
  city: string;
}

export interface EnrichedData {
  website: string;
  email: string;
  isMobileFriendly: boolean;
  weakness: string;
  pitch: string;
}
