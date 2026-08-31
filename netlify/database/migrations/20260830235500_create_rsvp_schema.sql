CREATE TYPE invitation_kind AS ENUM ('named', 'anonymous', 'shared_claim');
CREATE TYPE invitation_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE companion_policy AS ENUM ('none', 'open', 'fixed', 'mixed');
CREATE TYPE guest_role AS ENUM ('primary', 'named_companion', 'open_companion');
CREATE TYPE attendance_status AS ENUM ('yes', 'no', 'unknown');
CREATE TYPE transport_status AS ENUM ('yes', 'no', 'unknown');

CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  kind invitation_kind NOT NULL,
  token_hash text UNIQUE,
  locale text NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'fr', 'en')),
  status invitation_status NOT NULL DEFAULT 'active',
  primary_first_name text,
  primary_last_name text,
  primary_name_editable boolean NOT NULL DEFAULT false,
  max_companions integer NOT NULL DEFAULT 0 CHECK (max_companions >= 0 AND max_companions <= 10),
  companion_policy companion_policy NOT NULL DEFAULT 'none',
  rsvp_deadline timestamptz,
  claimed_from_code_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'named' OR (primary_first_name IS NOT NULL AND primary_last_name IS NOT NULL)),
  CHECK (max_companions > 0 OR companion_policy = 'none')
);

CREATE TABLE invitation_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  role guest_role NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  name_editable boolean NOT NULL DEFAULT false,
  optional boolean NOT NULL DEFAULT false,
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, position)
);

CREATE TABLE rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id uuid NOT NULL UNIQUE REFERENCES invitations(id) ON DELETE CASCADE,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  contact_email text,
  contact_phone text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rsvp_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id uuid NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  invitation_person_id uuid REFERENCES invitation_people(id) ON DELETE SET NULL,
  role guest_role NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  attendance attendance_status NOT NULL,
  dietary_needs text NOT NULL DEFAULT '',
  transport_needed transport_status NOT NULL DEFAULT 'unknown',
  message text NOT NULL DEFAULT '',
  position integer NOT NULL CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rsvp_id, position)
);

CREATE TABLE generic_claim_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  token_hash text NOT NULL UNIQUE,
  locale text NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'fr', 'en')),
  max_companions integer NOT NULL CHECK (max_companions >= 0 AND max_companions <= 10),
  max_claims integer NOT NULL CHECK (max_claims > 0),
  claims_used integer NOT NULL DEFAULT 0 CHECK (claims_used >= 0),
  status invitation_status NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (claims_used <= max_claims)
);

ALTER TABLE invitations
  ADD CONSTRAINT invitations_claim_code_fk
  FOREIGN KEY (claimed_from_code_id) REFERENCES generic_claim_codes(id) ON DELETE SET NULL;

CREATE TABLE rsvp_audit_log (
  id bigserial PRIMARY KEY,
  invitation_id uuid REFERENCES invitations(id) ON DELETE SET NULL,
  action text NOT NULL,
  actor text NOT NULL CHECK (actor IN ('guest', 'admin', 'importer', 'system')),
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invitations_token_hash_idx ON invitations(token_hash) WHERE token_hash IS NOT NULL;
CREATE INDEX invitation_people_invitation_idx ON invitation_people(invitation_id, position);
CREATE INDEX rsvp_guests_rsvp_idx ON rsvp_guests(rsvp_id, position);
CREATE INDEX rsvp_audit_invitation_idx ON rsvp_audit_log(invitation_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON invitations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rsvps_updated_at BEFORE UPDATE ON rsvps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rsvp_guests_updated_at BEFORE UPDATE ON rsvp_guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER generic_claim_codes_updated_at BEFORE UPDATE ON generic_claim_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
