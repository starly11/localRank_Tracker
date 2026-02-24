import cron from 'node-cron';
import Business from '../models/Buisness.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { refreshBusinessForUser } from '../controllers/buisnessController.js';
import { sendWeeklyDigestEmail } from '../services/emailService.js';

const SERPAPI_CACHE_HOURS = Number(process.env.SERPAPI_CACHE_HOURS || 24);
const DAILY_REFRESH_BUSINESS_LIMIT = Number(process.env.DAILY_REFRESH_BUSINESS_LIMIT || 20);
const CRON_TIMEZONE = process.env.CRON_TIMEZONE || 'UTC';

const buildWeeklyDigestHtml = ({ businesses, reviewsLastWeek }) => {
  const totalBusinesses = businesses.length;
  const totalReviews = businesses.reduce((sum, b) => sum + (Number(b.totalReviews) || 0), 0);
  const weightedRating = businesses.reduce(
    (sum, b) => sum + (Number(b.currentRating) || 0) * (Number(b.totalReviews) || 0),
    0
  );
  const avgRating = totalReviews > 0 ? (weightedRating / totalReviews).toFixed(2) : '0.00';

  const topReview = reviewsLastWeek[0];

  return `
    <ul>
      <li>Tracked businesses: <strong>${totalBusinesses}</strong></li>
      <li>Current average rating: <strong>${avgRating}</strong></li>
      <li>Total reviews: <strong>${totalReviews}</strong></li>
      <li>New reviews this week: <strong>${reviewsLastWeek.length}</strong></li>
    </ul>
    ${
      topReview
        ? `<p><strong>Notable review:</strong> "${String(topReview.text || '').slice(0, 180)}" - ${topReview.authorName}</p>`
        : '<p>No new reviews captured this week.</p>'
    }
  `;
};

export const runDailyRefreshJob = async () => {
  const cutoff = new Date(Date.now() - SERPAPI_CACHE_HOURS * 60 * 60 * 1000);

  const staleBusinesses = await Business.find({
    $or: [{ lastFetched: { $exists: false } }, { lastFetched: { $lte: cutoff } }],
  })
    .sort({ lastFetched: 1 })
    .limit(DAILY_REFRESH_BUSINESS_LIMIT)
    .select('_id userId');

  for (const business of staleBusinesses) {
    try {
      await refreshBusinessForUser({
        userId: business.userId,
        businessId: business._id,
        force: true,
        trigger: 'cron',
      });
    } catch (error) {
      console.error(`[cron] Failed daily refresh for business ${business._id}:`, error.message);
    }
  }

  console.log(`[cron] Daily refresh completed for ${staleBusinesses.length} businesses`);
};

export const runWeeklyDigestJob = async () => {
  const users = await User.find({
    'settings.weeklyDigest': true,
  }).select('_id name email');

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  for (const user of users) {
    try {
      const businesses = await Business.find({ userId: user._id }).lean();
      if (!businesses.length) continue;

      const businessIds = businesses.map((business) => business._id);
      const reviewsLastWeek = await Review.find({
        businessId: { $in: businessIds },
        publishedAt: { $gte: weekStart },
      })
        .sort({ publishedAt: -1 })
        .limit(20)
        .lean();

      const digestHtml = buildWeeklyDigestHtml({ businesses, reviewsLastWeek });

      await sendWeeklyDigestEmail({
        to: user.email,
        name: user.name,
        digest: digestHtml,
      });
    } catch (error) {
      console.error(`[cron] Failed weekly digest for user ${user._id}:`, error.message);
    }
  }

  console.log(`[cron] Weekly digest processed for ${users.length} users`);
};

export const startScheduledJobs = () => {
  cron.schedule('0 0 * * *', runDailyRefreshJob, { timezone: CRON_TIMEZONE });
  cron.schedule('0 9 * * 1', runWeeklyDigestJob, { timezone: CRON_TIMEZONE });
  console.log(`[cron] Scheduled jobs started (timezone: ${CRON_TIMEZONE})`);
};
