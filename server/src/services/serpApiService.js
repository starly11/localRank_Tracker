import { getJson } from 'serpapi';
import ApiUsage from '../models/ApiUsage.js';

const SERPAPI_MAX_REQUESTS = Number(process.env.SERPAPI_MAX_REQUESTS || 100);
const USAGE_KEY = 'serpapi_total';
const SERPAPI_TIMEOUT_MS = Number(process.env.SERPAPI_TIMEOUT_MS || 15000);
const SERPAPI_RETRY_COUNT = Number(process.env.SERPAPI_RETRY_COUNT || 1);

const parsePlaceInput = (placeInput = '') => {
  const raw = String(placeInput || '').trim();

  if (!raw) {
    return { placeId: null, query: null };
  }

  if (raw.startsWith('ChIJ')) {
    return { placeId: raw, query: null };
  }

  try {
    const url = new URL(raw);
    const cid = url.searchParams.get('cid');
    if (cid) {
      return { placeId: null, query: null, cid, rawUrl: raw };
    }

    const placeId = url.searchParams.get('query_place_id');

    if (placeId && placeId.startsWith('ChIJ')) {
      return { placeId, query: null };
    }

    const decodedPath = decodeURIComponent(url.pathname || '');
    const placeSegment = decodedPath.match(/\/place\/([^/]+)/i)?.[1];
    if (placeSegment) {
      const query = placeSegment.replace(/\+/g, ' ').trim();
      if (query) return { placeId: null, query };
    }
  } catch {
    return { placeId: null, query: raw, cid: null, rawUrl: raw };
  }

  return { placeId: null, query: raw, cid: null, rawUrl: raw };
};

const extractCidFromInput = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const cidMatch = raw.match(/(?:[?&]cid=|^cid:)(\d+)/i);
  if (cidMatch?.[1]) return cidMatch[1];

  return null;
};

const toBusinessPayload = (candidate) => {
  if (!candidate) return null;

  const dataId = candidate.data_id || null;
  if (!dataId) return null;

  const rawType = candidate.type;
  const normalizedType = Array.isArray(rawType)
    ? rawType.filter(Boolean).join(', ')
    : typeof rawType === 'string'
      ? rawType
      : '';

  return {
    data_id: dataId,
    title: candidate.title,
    address: candidate.address,
    rating: candidate.rating,
    reviews: candidate.reviews,
    phone: candidate.phone,
    type: normalizedType,
    place_url: candidate.place_id_search,
  };
};

const extractBusinessCandidate = (json) => {
  if (!json || typeof json !== 'object') return null;
  return json.place_results || json.local_results?.[0] || null;
};

const reserveSerpApiCall = async () => {
  const usage = await ApiUsage.findOneAndUpdate(
    {
      key: USAGE_KEY,
      count: { $lt: SERPAPI_MAX_REQUESTS },
    },
    {
      $inc: { count: 1 },
      $setOnInsert: { key: USAGE_KEY },
    },
    {
      upsert: true,
      returnDocument: 'after',
    }
  );

  if (!usage) {
    throw new Error(`SerpAPI budget exhausted (${SERPAPI_MAX_REQUESTS} requests max)`);
  }
};

const releaseSerpApiCall = async () => {
  await ApiUsage.findOneAndUpdate(
    {
      key: USAGE_KEY,
      count: { $gt: 0 },
    },
    {
      $inc: { count: -1 },
    }
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientNetworkError = (error) => {
  const code = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '');
  const nestedErrors = Array.isArray(error?.errors) ? error.errors : [];
  const nestedCodes = nestedErrors.map((item) => String(item?.code || '').toUpperCase());
  const nestedMessage = nestedErrors.map((item) => String(item?.message || '')).join(' ');

  const networkCodeSet = new Set([
    'ETIMEDOUT',
    'ENETUNREACH',
    'ECONNRESET',
    'ECONNREFUSED',
    'EAI_AGAIN',
    'UND_ERR_CONNECT_TIMEOUT',
  ]);
  const hasNetworkCode = networkCodeSet.has(code) || nestedCodes.some((item) => networkCodeSet.has(item));
  const hasNetworkText = /ETIMEDOUT|ENETUNREACH|ECONNRESET|ECONNREFUSED|EAI_AGAIN|connect timeout/i.test(
    `${message} ${nestedMessage}`
  );

  return hasNetworkCode || hasNetworkText;
};

const callSerpApiOnce = async (params) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      const timeoutError = new Error(`SerpAPI request timed out after ${SERPAPI_TIMEOUT_MS}ms`);
      timeoutError.code = 'ETIMEDOUT';
      reject(timeoutError);
    }, SERPAPI_TIMEOUT_MS);

    try {
      getJson(
        {
          ...params,
          api_key: process.env.SERPAPI_KEY,
        },
        (json) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);

          if (json?.error) {
            reject(new Error(json.error));
            return;
          }

          resolve(json);
        }
      );
    } catch (error) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(error);
    }
  });

const callSerpApi = async (params) => {
  if (!process.env.SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY is not configured');
  }

  let lastError = null;

  for (let attempt = 0; attempt <= SERPAPI_RETRY_COUNT; attempt += 1) {
    await reserveSerpApiCall();

    try {
      return await callSerpApiOnce(params);
    } catch (error) {
      lastError = error;

      if (isTransientNetworkError(error)) {
        await releaseSerpApiCall();

        if (attempt < SERPAPI_RETRY_COUNT) {
          await sleep(600 * (attempt + 1));
          continue;
        }

        const networkError = new Error('Unable to reach SerpAPI right now. Please try again in a moment.');
        networkError.code = error?.code || 'SERPAPI_NETWORK';
        throw networkError;
      }

      throw error;
    }
  }

  throw lastError || new Error('SerpAPI request failed');
};

export const getSerpApiUsage = async () => {
  const usage = await ApiUsage.findOne({ key: USAGE_KEY }).lean();
  return {
    used: Number(usage?.count || 0),
    max: SERPAPI_MAX_REQUESTS,
    remaining: Math.max(0, SERPAPI_MAX_REQUESTS - Number(usage?.count || 0)),
  };
};

export const getBusinessDetails = async ({ placeInput, businessName }) => {
  const { placeId, query, cid, rawUrl } = parsePlaceInput(placeInput);
  const extractedCid = extractCidFromInput(placeInput) || cid;

  if (placeId) {
    const placeJson = await callSerpApi({
      engine: 'google_maps_place',
      data_id: placeId,
    });

    const placeBusiness = toBusinessPayload(extractBusinessCandidate(placeJson));
    if (!placeBusiness?.data_id) {
      throw new Error('No business found for this Google Place ID');
    }

    return placeBusiness;
  }

  const fallbackQuery = query || String(businessName || '').trim();
  const queries = [];

  if (extractedCid) {
    const cidSearchJson = await callSerpApi({
      engine: 'google_maps',
      data_cid: extractedCid,
    });

    const cidBusiness = toBusinessPayload(extractBusinessCandidate(cidSearchJson));
    if (cidBusiness?.data_id) {
      return cidBusiness;
    }

    const cidLudocidJson = await callSerpApi({
      engine: 'google_maps',
      ludocid: extractedCid,
    });
    const ludocidBusiness = toBusinessPayload(extractBusinessCandidate(cidLudocidJson));
    if (ludocidBusiness?.data_id) {
      return ludocidBusiness;
    }

    if (fallbackQuery) {
      queries.push(fallbackQuery);
    } else if (rawUrl) {
      queries.push(rawUrl);
    }
  } else if (cid) {
    queries.push(`cid:${cid}`);
    queries.push(rawUrl || `https://maps.google.com/?cid=${cid}`);
  }

  if (!extractedCid && fallbackQuery) {
    queries.push(fallbackQuery);
  }

  if (!queries.length) {
    throw new Error('Business name or Google Maps URL is required');
  }

  let business = null;
  for (const q of queries) {
    const searchJson = await callSerpApi({
      engine: 'google_maps',
      q,
    });
    business = extractBusinessCandidate(searchJson);
    if (business?.data_id) break;
  }

  if (!business?.data_id) {
    throw new Error('No business found for this Google Maps URL or Place ID');
  }

  return toBusinessPayload(business);
};

export const getBusinessReviews = async (dataId) => {
  if (!dataId) return [];

  const json = await callSerpApi({
    engine: 'google_maps_reviews',
    data_id: dataId,
    sort_by: 'newestFirst',
  });

  return json?.reviews || [];
};
