const resolveDemoMode = () => {
  if (typeof window !== 'undefined') {
    const urlFlag = new URLSearchParams(window.location.search).get('demo')
    if (urlFlag === '1' || urlFlag === 'true') return true
    if (urlFlag === '0' || urlFlag === 'false') return false

    const localOverride = String(localStorage.getItem('lrt_demo_mode') || '').toLowerCase().trim()
    if (localOverride === 'true') return true
    if (localOverride === 'false') return false
  }

  return String(import.meta.env.VITE_DEMO_MODE || 'true').toLowerCase() !== 'false'
}

const DEMO_MODE = resolveDemoMode()

const daysAgoIso = (days, hour = 11) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export const isDemoBusinessId = (businessId = '') => String(businessId).startsWith('demo_')
export const isDemoModeEnabled = () => DEMO_MODE

export const demoBusinesses = [
  {
    _id: 'demo_urban_brew',
    businessName: 'Urban Brew Coffee - Downtown',
    googlePlaceId: 'demo_place_urban_brew',
    googlePlaceUrl: 'https://maps.google.com/?q=Urban+Brew+Coffee+Downtown',
    currentRating: 4.4,
    totalReviews: 286,
    category: 'Coffee shop',
    address: '120 Main St, Austin, TX 78701',
    phone: '+1 (512) 555-0112',
    lastFetched: daysAgoIso(0, 9),
    createdAt: daysAgoIso(70, 9),
    updatedAt: daysAgoIso(0, 9),
  },
  {
    _id: 'demo_apex_dental',
    businessName: 'Apex Dental Care',
    googlePlaceId: 'demo_place_apex_dental',
    googlePlaceUrl: 'https://maps.google.com/?q=Apex+Dental+Care+Austin',
    currentRating: 4.7,
    totalReviews: 193,
    category: 'Dental clinic',
    address: '804 Riverside Dr, Austin, TX 78704',
    phone: '+1 (512) 555-0178',
    lastFetched: daysAgoIso(0, 8),
    createdAt: daysAgoIso(66, 9),
    updatedAt: daysAgoIso(0, 8),
  },
]

const demoTrendByBusiness = {
  demo_urban_brew: [
    { date: daysAgoIso(56, 9), rating: 4.8 },
    { date: daysAgoIso(49, 9), rating: 4.7 },
    { date: daysAgoIso(42, 9), rating: 4.7 },
    { date: daysAgoIso(35, 9), rating: 4.6 },
    { date: daysAgoIso(28, 9), rating: 4.6 },
    { date: daysAgoIso(21, 9), rating: 4.5 },
    { date: daysAgoIso(14, 9), rating: 4.5 },
    { date: daysAgoIso(7, 9), rating: 4.4 },
    { date: daysAgoIso(0, 9), rating: 4.4 },
  ],
  demo_apex_dental: [
    { date: daysAgoIso(56, 9), rating: 4.5 },
    { date: daysAgoIso(49, 9), rating: 4.5 },
    { date: daysAgoIso(42, 9), rating: 4.6 },
    { date: daysAgoIso(35, 9), rating: 4.6 },
    { date: daysAgoIso(28, 9), rating: 4.6 },
    { date: daysAgoIso(21, 9), rating: 4.7 },
    { date: daysAgoIso(14, 9), rating: 4.7 },
    { date: daysAgoIso(7, 9), rating: 4.7 },
    { date: daysAgoIso(0, 9), rating: 4.7 },
  ],
}

const baseReviews = [
  ['demo_urban_brew', 'Emma Carter', 2, 'Coffee quality dropped this week and service felt rushed.', 1],
  ['demo_urban_brew', 'Noah Reed', 1, 'Waited 22 minutes and still received the wrong order.', 2],
  ['demo_urban_brew', 'Sophia Khan', 5, 'Latte art and taste were amazing as always.', 3],
  ['demo_urban_brew', 'Lucas Green', 4, 'Great vibe and quick checkout during busy hours.', 5],
  ['demo_urban_brew', 'Olivia Hall', 3, 'Food was good, but seating area was not clean.', 7],
  ['demo_urban_brew', 'Mason Lee', 5, 'Best cappuccino in downtown. Friendly baristas.', 9],
  ['demo_urban_brew', 'Ava Mitchell', 4, 'Good coffee, wish they had more vegan options.', 12],
  ['demo_urban_brew', 'Elijah Parker', 5, 'Perfect place for work calls and meetings.', 15],
  ['demo_urban_brew', 'Mia Scott', 3, 'Average experience, music volume was too high.', 20],
  ['demo_urban_brew', 'James Turner', 4, 'Consistent quality and reliable staff.', 26],
  ['demo_apex_dental', 'Lily Brooks', 5, 'Dr. Khan explained every step clearly. Excellent care.', 1],
  ['demo_apex_dental', 'Henry Foster', 4, 'Friendly team and almost no waiting time.', 4],
  ['demo_apex_dental', 'Ella Price', 5, 'Very professional clinic and smooth billing process.', 6],
  ['demo_apex_dental', 'Alexander Gray', 5, 'Teeth cleaning was quick and painless.', 8],
  ['demo_apex_dental', 'Grace Cox', 4, 'Good overall treatment and clear follow-up advice.', 10],
  ['demo_apex_dental', 'Daniel Ward', 5, 'Highly recommend for families and kids.', 14],
  ['demo_apex_dental', 'Scarlett Diaz', 3, 'Doctor was good but appointment started late.', 18],
  ['demo_apex_dental', 'Sebastian Ross', 5, 'Clinic is spotless and staff is very welcoming.', 22],
  ['demo_apex_dental', 'Chloe Evans', 4, 'Reasonable pricing and quality service.', 28],
  ['demo_apex_dental', 'Matthew Bennett', 5, 'Emergency appointment handled very well.', 35],
]

export const demoReviews = baseReviews.map((item, index) => {
  const business = demoBusinesses.find((b) => b._id === item[0])
  return {
    id: `demo_review_${index + 1}`,
    businessId: item[0],
    businessName: business?.businessName || 'Business',
    authorName: item[1],
    authorPhotoUrl: '',
    rating: item[2],
    text: item[3],
    publishedAt: daysAgoIso(item[4], 11),
    helpfulCount: Math.max(0, 25 - index),
  }
})

const demoAlertsSeed = [
  {
    id: 'demo_alert_1',
    type: 'rating_drop',
    title: 'Rating Drop Alert',
    message: 'Urban Brew Coffee - Downtown rating dropped from 4.6 to 4.4',
    subtext: 'This is a 0.2 point decrease over the last week.',
    isRead: false,
    businessId: 'demo_urban_brew',
    businessName: 'Urban Brew Coffee - Downtown',
    createdAt: daysAgoIso(1, 10),
    metadata: { oldRating: 4.6, newRating: 4.4, dropValue: 0.2, timeframe: 'week' },
    actions: ['view_dashboard', 'mark_read', 'dismiss'],
  },
  {
    id: 'demo_alert_2',
    type: 'negative_review',
    title: 'New Negative Review',
    message: 'Urban Brew Coffee - Downtown received a 1-star review',
    subtext: 'Waited 22 minutes and still received the wrong order. - Noah Reed',
    isRead: false,
    businessId: 'demo_urban_brew',
    businessName: 'Urban Brew Coffee - Downtown',
    createdAt: daysAgoIso(1, 11),
    metadata: { rating: 1, reviewerName: 'Noah Reed' },
    actions: ['view_review', 'mark_read', 'dismiss'],
  },
  {
    id: 'demo_alert_3',
    type: 'negative_review',
    title: 'New Negative Review',
    message: 'Apex Dental Care received a 3-star review',
    subtext: 'Doctor was good but appointment started late. - Scarlett Diaz',
    isRead: true,
    businessId: 'demo_apex_dental',
    businessName: 'Apex Dental Care',
    createdAt: daysAgoIso(18, 11),
    metadata: { rating: 3, reviewerName: 'Scarlett Diaz' },
    actions: ['view_review', 'dismiss'],
  },
  {
    id: 'demo_alert_4',
    type: 'system_update',
    title: 'Data Refreshed',
    message: 'Successfully updated data for all businesses',
    subtext: '12 new reviews added',
    isRead: true,
    businessId: 'demo_urban_brew',
    businessName: 'Urban Brew Coffee - Downtown',
    createdAt: daysAgoIso(0, 8),
    metadata: { newReviews: 12 },
    actions: ['dismiss'],
  },
]

let demoAlertsState = demoAlertsSeed.map((item) => ({ ...item }))

const buildDistribution = (reviews) => {
  const countMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const item of reviews) {
    const rating = Number(item.rating)
    if (rating >= 1 && rating <= 5) countMap[rating] += 1
  }

  const total = reviews.length || 1
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: countMap[star],
    percent: Number(((countMap[star] / total) * 100).toFixed(1)),
  }))
}

const mergeTrendForAll = () => {
  const keys = [...new Set(Object.values(demoTrendByBusiness).flat().map((item) => item.date.split('T')[0]))].sort()
  return keys.map((day) => {
    let sum = 0
    let count = 0
    for (const business of demoBusinesses) {
      const hit = (demoTrendByBusiness[business._id] || []).find((point) => point.date.startsWith(day))
      if (!hit) continue
      sum += Number(hit.rating)
      count += 1
    }
    return { date: `${day}T00:00:00.000Z`, rating: Number((sum / Math.max(1, count)).toFixed(2)) }
  })
}

export const getDemoBusinesses = () => demoBusinesses.map((item) => ({ ...item }))

export const getDemoDashboardData = ({ businessId = 'all' } = {}) => {
  const selectedBusinesses = businessId === 'all' ? demoBusinesses : demoBusinesses.filter((item) => item._id === businessId)
  const selectedIds = selectedBusinesses.map((item) => item._id)
  const selectedReviews = demoReviews.filter((item) => selectedIds.includes(item.businessId))
  const distribution = buildDistribution(selectedReviews)

  const totalReviews = selectedBusinesses.reduce((sum, item) => sum + Number(item.totalReviews || 0), 0)
  const weightedRating = selectedBusinesses.reduce(
    (sum, item) => sum + Number(item.currentRating || 0) * Number(item.totalReviews || 0),
    0
  )
  const currentRating = totalReviews > 0 ? Number((weightedRating / totalReviews).toFixed(2)) : 0

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const weeklyReviews = selectedReviews.filter((item) => new Date(item.publishedAt) >= weekStart).length

  const trend =
    businessId === 'all'
      ? mergeTrendForAll()
      : (demoTrendByBusiness[businessId] || []).map((item) => ({ ...item }))

  const monthlyPreviousRating = trend.length > 0 ? Number(trend[0].rating) : currentRating
  const monthlyCurrentRating = trend.length > 0 ? Number(trend[trend.length - 1].rating) : currentRating
  const monthlyChange = Number((monthlyCurrentRating - monthlyPreviousRating).toFixed(2))

  return {
    businesses: demoBusinesses.map((item) => ({ id: item._id, name: item.businessName })),
    selectedBusinessId: businessId,
    hasMultipleBusinesses: demoBusinesses.length > 1,
    stats: {
      currentRating,
      totalReviews,
      weeklyReviews,
      monthlyChange,
      monthlyPreviousRating,
      monthlyCurrentRating,
      lastUpdated: daysAgoIso(0, 9),
    },
    trend,
    distribution,
    recentReviews: selectedReviews
      .slice()
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 10),
    unreadAlertsCount: demoAlertsState.filter((item) => !item.isRead).length,
  }
}

const sortReviews = (items, sortBy) => {
  const cloned = [...items]
  if (sortBy === 'oldest') return cloned.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
  if (sortBy === 'highest') return cloned.sort((a, b) => b.rating - a.rating || new Date(b.publishedAt) - new Date(a.publishedAt))
  if (sortBy === 'lowest') return cloned.sort((a, b) => a.rating - b.rating || new Date(b.publishedAt) - new Date(a.publishedAt))
  return cloned.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

export const getDemoReviews = (params = {}) => {
  const {
    businessId = 'all',
    rating = 'all',
    sortBy = 'newest',
    search = '',
    page = 1,
    limit = 10,
  } = params

  let items = [...demoReviews]

  if (businessId !== 'all') {
    items = items.filter((item) => String(item.businessId) === String(businessId))
  }

  if (rating !== 'all') {
    items = items.filter((item) => Number(item.rating) === Number(rating))
  }

  const trimmedSearch = String(search || '').trim().toLowerCase()
  if (trimmedSearch) {
    items = items.filter(
      (item) =>
        String(item.text || '').toLowerCase().includes(trimmedSearch) ||
        String(item.authorName || '').toLowerCase().includes(trimmedSearch)
    )
  }

  items = sortReviews(items, sortBy)

  const pageNumber = Math.max(1, Number(page) || 1)
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10))
  const totalItems = items.length
  const start = (pageNumber - 1) * limitNumber
  const end = start + limitNumber

  return {
    items: items.slice(start, end),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNumber),
    },
    businesses: demoBusinesses.map((item) => ({ id: item._id, name: item.businessName })),
  }
}

export const getDemoAlerts = ({ tab = 'all', page = 1, limit = 10 } = {}) => {
  const pageNumber = Math.max(1, Number(page) || 1)
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10))

  let items = [...demoAlertsState]
  if (tab === 'unread') items = items.filter((item) => !item.isRead)
  if (tab === 'rating_drop') items = items.filter((item) => item.type === 'rating_drop')
  if (tab === 'negative_review') items = items.filter((item) => item.type === 'negative_review')

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalItems = items.length
  const start = (pageNumber - 1) * limitNumber
  const end = start + limitNumber

  return {
    items: items.slice(start, end),
    unreadCount: demoAlertsState.filter((item) => !item.isRead).length,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNumber),
    },
  }
}

export const getDemoUnreadAlertsCount = () => demoAlertsState.filter((item) => !item.isRead).length

export const markDemoAlertRead = (alertId) => {
  demoAlertsState = demoAlertsState.map((item) =>
    String(item.id) === String(alertId) ? { ...item, isRead: true } : item
  )
}

export const markAllDemoAlertsRead = () => {
  demoAlertsState = demoAlertsState.map((item) => ({ ...item, isRead: true }))
}

export const dismissDemoAlert = (alertId) => {
  demoAlertsState = demoAlertsState.filter((item) => String(item.id) !== String(alertId))
}
