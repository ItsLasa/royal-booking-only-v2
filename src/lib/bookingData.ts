export const fallbackPackages = [
  {
    id: "pkg_suite_honeymoon",
    slug: "suite-honeymoon",
    name: "Suite Honeymoon",
    shortDescription: "Our premier honeymoon offering with utmost privacy.",
    basePrice: 45000,
    includedAdults: 2,
    maximumGuests: 2,
    minimumNights: 1,
    mealPlan: "Breakfast included + Romantic Dinner",
  },
  {
    id: "pkg_double_honeymoon",
    slug: "one-double-room-honeymoon",
    name: "One Double Room Honeymoon",
    shortDescription: "Intimate hillside luxury double room.",
    basePrice: 35000,
    includedAdults: 2,
    maximumGuests: 2,
    minimumNights: 1,
    mealPlan: "Breakfast included",
  },
  {
    id: "pkg_family_suite",
    slug: "4br-villa-family-suite",
    name: "4BR Villa + Family Suite",
    shortDescription: "Ultimate family escape with expansive spaces.",
    basePrice: 95000,
    includedAdults: 8,
    maximumGuests: 10,
    minimumNights: 2,
    mealPlan: "Breakfast included",
  },
  {
    id: "pkg_4br_villa",
    slug: "full-villa-stay",
    name: "4BR Villa (Group Luxury)",
    shortDescription: "Exclusive 4-bedroom estate for private groups.",
    basePrice: 75000,
    includedAdults: 6,
    maximumGuests: 10,
    minimumNights: 1,
    mealPlan: "Room only (Chef available)",
  },
  {
    id: "pkg_double_room",
    slug: "one-double-room",
    name: "One Double Room",
    shortDescription: "Essential serenity with panoramic mountain views.",
    basePrice: 20000,
    includedAdults: 2,
    maximumGuests: 2,
    minimumNights: 1,
    mealPlan: "Room only",
  },
];

export const fallbackAddOns = [
  "Gourmet Breakfast",
  "Hillside Live BBQ Feast with Chef",
  "Airport Luxury Van Transfer",
  "Romantic Floral & Candlelight Decor",
  "Extra Rollaway Bed with Linens",
];

export const lkr = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
