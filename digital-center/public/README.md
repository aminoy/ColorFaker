# Static assets

Drop your JODNA logo here so the app picks it up everywhere
(brand bar, splash screen, anywhere `<BrandLogo />` is used).

## Logo

Save the file at:

```
digital-center/public/jodna-logo.png
```

Requirements:

- White-on-transparent (PNG with alpha channel, or SVG).
- Anything else works too — just keep the background transparent so
  it sits cleanly on the dark midnight bar.
- Square or wide is fine; the component preserves aspect ratio.

If you'd rather use an SVG, save it as `jodna-logo.svg` and update
the `src` in `src/components/BrandLogo.tsx` from `.png` → `.svg`.

Anything you put in this folder is served from the site root, e.g.
`public/jodna-logo.png` is reachable at `/jodna-logo.png` at runtime.
