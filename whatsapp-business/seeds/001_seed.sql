-- Seed: inquiry categories
INSERT INTO inquiry_categories (code, name_ar, name_en, description) VALUES
  ('hotel_booking',  'حجوزات الفنادق',          'Hotel booking requests',        'Guests asking about hotel reservations, rates, and availability.'),
  ('retail_leasing', 'تأجير المحلات أو الأكشاك', 'Retail leasing (shops/kiosks)', 'Tenants interested in retail units or kiosks.'),
  ('vendor',         'الموردين ومقدمي الخدمات',  'Vendors / service providers',    'Suppliers and service providers; routed to vendor portal.'),
  ('general_inquiry','استفسار عام',              'General inquiry',                'Anything else; reviewed by the appropriate team.')
ON CONFLICT (code) DO NOTHING;

-- Seed: sample contact + conversation (for local smoke testing)
INSERT INTO contacts (wa_id, display_name, locale)
VALUES ('9665XXXXXXXX', 'Test User', 'ar')
ON CONFLICT (wa_id) DO NOTHING;
