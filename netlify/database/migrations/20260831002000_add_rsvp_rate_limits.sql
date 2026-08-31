CREATE TABLE rsvp_rate_limits (
  action text NOT NULL,
  key_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 1 CHECK (hits > 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (action, key_hash, window_start)
);

CREATE INDEX rsvp_rate_limits_expiry_idx ON rsvp_rate_limits(expires_at);
