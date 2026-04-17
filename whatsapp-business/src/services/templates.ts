import { env } from "../config/env";
import type { CategoryCode, Language } from "../types/domain";

/**
 * Reply templates. Arabic-first with English fallback.
 * Kept as plain strings so translators / content owners can edit easily.
 */

export function welcome(language: Language | null = "ar"): string {
  const ar = [
    `مرحبًا بك في ${env.COMPANY_NAME_AR}. 👋`,
    "نرجو اختيار نوع الاستفسار من القائمة التالية بالرد برقم الخيار:",
    "",
    "1) حجوزات الفنادق",
    "2) تأجير المحلات أو الأكشاك",
    "3) الموردين ومقدمي الخدمات",
    "4) استفسار عام",
    "",
    "يمكنك الكتابة بالعربية أو بالإنجليزية."
  ].join("\n");

  const en = [
    `Welcome to ${env.COMPANY_NAME_EN}. 👋`,
    "Please reply with the number of your inquiry type:",
    "",
    "1) Hotel booking",
    "2) Retail leasing (shops / kiosks)",
    "3) Vendors / service providers",
    "4) General inquiry",
    "",
    "You can write in Arabic or English."
  ].join("\n");

  return language === "en" ? en : `${ar}\n\n— — —\n\n${en}`;
}

export function invalidOption(language: Language | null = "ar"): string {
  const ar = "لم نتعرف على خيارك. الرجاء الرد برقم من 1 إلى 4.";
  const en = "We couldn't recognize your option. Please reply with a number from 1 to 4.";
  return language === "en" ? en : `${ar}\n${en}`;
}

export function acknowledgement(category: CategoryCode, language: Language | null = "ar"): string {
  switch (category) {
    case "hotel_booking": {
      const ar =
        "تم استلام طلب حجز الفندق وسيتم إحالته إلى الفريق المختص. " +
        "يرجى تزويدنا بالاسم الكامل، وتواريخ الإقامة المفضلة، وعدد النزلاء، ورقم التواصل.";
      const en =
        "Your hotel booking request has been received and will be forwarded to the concerned team. " +
        "Please share your full name, preferred stay dates, number of guests, and contact number.";
      return language === "en" ? en : `${ar}\n\n${en}`;
    }
    case "retail_leasing": {
      const ar =
        "تم استلام طلب التأجير وسيتواصل معكم فريق إدارة المول. " +
        "يرجى إرسال الاسم الكامل، ونوع النشاط التجاري، ونوع الوحدة المفضلة، ورقم التواصل.";
      const en =
        "Your leasing request has been received and the mall management team will contact you. " +
        "Please share your full name, business type, preferred unit type, and contact number.";
      return language === "en" ? en : `${ar}\n\n${en}`;
    }
    case "vendor": {
      const ar =
        "يسعدنا اهتمامكم. يرجى تسجيل شركتكم عبر بوابة الموردين: " +
        `${env.VENDOR_PORTAL_URL}\n` +
        "يمكنكم أيضًا إرسال اسم الشركة وبيانات التواصل هنا وسنقوم بالرد.";
      const en =
        "Thank you for your interest. Please register via the vendor portal: " +
        `${env.VENDOR_PORTAL_URL}\n` +
        "You can also share your company name and contact details here.";
      return language === "en" ? en : `${ar}\n\n${en}`;
    }
    case "general_inquiry": {
      const ar =
        "تم استلام استفساركم وسيقوم الفريق المختص بمراجعته والرد في أقرب وقت.";
      const en = "Your inquiry has been received and will be reviewed by the appropriate team.";
      return language === "en" ? en : `${ar}\n\n${en}`;
    }
  }
}

export function humanHandoff(language: Language | null = "ar"): string {
  const ar =
    "تم تحويل المحادثة إلى أحد ممثلي خدمة العملاء وسيتم التواصل معكم في أقرب وقت ممكن. شكرًا لتواصلكم.";
  const en =
    "Your conversation has been escalated to a customer service representative. We will contact you shortly. Thank you.";
  return language === "en" ? en : `${ar}\n\n${en}`;
}

export function thankYou(language: Language | null = "ar"): string {
  const ar = "شكرًا لتواصلكم مع " + env.COMPANY_NAME_AR + ".";
  const en = "Thank you for contacting " + env.COMPANY_NAME_EN + ".";
  return language === "en" ? en : `${ar}\n${en}`;
}
