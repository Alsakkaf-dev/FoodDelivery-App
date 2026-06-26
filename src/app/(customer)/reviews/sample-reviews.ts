// Engineer #13 — PLACEHOLDER sample reviews for the Reviews screen.
//
// ⚠️ There is NO reviews backend yet: no `reviews` table, no domain action, and the
// domain layer is frozen to me. So the Reviews surface renders from this typed sample
// module purely to deliver the screen's look (overlapping-avatar cards + star rows).
// A request to add a real `reviews` table + domain read is on the TEAM_STATUS ledger;
// when it lands, replace this module with a server fetch and delete the seed.
//
// Bilingual title/body so RTL + Arabic render correctly. Avatars are intentionally
// omitted (no real photos) — the Avatar primitive shows its peach fallback.

export type Review = {
  id: string;
  author: string;
  avatarUrl?: string;
  date: string;
  rating: number;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
};

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Ahmad R.',
    date: '20/12/2025',
    rating: 5,
    title_en: 'Great food and service',
    title_ar: 'طعام وخدمة رائعة',
    body_en: 'So tasty and delicious. Delivered fast to my place. Will order again soon — thank you!',
    body_ar: 'لذيذ جدًا ووصل بسرعة إلى مكاني. سأطلب مرة أخرى قريبًا — شكرًا لكم!',
  },
  {
    id: 'r2',
    author: 'Sara M.',
    date: '18/12/2025',
    rating: 4,
    title_en: 'Awesome and fresh',
    title_ar: 'رائع وطازج',
    body_en: 'Fresh ingredients and generous portions. The shawarma was excellent.',
    body_ar: 'مكونات طازجة وكميات سخية. كان الشاورما ممتازًا.',
  },
  {
    id: 'r3',
    author: 'Yusuf K.',
    date: '15/12/2025',
    rating: 5,
    title_en: 'Best in town',
    title_ar: 'الأفضل في المدينة',
    body_en: 'Consistently good every single time. Highly recommended for family orders.',
    body_ar: 'جيد باستمرار في كل مرة. أنصح به بشدة لطلبات العائلة.',
  },
  {
    id: 'r4',
    author: 'Layla H.',
    date: '11/12/2025',
    rating: 4,
    title_en: 'Tasty and warm',
    title_ar: 'لذيذ ودافئ',
    body_en: 'Arrived warm and well packed. Friendly rider too.',
    body_ar: 'وصل دافئًا ومغلفًا جيدًا. وكان السائق لطيفًا أيضًا.',
  },
  {
    id: 'r5',
    author: 'Omar T.',
    date: '07/12/2025',
    rating: 5,
    title_en: 'Will order again',
    title_ar: 'سأطلب مرة أخرى',
    body_en: 'Quick delivery and the food was delicious. Five stars from me.',
    body_ar: 'توصيل سريع والطعام كان لذيذًا. خمس نجوم مني.',
  },
];
