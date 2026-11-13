/* ============================================================
   RESTAURANT SETTINGS  —  edit this file, commit, and Cloudflare redeploys.
   Customers' phones read these values, so they MUST live here
   (not in the dashboard).
   ============================================================ */
window.QR_CONFIG = {
  restaurants: [
    {
      id: 'bamboo',
      slug: 'bamboo',                       // customer link: yoursite.com/r/bamboo
      name: 'Bamboo Restaurant',
      area: 'Kankanady, Mangalore',
      reviewUrl: 'https://www.zomato.com/mangalore/bamboo-restaurant-kankanady/reviews',
      whatsapp: '919964372055',             // <-- owner's number: country code + number, digits only (e.g. 919876543210)
      minRatingForPublic: 3,                // 3, 4, 5 stars -> Zomato.  1, 2 stars -> WhatsApp to owner
      active: true
    }
  ]
};
