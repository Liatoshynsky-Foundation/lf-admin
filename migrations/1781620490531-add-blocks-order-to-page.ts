import type { Db } from 'mongodb';

const PAGE_CONFIGS = [
  {
    slug: 'about-us',
    blocksOrder: ['intro', 'foundation', 'mission', 'goals', 'office', 'what-we-do', 'founders']
  },
  {
    slug: 'research',
    blocksOrder: ['HeroSection']
  },
  {
    slug: 'privacy-policy',
    blocksOrder: [
      'IntroSection', 'DataWeCollect', 'DataUsage', 'Cookies', 'GoogleAuth',
      'SocialNetworks', 'TargetedAds', 'NewsletterSubscription', 'DataRetention',
      'UserRights', 'ContactUs'
    ]
  },
  {
    slug: 'biography',
    blocksOrder: ['heroSection', 'biographyContent', 'LiatoshynskyOffice']
  },
  {
    slug: 'cooperation',
    blocksOrder: ['partnershipFormats']
  }
];

const TARGET_COLLECTIONS = ['pages', 'draftpages'];

export async function up(db: Db): Promise<void> {
  for (const col of TARGET_COLLECTIONS) {
    const updates = PAGE_CONFIGS.map((config) =>
      db.collection(col).updateOne(
        { slug: config.slug },
        { $set: { blocksOrder: config.blocksOrder } }
      )
    );

    await Promise.all(updates);
  }
}

export async function down(db: Db): Promise<void> {
  for (const col of TARGET_COLLECTIONS) {
    await db.collection(col).updateMany({}, {
      $unset: {
        blocksOrder: ''
      }
    });
  }
}
