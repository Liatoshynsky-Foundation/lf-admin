import type { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  await db.collection('pages').updateOne({ slug: 'about-us' }, {
    $set: {
      blocksOrder: [
        'intro', 'foundation', 'mission', 'goals', 'office', 'what-we-do', 'founders'
      ]
    }
  });
  await db.collection('pages').updateOne({ slug: 'research' }, {
    $set: {
      blocksOrder: [
        'HeroSection'
      ]
    }
  });
  
  await db.collection('pages').updateOne({ slug: 'privacy-policy' }, {
    $set: {
      blocksOrder: [
        'IntroSection', 
        'DataWeCollect', 
        'DataUsage', 
        'Cookies', 
        'GoogleAuth', 
        'SocialNetworks', 
        'TargetedAds', 
        'NewsletterSubscription', 
        'DataRetention', 
        'UserRights', 
        'ContactUs', 
      ]
    }
  });

  await db.collection('pages').updateOne({ slug: 'biography' }, {
    $set: {
      blocksOrder: [
        'heroSection', 
        'biographyContent', 
        'LiatoshynskyOffice', 
      ]
    }
  });

  await db.collection('pages').updateOne({ slug: 'cooperation' }, {
    $set: {
      blocksOrder: [
        'partnershipFormats'
      ]
    }
  });
  
}

export async function down(db: Db): Promise<void> {
  await db.collection('pages').updateMany({}, {
    $unset: {
      blocksOrder: ''
    }
  });
}
