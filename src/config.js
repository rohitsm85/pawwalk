// Single place to customize this app for a different business.
// Everything a new customer needs to change lives here — no other
// file should hardcode a business name, hours, services, or colors.
export const business = {
  name: "PawWalk",
  emoji: "🐾",
  tagline: "Happy walks for happy dogs",
  heroEmoji: "🐶🦮🐕",
  heroSubtitle:
    "Friendly, reliable dog walking in your neighbourhood. Pick a time slot, book in seconds, and we'll take care of the rest.",
  footerNote: "made with love for good dogs",

  colors: {
    primary: "#6b82d6",
    secondary: "#7c4dab",
  },

  // Booking hours and slot size. `start`/`end` are 24h hours.
  hours: {
    weekday: { start: 17, end: 20 },
    weekend: { start: 9, end: 18 },
  },
  slotMinutes: 30,

  services: [
    {
      icon: "🐕",
      title: "Solo Walks",
      desc: "One-on-one attention for your pup, tailored to their pace and energy level.",
    },
    {
      icon: "🐾",
      title: "Half-Hour Slots",
      desc: "Flexible half-hour bookings that fit around your schedule — mornings, evenings, or weekends.",
    },
    {
      icon: "💌",
      title: "Booking Updates",
      desc: "You'll get an email the moment your walk is confirmed, plus a calendar invite so you never miss it.",
    },
  ],

  howItWorks: [
    "Pick a date and an open half-hour slot",
    "We confirm your booking by email",
    "Your pup gets a happy walk!",
  ],
};

export const gradient = `linear-gradient(135deg, ${business.colors.primary} 0%, ${business.colors.secondary} 100%)`;
export const gradientFlat = `linear-gradient(135deg, ${business.colors.primary}, ${business.colors.secondary})`;
