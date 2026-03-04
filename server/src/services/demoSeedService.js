import mongoose from 'mongoose';
import Business from '../models/Buisness.js';
import Review from '../models/Review.js';
import Snapshot from '../models/Snapshot.js';
import Alert from '../models/Alerts.js';

const daysAgo = (days, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const demoBusinessesTemplate = [
  {
    key: 'urban-brew',
    businessName: 'Urban Brew Coffee - Downtown',
    googlePlaceId: 'demo_place_urban_brew',
    googlePlaceUrl: 'https://maps.google.com/?q=Urban+Brew+Coffee+Downtown',
    address: '120 Main St, Austin, TX 78701',
    phone: '+1 (512) 555-0112',
    category: 'Coffee shop',
    currentRating: 4.4,
    totalReviews: 286,
    lastFetched: daysAgo(0, 9),
  },
  {
    key: 'apex-dental',
    businessName: 'Apex Dental Care',
    googlePlaceId: 'demo_place_apex_dental',
    googlePlaceUrl: 'https://maps.google.com/?q=Apex+Dental+Care+Austin',
    address: '804 Riverside Dr, Austin, TX 78704',
    phone: '+1 (512) 555-0178',
    category: 'Dental clinic',
    currentRating: 4.7,
    totalReviews: 193,
    lastFetched: daysAgo(0, 8),
  },
];

const demoReviewTemplates = {
  'urban-brew': [
    { rating: 2, text: 'Coffee quality dropped this week and service felt rushed.', days: 1, author: 'Emma Carter' },
    { rating: 1, text: 'Waited 22 minutes and still received the wrong order.', days: 2, author: 'Noah Reed' },
    { rating: 5, text: 'Latte art and taste were amazing as always.', days: 3, author: 'Sophia Khan' },
    { rating: 4, text: 'Great vibe and quick checkout during busy hours.', days: 5, author: 'Lucas Green' },
    { rating: 3, text: 'Food was good, but seating area was not clean.', days: 7, author: 'Olivia Hall' },
    { rating: 5, text: 'Best cappuccino in downtown. Friendly baristas.', days: 9, author: 'Mason Lee' },
    { rating: 4, text: 'Good coffee, wish they had more vegan options.', days: 12, author: 'Ava Mitchell' },
    { rating: 5, text: 'Perfect place for work calls and meetings.', days: 15, author: 'Elijah Parker' },
    { rating: 3, text: 'Average experience, music volume was too high.', days: 20, author: 'Mia Scott' },
    { rating: 4, text: 'Consistent quality and reliable staff.', days: 26, author: 'James Turner' },
    { rating: 5, text: 'Loved the seasonal menu and fast service.', days: 32, author: 'Harper White' },
    { rating: 4, text: 'Clean place and convenient location.', days: 40, author: 'Benjamin Young' },
  ],
  'apex-dental': [
    { rating: 5, text: 'Dr. Khan explained every step clearly. Excellent care.', days: 1, author: 'Lily Brooks' },
    { rating: 4, text: 'Friendly team and almost no waiting time.', days: 4, author: 'Henry Foster' },
    { rating: 5, text: 'Very professional clinic and smooth billing process.', days: 6, author: 'Ella Price' },
    { rating: 5, text: 'Teeth cleaning was quick and painless.', days: 8, author: 'Alexander Gray' },
    { rating: 4, text: 'Good overall treatment and clear follow-up advice.', days: 10, author: 'Grace Cox' },
    { rating: 5, text: 'Highly recommend for families and kids.', days: 14, author: 'Daniel Ward' },
    { rating: 3, text: 'Doctor was good but appointment started late.', days: 18, author: 'Scarlett Diaz' },
    { rating: 5, text: 'Clinic is spotless and staff is very welcoming.', days: 22, author: 'Sebastian Ross' },
    { rating: 4, text: 'Reasonable pricing and quality service.', days: 28, author: 'Chloe Evans' },
    { rating: 5, text: 'Emergency appointment handled very well.', days: 35, author: 'Matthew Bennett' },
    { rating: 4, text: 'Great experience overall, easy parking too.', days: 44, author: 'Aria Cooper' },
    { rating: 5, text: 'Best dental care experience in the area.', days: 55, author: 'Logan Rivera' },
  ],
};

const demoSnapshotTemplates = {
  'urban-brew': [
    { days: 56, rating: 4.8, totalReviews: 240, dist: [160, 52, 16, 7, 5] },
    { days: 49, rating: 4.7, totalReviews: 246, dist: [162, 54, 17, 8, 5] },
    { days: 42, rating: 4.7, totalReviews: 252, dist: [165, 55, 18, 8, 6] },
    { days: 35, rating: 4.6, totalReviews: 257, dist: [167, 56, 19, 9, 6] },
    { days: 28, rating: 4.6, totalReviews: 263, dist: [169, 57, 20, 10, 7] },
    { days: 21, rating: 4.5, totalReviews: 269, dist: [170, 58, 21, 11, 9] },
    { days: 14, rating: 4.5, totalReviews: 274, dist: [171, 59, 22, 12, 10] },
    { days: 7, rating: 4.4, totalReviews: 280, dist: [172, 60, 23, 14, 11] },
    { days: 0, rating: 4.4, totalReviews: 286, dist: [173, 61, 24, 16, 12] },
  ],
  'apex-dental': [
    { days: 56, rating: 4.5, totalReviews: 154, dist: [104, 32, 11, 5, 2] },
    { days: 49, rating: 4.5, totalReviews: 158, dist: [106, 33, 11, 5, 3] },
    { days: 42, rating: 4.6, totalReviews: 163, dist: [109, 34, 11, 6, 3] },
    { days: 35, rating: 4.6, totalReviews: 168, dist: [112, 35, 12, 6, 3] },
    { days: 28, rating: 4.6, totalReviews: 173, dist: [116, 35, 12, 6, 4] },
    { days: 21, rating: 4.7, totalReviews: 178, dist: [120, 36, 12, 6, 4] },
    { days: 14, rating: 4.7, totalReviews: 183, dist: [124, 36, 13, 6, 4] },
    { days: 7, rating: 4.7, totalReviews: 188, dist: [128, 37, 13, 6, 4] },
    { days: 0, rating: 4.7, totalReviews: 193, dist: [132, 37, 14, 6, 4] },
  ],
};

const buildReviewId = (userId, businessKey, index) => `demo_${userId}_${businessKey}_${index}`;

const buildReviews = ({ userId, businessId, businessKey }) => {
  const items = demoReviewTemplates[businessKey] || [];
  return items.map((item, index) => ({
    businessId,
    reviewId: buildReviewId(userId, businessKey, index + 1),
    authorName: item.author,
    authorPhotoUrl: '',
    rating: item.rating,
    text: item.text,
    publishedAt: daysAgo(item.days, 11),
    fetchedAt: new Date(),
  }));
};

const buildSnapshots = ({ businessId, businessKey }) => {
  const items = demoSnapshotTemplates[businessKey] || [];

  return items.map((item) => ({
    businessId,
    rating: item.rating,
    totalReviews: item.totalReviews,
    recordedAt: daysAgo(item.days, 9),
    ratingDistribution: {
      fiveStar: item.dist[0],
      fourStar: item.dist[1],
      threeStar: item.dist[2],
      twoStar: item.dist[3],
      oneStar: item.dist[4],
    },
  }));
};

const buildAlerts = ({ userId, businesses }) => {
  const urbanBrew = businesses.find((item) => item.key === 'urban-brew');
  const apexDental = businesses.find((item) => item.key === 'apex-dental');

  return [
    {
      userId,
      businessId: urbanBrew?._id,
      type: 'rating_drop',
      message: `${urbanBrew?.businessName || 'Urban Brew'} rating dropped from 4.6 to 4.4`,
      isRead: false,
      createdAt: daysAgo(1, 10),
      metadata: {
        oldRating: 4.6,
        newRating: 4.4,
        dropValue: 0.2,
        timeframe: 'week',
      },
    },
    {
      userId,
      businessId: urbanBrew?._id,
      type: 'negative_review',
      message: `${urbanBrew?.businessName || 'Urban Brew'} received a 1-star review`,
      isRead: false,
      createdAt: daysAgo(1, 11),
      metadata: {
        rating: 1,
        reviewerName: 'Noah Reed',
        excerpt: 'Waited 22 minutes and still received the wrong order.',
      },
    },
    {
      userId,
      businessId: apexDental?._id,
      type: 'negative_review',
      message: `${apexDental?.businessName || 'Apex Dental'} received a 3-star review`,
      isRead: true,
      createdAt: daysAgo(18, 11),
      metadata: {
        rating: 3,
        reviewerName: 'Scarlett Diaz',
        excerpt: 'Doctor was good but appointment started late.',
      },
    },
    {
      userId,
      type: 'system_update',
      message: 'Successfully updated data for all businesses',
      isRead: true,
      createdAt: daysAgo(0, 8),
      metadata: {
        title: 'Data Refreshed',
        subtext: '12 new reviews added',
        newReviews: 12,
      },
    },
  ].filter((item) => item.businessId || item.type === 'system_update');
};

const clearExistingData = async (userId) => {
  const businesses = await Business.find({ userId }).select('_id').lean();
  const businessIds = businesses.map((item) => item._id);

  await Promise.all([
    Review.deleteMany({ businessId: { $in: businessIds } }),
    Snapshot.deleteMany({ businessId: { $in: businessIds } }),
    Alert.deleteMany({ userId }),
    Business.deleteMany({ userId }),
  ]);
};

export const ensureDemoDataForUser = async ({ userId, force = false } = {}) => {
  const normalizedUserId = String(userId || '').trim();
  if (!mongoose.Types.ObjectId.isValid(normalizedUserId)) {
    throw new Error('Valid userId is required for seeding');
  }

  if (!force) {
    const existingDemoBusinessCount = await Business.countDocuments({
      userId: normalizedUserId,
      googlePlaceId: { $in: demoBusinessesTemplate.map((item) => item.googlePlaceId) },
    });

    if (existingDemoBusinessCount > 0) {
      return {
        seeded: false,
        reason: 'already_seeded',
        businessesCreated: 0,
      };
    }
  }

  if (force) {
    await clearExistingData(normalizedUserId);
  }

  const createdBusinesses = await Business.insertMany(
    demoBusinessesTemplate.map((template) => ({
      userId: normalizedUserId,
      businessName: template.businessName,
      googlePlaceId: template.googlePlaceId,
      googlePlaceUrl: template.googlePlaceUrl,
      address: template.address,
      phone: template.phone,
      category: template.category,
      currentRating: template.currentRating,
      totalReviews: template.totalReviews,
      lastFetched: template.lastFetched,
    }))
  );

  const businessByKey = new Map(
    createdBusinesses.map((business, index) => [demoBusinessesTemplate[index].key, business])
  );

  const allReviews = [];
  const allSnapshots = [];

  for (const template of demoBusinessesTemplate) {
    const business = businessByKey.get(template.key);
    if (!business) continue;

    allReviews.push(
      ...buildReviews({
        userId: normalizedUserId,
        businessId: business._id,
        businessKey: template.key,
      })
    );

    allSnapshots.push(
      ...buildSnapshots({
        businessId: business._id,
        businessKey: template.key,
      })
    );
  }

  if (allReviews.length > 0) {
    await Review.insertMany(allReviews, { ordered: true });
  }

  if (allSnapshots.length > 0) {
    await Snapshot.insertMany(allSnapshots, { ordered: true });
  }

  await Alert.insertMany(
    buildAlerts({
      userId: normalizedUserId,
      businesses: demoBusinessesTemplate.map((template) => ({
        key: template.key,
        _id: businessByKey.get(template.key)?._id,
        businessName: template.businessName,
      })),
    })
  );

  return {
    seeded: true,
    reason: force ? 'force_seeded' : 'seeded_for_empty_account',
    businessesCreated: createdBusinesses.length,
  };
};
