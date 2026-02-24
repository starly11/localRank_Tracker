import Business from '../models/Buisness.js';
import Review from '../models/Review.js';

const buildSort = (sortBy) => {
  switch (sortBy) {
    case 'oldest':
      return { publishedAt: 1 };
    case 'highest':
      return { rating: -1, publishedAt: -1 };
    case 'lowest':
      return { rating: 1, publishedAt: -1 };
    case 'newest':
    default:
      return { publishedAt: -1 };
  }
};

export const getReviews = async (req, res) => {
  try {
    const {
      businessId = 'all',
      rating = 'all',
      sortBy = 'newest',
      search = '',
      page = 1,
      limit = 10,
    } = req.query;

    const userBusinesses = await Business.find({ userId: req.user.id }).select('_id businessName').lean();
    const businessIds = userBusinesses.map((business) => business._id);

    if (!businessIds.length) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          pagination: { page: 1, limit: Number(limit), totalItems: 0, totalPages: 0 },
          businesses: [],
        },
      });
    }

    let selectedBusinessIds = businessIds;
    if (businessId !== 'all') {
      const exists = userBusinesses.find((business) => String(business._id) === String(businessId));
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }
      selectedBusinessIds = [exists._id];
    }

    const query = {
      businessId: { $in: selectedBusinessIds },
    };

    if (rating !== 'all') {
      query.rating = Number(rating);
    }

    const trimmedSearch = String(search).trim();
    if (trimmedSearch) {
      query.$or = [
        { text: { $regex: trimmedSearch, $options: 'i' } },
        { authorName: { $regex: trimmedSearch, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const [items, totalItems] = await Promise.all([
      Review.find(query)
        .sort(buildSort(sortBy))
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      Review.countDocuments(query),
    ]);

    const businessMap = new Map(userBusinesses.map((business) => [String(business._id), business.businessName]));

    return res.status(200).json({
      success: true,
      data: {
        items: items.map((review) => ({
          id: review._id,
          businessId: review.businessId,
          businessName: businessMap.get(String(review.businessId)) || 'Business',
          authorName: review.authorName,
          authorPhotoUrl: review.authorPhotoUrl,
          rating: review.rating,
          text: review.text,
          publishedAt: review.publishedAt,
          helpfulCount: review.helpfulCount || 0,
        })),
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNumber),
        },
        businesses: userBusinesses.map((business) => ({
          id: business._id,
          name: business.businessName,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
};
