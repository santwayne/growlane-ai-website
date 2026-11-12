# Growlane AI — Website

Multi-page marketing website for **Growlane AI**. Plain HTML, CSS and JavaScript — no build step, no dependencies. Upload the folder to any static host (Vercel, Netlify, cPanel, S3, GitHub Pages) and it works.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Services | `services.html` |
| How It Works | `how-it-works.html` |
| Industries | `industries.html` |
| Pricing (+ FAQ) | `pricing.html` |
| About | `about.html` |
| Careers | `careers.html` |
| Contact | `contact.html` |
| Book a Demo | `demo.html` |
| Privacy Policy | `privacy.html` |
| Terms of Service | `terms.html` |
| 404 | `404.html` |

## Structure

```
assets/
  css/style.css        all styles
  js/main.js           menu, FAQ, pricing toggle, tabs, forms
  img/growlane-logo.png  logo (transparent PNG)
  img/favicon.png, apple-touch-icon.png
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Connecting email (to do)

Forms (contact, demo, careers, newsletter) validate and show a success message, but don't send anywhere yet. When the email/form service is ready, open `assets/js/main.js` and fill in:

```js
const SITE_CONFIG = {
  FORM_ENDPOINT: "https://formspree.io/f/xxxx", // where form data is POSTed as JSON
  CONTACT_EMAIL: "hello@yourdomain.com",        // shown on the Contact page
};
```

## Editing content

- Prices are in `pricing.html` (`data-monthly` / `data-yearly` attributes on each price).
- Open roles are in `careers.html`.
