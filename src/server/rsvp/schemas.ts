import { z } from 'zod';

const trimmedName = z.string().trim().min(1).max(100);
const optionalContact = z.string().trim().max(254).nullable();

export const rsvpGuestSchema = z.strictObject({
  invitationPersonId: z.uuid().nullable(),
  role: z.enum(['primary', 'named_companion', 'open_companion']),
  firstName: trimmedName,
  lastName: trimmedName,
  attendance: z.enum(['yes', 'no', 'unknown']),
  dietaryNeeds: z.string().trim().max(500),
  transportNeeded: z.enum(['yes', 'no', 'unknown']),
  message: z.string().trim().max(1000),
  position: z.number().int().min(0).max(10),
});

export const saveRsvpSchema = z.strictObject({
  revision: z.number().int().min(0),
  contactEmail: optionalContact.refine(
    (value) => value === null || z.email().safeParse(value).success,
    {
      message: 'Invalid email address',
    },
  ),
  contactPhone: z.string().trim().max(50).nullable(),
  guests: z.array(rsvpGuestSchema).min(1).max(11),
});

export const invitationImportSchema = z.strictObject({
  externalId: z.string().trim().min(1).max(100),
  kind: z.enum(['named', 'anonymous']),
  locale: z.enum(['es', 'fr', 'en']).default('es'),
  primaryFirstName: z.string().trim().max(100).nullable(),
  primaryLastName: z.string().trim().max(100).nullable(),
  primaryNameEditable: z.boolean().default(false),
  maxCompanions: z.number().int().min(0).max(10),
  companionPolicy: z.enum(['none', 'open', 'fixed', 'mixed']),
  rsvpDeadline: z.iso.datetime().nullable(),
});

export const genericClaimSchema = z.strictObject({
  firstName: trimmedName,
  lastName: trimmedName,
  locale: z.enum(['es', 'fr', 'en']).optional(),
});

export type SaveRsvpPayload = z.infer<typeof saveRsvpSchema>;
export type InvitationImportRow = z.infer<typeof invitationImportSchema>;
