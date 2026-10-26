# KatieB Supermarket website

A static online-shop front end (no build step). Open `index.html`, or deploy the folder to Render, Netlify, GitHub Pages, etc. It uses `#/...` addresses, so no server rewrite rules are needed.

## What the owner edits
| File | What it controls |
|---|---|
| `js/config.js` | WhatsApp number, phone, email, address, opening hours, social links, delivery area/fees, payment options, announcement bar, demo-mode switch |
| `js/products.js` | Categories and every product: name, price, unit, optional `salePrice`, featured flag, image |

**All products, prices and offers shipped here are SAMPLES.** Replace them, then set `demoMode: false` and clear/replace `announcement` in `config.js`.

## Taking real orders
There is no server. Until one is connected:
- If `whatsapp` is set in `config.js`, checkout and the contact form open WhatsApp with the order/message ready to send. The order is only real once KatieB replies. Nothing is paid on the site.
- If `whatsapp` is empty, checkout is a clearly labelled **demo** and submits nothing.

To take orders and online payments you need: (1) a backend or service to receive orders (e.g. Supabase, Firebase, or a Lovable/Node backend), (2) a payment provider such as Paystack or Flutterwave, (3) customer accounts if wanted. Card details must only ever be handled by the payment provider.

## Adding product photos
Put the photo in a folder, run the same resize step used here (WebP at widths like 360 and 720), and list it in `js/images.js` (`"key": {"w":[360,720],"ratio":1.3333}`), then set `image: "key"` on the product. Products with `image: null` show a "Photo coming soon" tile.

## Photos
The photographs supplied are generic stock images, used for illustration. They are not pictures of a KatieB branch. Product tiles are close-up crops of those stock photos; replace them with real product photos when available. Check each photo's licence permits commercial use.

## Deploying on Render
New → Blueprint → select the repo (uses `render.yaml`), or New → Static Site with an empty build command and publish directory `.`.
