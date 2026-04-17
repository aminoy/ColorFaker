-- Default canned replies (ar + en) for each category. Operators can edit/add in the UI.

INSERT INTO canned_replies (code, language, title, body, category_code) VALUES
 ('hotel_dates', 'ar', 'طلب تواريخ الحجز',
  'نرجو تزويدنا بتواريخ الإقامة المفضلة، وعدد النزلاء، ورقم التواصل ليتواصل معكم فريق الحجوزات.',
  'hotel_booking'),
 ('hotel_dates', 'en', 'Ask for booking dates',
  'Please share your preferred stay dates, number of guests, and contact number so our reservations team can follow up.',
  'hotel_booking'),
 ('retail_info', 'ar', 'طلب بيانات التأجير',
  'نرجو إرسال نوع النشاط التجاري، والمساحة/نوع الوحدة المفضلة، ورقم التواصل ليتواصل معكم فريق إدارة المول.',
  'retail_leasing'),
 ('retail_info', 'en', 'Ask for leasing details',
  'Please share your business type, preferred unit size/type, and contact number — the mall management team will reach out.',
  'retail_leasing'),
 ('vendor_link', 'ar', 'رابط بوابة الموردين',
  'يرجى التسجيل عبر بوابة الموردين: https://jabalomar.com.sa/en/vendors-portal/ وسيقوم فريق المشتريات بمراجعة ملفكم.',
  'vendor'),
 ('vendor_link', 'en', 'Vendor portal link',
  'Please register on our vendor portal: https://jabalomar.com.sa/en/vendors-portal/ — our procurement team will review your profile.',
  'vendor'),
 ('general_ack', 'ar', 'إشعار استلام استفسار',
  'شكرًا لتواصلكم. تم استلام استفساركم وسيقوم الفريق المختص بالرد في أقرب وقت ممكن.',
  'general_inquiry'),
 ('general_ack', 'en', 'General acknowledgement',
  'Thank you for reaching out — your inquiry has been received and the appropriate team will respond as soon as possible.',
  'general_inquiry')
ON CONFLICT (code, language) DO NOTHING;
