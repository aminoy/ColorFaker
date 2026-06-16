# المدى القريب — Website UI/UX Redesign

A professional, modern redesign of the [almadalkareeb.com](https://almadalkareeb.com/)
storefront — an Arabic e-commerce shop in Jeddah, Saudi Arabia selling
smartphones, smart devices, and accessories.

This is a self-contained, dependency-free static site (HTML + CSS + vanilla JS)
built from scratch as a clean redesign reference. It is **not** wired to the
original site's backend.

## Highlights

- **Arabic-first, fully RTL** layout with the Cairo + Tajawal typefaces.
- **Responsive** from large desktop down to mobile, including a mobile bottom
  nav, slide-in menu, and floating WhatsApp button.
- **Cohesive design system** — CSS custom properties for color, spacing,
  radius, and shadow (navy + indigo brand with a warm accent).
- **Interactive components** (no frameworks):
  - Product grid with New / Best-sellers / Offers tabs
  - Add-to-cart with a live cart drawer, quantity controls, and totals
  - Slide-in mobile navigation and backdrop
  - Search bar, brand & category browsing, testimonials, newsletter
- **Faithful content**: real categories (جوالات، سماعات، شواحن، حماية)،
  brands (Apple, Samsung, Xiaomi, Honor, OPPO, Oukitel), free shipping,
  Tabby/Tamara installments, 24/7 support, and the Jeddah branch address.
- **Accessible**: semantic landmarks, keyboard `Esc` to close panels, focus
  states, `prefers-reduced-motion` support, and ARIA labels.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page markup and content |
| `styles.css` | Design system + all component styles |
| `script.js`  | Cart, tabs, drawers, and UI behavior |

## Run it

No build step. Open `index.html` directly, or serve the folder:

```bash
cd website
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Notes

Product images are rendered as lightweight CSS/SVG device placeholders so the
page has zero external image dependencies. Swap them for real product photos
by replacing the `.card__phone` / `.device` elements when integrating with a
real catalog.
