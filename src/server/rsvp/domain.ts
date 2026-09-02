import type { Locale } from '../../i18n/translations';

export type InvitationKind = 'named' | 'anonymous' | 'shared_claim';
export type InvitationStatus = 'active' | 'revoked' | 'expired';
export type CompanionPolicy = 'none' | 'open' | 'fixed' | 'mixed';
export type GuestRole = 'primary' | 'named_companion' | 'open_companion';
export type Attendance = 'yes' | 'no' | 'unknown';
export type TransportNeeded = 'yes' | 'no' | 'unknown';

export interface InvitationPerson {
  id: string;
  role: GuestRole;
  firstName: string;
  lastName: string;
  nameEditable: boolean;
  optional: boolean;
  position: number;
}

export interface RsvpGuest {
  invitationPersonId: string | null;
  role: GuestRole;
  firstName: string;
  lastName: string;
  attendance: Attendance;
  dietaryNeeds: string;
  transportNeeded: TransportNeeded;
  message: string;
  position: number;
}

export interface Invitation {
  id: string;
  externalId: string;
  kind: InvitationKind;
  locale: Locale;
  status: InvitationStatus;
  primaryFirstName: string | null;
  primaryLastName: string | null;
  primaryNameEditable: boolean;
  maxCompanions: number;
  companionPolicy: CompanionPolicy;
  rsvpDeadline: string | null;
  people: InvitationPerson[];
}

export interface RsvpSnapshot {
  invitation: Invitation;
  revision: number;
  contactEmail: string | null;
  contactPhone: string | null;
  guests: RsvpGuest[];
  updatedAt: string | null;
}

export interface SaveRsvpInput {
  revision: number;
  contactEmail: string | null;
  contactPhone: string | null;
  guests: RsvpGuest[];
}
