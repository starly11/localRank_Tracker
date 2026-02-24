import Alert from '../models/Alerts.js';
import Business from '../models/Buisness.js';

const buildFilter = (userId, tab) => {
  const filter = { userId };

  switch (tab) {
    case 'unread':
      filter.isRead = false;
      break;
    case 'rating_drop':
      filter.type = 'rating_drop';
      break;
    case 'negative_review':
      filter.type = 'negative_review';
      break;
    default:
      break;
  }

  return filter;
};

const formatAlert = (alert, businessName) => {
  const metadata = alert.metadata || {};

  if (alert.type === 'rating_drop') {
    const oldRating = Number(metadata.oldRating || 0).toFixed(1);
    const newRating = Number(metadata.newRating || 0).toFixed(1);
    const dropValue = Number(metadata.dropValue || 0).toFixed(1);

    return {
      id: alert._id,
      type: alert.type,
      title: 'Rating Drop Alert',
      message: `${businessName} rating dropped from ${oldRating} to ${newRating}`,
      subtext: `This is a ${dropValue} point decrease over the last week.`,
      isRead: alert.isRead,
      businessId: alert.businessId,
      businessName,
      createdAt: alert.createdAt,
      metadata,
      actions: ['view_dashboard', 'mark_read', 'dismiss'],
    };
  }

  if (alert.type === 'negative_review') {
    const rating = Number(metadata.rating || 0);
    const excerpt = String(metadata.excerpt || '').trim();
    const reviewer = String(metadata.reviewerName || 'Anonymous').trim();

    return {
      id: alert._id,
      type: alert.type,
      title: 'New Negative Review',
      message: `${businessName} received a ${rating}-star review`,
      subtext: `${excerpt || 'New critical feedback received.'} - ${reviewer}`,
      isRead: alert.isRead,
      businessId: alert.businessId,
      businessName,
      createdAt: alert.createdAt,
      metadata,
      actions: ['view_review', 'mark_read', 'dismiss'],
    };
  }

  return {
    id: alert._id,
    type: 'system_update',
    title: metadata.title || 'Data Refreshed',
    message: alert.message || 'Successfully updated data for all businesses',
    subtext: metadata.subtext || `${Number(metadata.newReviews || 0)} new reviews added`,
    isRead: alert.isRead,
    businessId: alert.businessId,
    businessName,
    createdAt: alert.createdAt,
    metadata,
    actions: ['dismiss'],
  };
};

export const getAlerts = async (req, res) => {
  try {
    const { tab = 'all', page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = buildFilter(req.user.id, tab);

    const [items, totalItems, unreadCount] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      Alert.countDocuments(filter),
      Alert.countDocuments({ userId: req.user.id, isRead: false }),
    ]);

    const businessIds = [...new Set(items.map((item) => String(item.businessId)).filter((value) => value && value !== 'undefined'))];
    const businesses = await Business.find({ _id: { $in: businessIds }, userId: req.user.id })
      .select('_id businessName')
      .lean();

    const businessMap = new Map(businesses.map((business) => [String(business._id), business.businessName]));

    return res.status(200).json({
      success: true,
      data: {
        items: items.map((item) => {
          const businessName = businessMap.get(String(item.businessId)) || 'All Businesses';
          return formatAlert(item, businessName);
        }),
        unreadCount,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNumber),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch alerts' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Alert.countDocuments({ userId: req.user.id, isRead: false });
    return res.status(200).json({ success: true, data: { unreadCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch unread count' });
  }
};

export const markAlertRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId: req.user.id },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );

    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    return res.status(200).json({ success: true, data: { id: alert._id, isRead: alert.isRead } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to mark alert read' });
  }
};

export const dismissAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const deleted = await Alert.findOneAndDelete({ _id: alertId, userId: req.user.id });

    if (!deleted) return res.status(404).json({ success: false, message: 'Alert not found' });

    return res.status(200).json({ success: true, message: 'Alert dismissed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to dismiss alert' });
  }
};

export const markAllAlertsRead = async (req, res) => {
  try {
    await Alert.markAllAsRead(req.user.id);
    return res.status(200).json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to mark all alerts read' });
  }
};
