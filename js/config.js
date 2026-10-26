/*
 * KATIEB SUPERMARKET – BUSINESS SETTINGS
 * ------------------------------------------------------------------
 * The business owner edits this file. Leave a value as "" (or null)
 * if it is not known yet: that part is simply hidden or shown as
 * "to be added" on the site. Nothing here is invented – every blank
 * is waiting for real KatieB Supermarket information.
 */
window.KATIEB = {
  name: "KatieB Supermarket",
  tagline: "Your Everyday Shopping, Made Better.",
  currency: "₦",

  // Message in the slim bar above the header. Set to "" to hide the bar.
  // The default tells visitors this is a demo until real data is added.
  // REMOVE OR REPLACE THIS BEFORE LAUNCH.
  announcement: "Demo store: products and prices shown are samples until KatieB Supermarket adds its real catalogue.",

  // Shows "sample product" notes on product pages, cart and checkout.
  // Set to false when the real catalogue is in products.js.
  demoMode: true,

  // WhatsApp number in international format, digits only, no "+".
  // Example (Nigeria): "2348012345678"
  // When set, orders and enquiries are sent to this number through WhatsApp.
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  hours: "",              // e.g. "Mon–Sat 8am–8pm"

  // Full links to your pages, e.g. "https://facebook.com/yourpage"
  social: { facebook: "", instagram: "", tiktok: "", youtube: "", x: "" },

  delivery: {
    coverage: "",         // e.g. "Within Lagos Island" – leave "" until known
    fee: null,            // number (e.g. 1500) or null = "confirmed when we reply"
    freeAbove: null,      // order value for free delivery (number) or null
    note: "",             // extra conditions shown on the Delivery page
    // Options shown at checkout. Remove an entry if you don't offer it.
    options: [
      { id: "delivery", label: "Home delivery" },
      { id: "pickup",   label: "Store pickup" }
    ]
  },

  // Payment options the shop actually offers. EDIT TO MATCH REALITY.
  // Online card payments need a payment provider connected (see README).
  payments: ["Bank transfer", "Payment on delivery"],

  // Set true if you want to insist on an email address at checkout.
  requireEmail: false
};
