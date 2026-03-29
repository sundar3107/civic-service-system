export enum Role {
  CITIZEN = "CITIZEN",
  AUTHORITY = "AUTHORITY",
  ADMIN = "ADMIN"
}

export enum ComplaintStatus {
  REMEDIAL_NOT_STARTED = "REMEDIAL_NOT_STARTED",
  ACCEPTED = "ACCEPTED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED"
}

export enum GeoSource {
  MAP = "MAP",
  EXIF = "EXIF",
  NONE = "NONE"
}

export const ISSUE_CATEGORIES = [
  "POTHOLE",
  "ROADSIDE_GARBAGE",
  "BROKEN_STREETLIGHT",
  "WATER_LOGGING",
  "ILLEGAL_DUMPING",
  "WEAK_INFRASTRUCTURE",
  "OTHERS"
] as const;

export type IssueCategoryCode = (typeof ISSUE_CATEGORIES)[number];

export type LocationPayload = {
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
  source: GeoSource;
};

export type ComplaintCard = {
  id: string;
  complaintNumber: string;
  issueType: IssueCategoryCode;
  status: ComplaintStatus;
  locationLabel: string;
  createdAt: string;
  creditedTo: string;
  voteCount: number;
  severityLabel: string;
};

