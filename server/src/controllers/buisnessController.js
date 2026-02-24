import { getBusinessDetails, getBusinessReviews, getSerpApiUsage } from '../services/serpApiService.js';
import { sendNegativeReviewAlertEmail } from '../services/emailService.js';
import Business from '../models/Buisness.js';
import Review from '../models/Review.js';
import Snapshot from '../models/Snapshot.js';
import Alert from '../models/Alerts.js';
import User from '../models/User.js';

const SERPAPI_CACHE_HOURS = Number(process.env.SERPAPI_CACHE_HOURS || 24);

const resolveBusinessError = (error) => {
  const code = Number(error?.code || 0);
  const message = error?.message || 'Business operation failed';

  if (code === 11000) {
    return {
      status: 409,
      message: 'This business is already tracked (duplicate key).',
    };
  }

  if (error?.name === 'ValidationError') {
    return {
      status: 400,
      message: message || 'Validation failed while saving business data',
    };
  }

  if (message.includes('Invalid API key')) {
    return { status: 400, message: 'Invalid SerpAPI key. Update SERPAPI_KEY in server/.env' };
  }

  if (message.includes('SerpAPI budget exhausted')) {
    return { status: 429, message };
  }

  if (message.includes('SERPAPI_KEY is not configured')) {
    return { status: 503, message: 'SERPAPI_KEY is not configured on server' };
  }

  if (
    ['ETIMEDOUT', 'ENETUNREACH', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'SERPAPI_NETWORK'].includes(
      String(error?.code || '')
    ) ||
    message.includes('Unable to reach SerpAPI') ||
    /ETIMEDOUT|ENETUNREACH|ECONNRESET|ECONNREFUSED|EAI_AGAIN|connect timeout/i.test(message)
  ) {
    return { status: 503, message: 'SerpAPI is temporarily unreachable. Please try again in a moment.' };
  }

  if (message.includes('No business found')) {
    return {
      status: 404,
      message:
        'Google has not returned any result for this search. Try your business name + city or a different Google Maps share link.',
    };
  }

  return { status: 500, message };
};

const isValidPlaceInput = (value = '') => {
  const input = String(value).trim();
  return input.startsWith('ChIJ') || input.includes('maps.google') || input.includes('maps.app.goo.gl');
};

const parseRelativeDate = (value) => {
  const text = String(value || '').toLowerCase().trim();
  if (!text) return null;

  if (text === 'today' || text === 'just now') return new Date();
  if (text === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  const match = text.match(/(\d+|an|a)\s+(minute|hour|day|week|month|year)s?\s+ago/);
  if (!match) return null;

  const amount = match[1] === 'a' || match[1] === 'an' ? 1 : Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const d = new Date();
  const unit = match[2];

  if (unit === 'minute') d.setMinutes(d.getMinutes() - amount);
  if (unit === 'hour') d.setHours(d.getHours() - amount);
  if (unit === 'day') d.setDate(d.getDate() - amount);
  if (unit === 'week') d.setDate(d.getDate() - amount * 7);
  if (unit === 'month') d.setMonth(d.getMonth() - amount);
  if (unit === 'year') d.setFullYear(d.getFullYear() - amount);

  return d;
};

const toPublishedDate = (rawReview = {}) => {
  const candidateValues = [
    rawReview?.iso_date,
    rawReview?.datetime_utc,
    rawReview?.date,
    rawReview?.relative_date,
  ];

  for (const value of candidateValues) {
    if (!value) continue;

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const relative = parseRelativeDate(value);
    if (relative && !Number.isNaN(relative.getTime())) return relative;
  }

  return new Date();
};

const countByRating = (reviews = []) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const rating = Number(review.rating);
    if (rating >= 1 && rating <= 5) counts[rating] += 1;
  }
  return counts;
};

const toDistributionPayload = (counts, total) => {
  const safeTotal = total > 0 ? total : 1;

  return [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star] || 0;
    return {
      star,
      count,
      percent: Number(((count / safeTotal) * 100).toFixed(1)),
    };
  });
};

const buildTrendFromReviews = (reviews = []) => {
  if (!reviews.length) return [];

  const byDate = new Map();

  for (const review of reviews) {
    const date = new Date(review?.publishedAt);
    if (Number.isNaN(date.getTime())) continue;

    const key = date.toISOString().split('T')[0];
    const current = byDate.get(key) || { sum: 0, count: 0 };
    current.sum += Number(review.rating) || 0;
    current.count += 1;
    byDate.set(key, current);
  }

  const ordered = Array.from(byDate.entries()).sort(([a], [b]) => new Date(a) - new Date(b));
  return ordered.map(([date, value]) => ({
    date,
    rating: Number((value.sum / value.count).toFixed(2)),
  }));
};

const saveSnapshot = async (businessId, rating, totalReviews, counts) => {
  const countedReviews =
    (counts[1] || 0) + (counts[2] || 0) + (counts[3] || 0) + (counts[4] || 0) + (counts[5] || 0);
  const safeTotalReviews = Math.max(Number(totalReviews) || 0, countedReviews);

  await Snapshot.create({
    businessId,
    rating: Number(rating) || 0,
    totalReviews: safeTotalReviews,
    recordedAt: new Date(),
    ratingDistribution: {
      fiveStar: counts[5] || 0,
      fourStar: counts[4] || 0,
      threeStar: counts[3] || 0,
      twoStar: counts[2] || 0,
      oneStar: counts[1] || 0,
    },
  });
};

const persistReviews = async (businessId, sourceReviews = []) => {
  if (!sourceReviews.length) return;

  const ops = sourceReviews
    .map((rev, index) => {
      const rating = Number(rev.rating) || 0;
      const reviewId = rev.review_id || rev.link || `${businessId}-${index}`;

      if (!reviewId || rating < 1 || rating > 5) return null;

      return {
        updateOne: {
          filter: { reviewId },
          update: {
            $set: {
              businessId,
              reviewId,
              authorName: rev.user?.name || 'Anonymous',
              authorPhotoUrl: rev.user?.thumbnail,
              rating,
              text: rev.snippet || '',
              publishedAt: toPublishedDate(rev),
              fetchedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (ops.length) {
    await Review.bulkWrite(ops, { ordered: false });
  }
};

const isRefreshStale = (business, force = false) => {
  if (force) return true;
  const lastFetched = business?.lastFetched ? new Date(business.lastFetched) : null;
  if (!lastFetched || Number.isNaN(lastFetched.getTime())) return true;

  const ageMs = Date.now() - lastFetched.getTime();
  const maxAgeMs = SERPAPI_CACHE_HOURS * 60 * 60 * 1000;
  return ageMs >= maxAgeMs;
};

export const refreshBusinessForUser = async ({ userId, businessId, force = false, trigger = 'manual' }) => {
  const business = await Business.findOne({ _id: businessId, userId });
  if (!business) {
    return { success: false, status: 404, message: 'Business not found' };
  }

  if (!isRefreshStale(business, force)) {
    return {
      success: true,
      skipped: true,
      message: `Using cached data. Next refresh available after ${SERPAPI_CACHE_HOURS} hours.`,
      data: business,
    };
  }

  const user = await User.findById(userId).select('settings email name').lean();
  const settings = user?.settings || {};

  const previousRating = Number(business.currentRating) || 0;
  const previousTotalReviews = Number(business.totalReviews) || 0;

  const latestBusiness = await getBusinessDetails({
    placeInput: business.googlePlaceId,
    businessName: business.businessName,
  });

  const latestReviews = await getBusinessReviews(business.googlePlaceId);
  const existingReviewIds = new Set(
    (await Review.find({ businessId: business._id }).select('reviewId').lean()).map((review) => review.reviewId)
  );

  const newReviewsRaw = latestReviews.filter((review, index) => {
    const reviewId = review.review_id || review.link || `${business._id}-${index}`;
    return reviewId && !existingReviewIds.has(reviewId);
  });

  await persistReviews(business._id, latestReviews);

  business.currentRating = Number(latestBusiness.rating) || business.currentRating;
  business.totalReviews = Number(latestBusiness.reviews) || business.totalReviews;
  business.address = latestBusiness.address || business.address;
  business.phone = latestBusiness.phone || business.phone;
  business.category = latestBusiness.type || business.category;
  business.lastFetched = new Date();
  await business.save();

  const allReviews = await Review.find({ businessId: business._id }).select('rating').lean();
  const counts = countByRating(allReviews);
  await saveSnapshot(business._id, business.currentRating, business.totalReviews, counts);

  const ratingDrop = Number((previousRating - business.currentRating).toFixed(2));
  if (settings.ratingDropAlerts !== false && ratingDrop >= 0.1) {
    await Alert.create({
      userId,
      businessId: business._id,
      type: 'rating_drop',
      message: `${business.businessName} rating dropped from ${previousRating.toFixed(1)} to ${Number(
        business.currentRating
      ).toFixed(1)}`,
      metadata: {
        oldRating: previousRating,
        newRating: business.currentRating,
        dropValue: ratingDrop,
        timeframe: 'week',
      },
    });
  }

  if (settings.negativeReviewAlerts !== false) {
    const negativeNewReviews = newReviewsRaw.filter((review) => Number(review.rating) <= 3);
    if (negativeNewReviews.length) {
      const newestNegative = negativeNewReviews[0];
      const rating = Number(newestNegative.rating);
      const reviewerName = newestNegative.user?.name || 'Anonymous';
      const excerpt = String(newestNegative.snippet || '').slice(0, 120);

      await Alert.create({
        userId,
        businessId: business._id,
        type: 'negative_review',
        message: `${business.businessName} received a ${rating}-star review`,
        metadata: {
          rating,
          reviewerName,
          excerpt,
        },
      });

      await sendNegativeReviewAlertEmail({
        to: user?.email,
        businessName: business.businessName,
        rating,
        reviewerName,
        excerpt,
      });
    }
  }

  if (trigger === 'manual') {
    const newReviewsCount = Math.max(0, (Number(business.totalReviews) || 0) - previousTotalReviews);
    await Alert.create({
      userId,
      type: 'system_update',
      message: 'Successfully updated data for all businesses',
      metadata: {
        title: 'Data Refreshed',
        subtext: `${newReviewsCount} new reviews added`,
        newReviews: newReviewsCount,
      },
    });
  }

  return {
    success: true,
    skipped: false,
    message: 'Business refreshed',
    data: business,
  };
};

export const addBusiness = async (req, res) => {
  try {
    const { businessName, placeInput } = req.body || {};

    if (!businessName || String(businessName).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    if (!placeInput || !isValidPlaceInput(placeInput)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Google Maps URL' });
    }

    const businessData = await getBusinessDetails({ placeInput, businessName });

    const existing = await Business.findOne({
      userId: req.user.id,
      googlePlaceId: businessData.data_id,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already tracking this business' });
    }

    const newBusiness = await Business.create({
      userId: req.user.id,
      googlePlaceId: businessData.data_id,
      googlePlaceUrl: placeInput,
      businessName: String(businessName).trim() || businessData.title,
      address: businessData.address,
      phone: businessData.phone,
      category: businessData.type,
      currentRating: Number(businessData.rating) || 0,
      totalReviews: Number(businessData.reviews) || 0,
      lastFetched: new Date(),
    });

    try {
      const reviews = await getBusinessReviews(businessData.data_id);
      await persistReviews(newBusiness._id, reviews);

      const storedReviews = await Review.find({ businessId: newBusiness._id }).select('rating').lean();
      const counts = countByRating(storedReviews);

      await saveSnapshot(newBusiness._id, newBusiness.currentRating, newBusiness.totalReviews, counts);
    } catch (dataError) {
      // Don't fail business creation if review/snapshot sync partially fails.
      console.error('[addBusiness] post-create sync failed:', dataError?.message || dataError);
    }

    return res.status(201).json({
      success: true,
      data: newBusiness,
    });
  } catch (error) {
    console.error('[addBusiness] failed:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    const err = resolveBusinessError(error);
    return res.status(err.status).json({ success: false, message: err.message });
  }
};

export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: businesses });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to fetch businesses' });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { businessName } = req.body || {};

    if (!businessName || String(businessName).trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    const updated = await Business.findOneAndUpdate(
      { _id: businessId, userId: req.user.id },
      { $set: { businessName: String(businessName).trim() } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update business' });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOneAndDelete({ _id: businessId, userId: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    await Promise.all([
      Review.deleteMany({ businessId: business._id }),
      Snapshot.deleteMany({ businessId: business._id }),
      Alert.deleteMany({ businessId: business._id, userId: req.user.id }),
    ]);

    return res.status(200).json({ success: true, message: 'Business deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete business' });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { businessId = 'all' } = req.query;

    const userBusinesses = await Business.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!userBusinesses.length) {
      return res.status(200).json({
        success: true,
        data: {
          businesses: [],
          selectedBusinessId: 'all',
          hasMultipleBusinesses: false,
          stats: {
            currentRating: 0,
            totalReviews: 0,
            weeklyReviews: 0,
            monthlyChange: 0,
            monthlyPreviousRating: 0,
            monthlyCurrentRating: 0,
            lastUpdated: null,
          },
          trend: [],
          distribution: toDistributionPayload({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, 0),
          recentReviews: [],
          unreadAlertsCount: 0,
        },
      });
    }

    const isAll = businessId === 'all';
    const selectedBusinesses = isAll
      ? userBusinesses
      : userBusinesses.filter((business) => String(business._id) === String(businessId));

    if (!selectedBusinesses.length) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const selectedBusinessIds = selectedBusinesses.map((business) => business._id);

    const [reviews, snapshots, unreadAlertsCount] = await Promise.all([
      Review.find({ businessId: { $in: selectedBusinessIds } })
        .sort({ publishedAt: -1 })
        .lean(),
      Snapshot.find({ businessId: { $in: selectedBusinessIds } })
        .sort({ recordedAt: 1 })
        .lean(),
      Alert.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    const totalReviewCountFromBusinesses = selectedBusinesses.reduce(
      (sum, business) => sum + (Number(business.totalReviews) || 0),
      0
    );
    const weightedRatingFromBusinesses = selectedBusinesses.reduce(
      (sum, business) => sum + (Number(business.currentRating) || 0) * (Number(business.totalReviews) || 0),
      0
    );

    const currentRating =
      totalReviewCountFromBusinesses > 0
        ? Number((weightedRatingFromBusinesses / totalReviewCountFromBusinesses).toFixed(2))
        : Number((selectedBusinesses[0]?.currentRating || 0).toFixed(2));

    const totalReviews = totalReviewCountFromBusinesses;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyReviews = reviews.filter((review) => new Date(review.publishedAt) >= weekStart).length;

    const ratingCounts = countByRating(reviews);
    const distribution = toDistributionPayload(ratingCounts, reviews.length);

    const recentReviews = reviews.slice(0, 10).map((review) => ({
      id: review._id,
      businessId: review.businessId,
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      publishedAt: review.publishedAt,
    }));

    const trendByDate = new Map();
    for (const point of snapshots) {
      const date = new Date(point.recordedAt).toISOString().split('T')[0];
      const current = trendByDate.get(date) || { totalWeight: 0, weightedRating: 0 };
      const weight = Number(point.totalReviews) || 1;

      current.totalWeight += weight;
      current.weightedRating += (Number(point.rating) || 0) * weight;
      trendByDate.set(date, current);
    }

    let trend = Array.from(trendByDate.entries()).map(([date, value]) => ({
      date,
      rating: Number((value.weightedRating / value.totalWeight).toFixed(2)),
    }));

    if (!trend.length) {
      const fallbackDate = new Date().toISOString().split('T')[0];
      trend = [{ date: fallbackDate, rating: currentRating }];
    }

    if (trend.length < 2) {
      const reviewTrend = buildTrendFromReviews(reviews);
      if (reviewTrend.length > trend.length) {
        trend = reviewTrend;
      }
    }

    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const beforeMonthPoints = trend.filter((point) => new Date(point.date) < monthAgo);
    const monthlyPreviousRating = beforeMonthPoints.length
      ? beforeMonthPoints[beforeMonthPoints.length - 1].rating
      : trend[0].rating;
    const monthlyCurrentRating = trend[trend.length - 1].rating;
    const monthlyChange = Number((monthlyCurrentRating - monthlyPreviousRating).toFixed(2));

    const lastUpdatedDate = selectedBusinesses
      .map((business) => new Date(business.lastFetched || business.updatedAt || business.createdAt))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return res.status(200).json({
      success: true,
      data: {
        businesses: userBusinesses.map((business) => ({
          id: business._id,
          name: business.businessName,
        })),
        selectedBusinessId: isAll ? 'all' : String(selectedBusinesses[0]._id),
        hasMultipleBusinesses: userBusinesses.length > 1,
        stats: {
          currentRating,
          totalReviews,
          weeklyReviews,
          monthlyChange,
          monthlyPreviousRating,
          monthlyCurrentRating,
          lastUpdated: lastUpdatedDate,
        },
        trend,
        distribution,
        recentReviews,
        unreadAlertsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
};

export const refreshBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const force = String(req.query?.force || '').toLowerCase() === 'true';

    const result = await refreshBusinessForUser({
      userId: req.user.id,
      businessId,
      force,
      trigger: 'manual',
    });

    if (!result.success) {
      return res.status(result.status || 500).json({ success: false, message: result.message || 'Refresh failed' });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
      skipped: Boolean(result.skipped),
    });
  } catch (error) {
    const err = resolveBusinessError(error);
    return res.status(err.status).json({ success: false, message: err.message });
  }
};

export const getSerpApiBudget = async (req, res) => {
  try {
    const usage = await getSerpApiUsage();
    return res.status(200).json({ success: true, data: usage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch API budget' });
  }
};
