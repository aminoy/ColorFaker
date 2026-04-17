-- Teams and SLA rules. Demo users are created by the seed script (src/db/seed.ts)
-- so the bcrypt hash is generated at runtime.

INSERT INTO teams (name, description) VALUES
  ('Hotel Bookings',  'Handles hotel reservation inquiries'),
  ('Mall Management', 'Handles retail leasing inquiries'),
  ('Vendors',         'Handles vendor onboarding'),
  ('Customer Care',   'General inquiries and escalations')
ON CONFLICT (name) DO NOTHING;

-- SLA rules (minutes). Per category, per priority (NULL = any priority).
INSERT INTO sla_rules (category_code, priority, first_response_minutes, resolution_minutes, description) VALUES
  ('hotel_booking',  NULL,     5,   240,  'Hotel booking default SLA'),
  ('hotel_booking',  'urgent', 2,    60,  'Hotel booking urgent'),
  ('retail_leasing', NULL,     30,  1440, 'Retail leasing default SLA'),
  ('vendor',         NULL,     60,  2880, 'Vendor SLA'),
  ('general_inquiry',NULL,     15,  720,  'General inquiry SLA')
ON CONFLICT DO NOTHING;
