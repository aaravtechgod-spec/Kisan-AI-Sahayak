import { AgroAdvisoryInput, AgroAdvisoryRecord } from '../types/agroAdvisory';

/**
 * Publishes an agro-advisory record to the interoperable DPG REST endpoint.
 * Non-blocking background call: failures do not block the UI.
 */
export async function publishAgroAdvisoryRecord(
  payload: AgroAdvisoryInput
): Promise<AgroAdvisoryRecord | null> {
  try {
    const res = await fetch('/api/v1/agro-advisory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn('Failed to publish agro-advisory record to DPG endpoint:', errData);
      return null;
    }

    const data = await res.json();
    return data.record || null;
  } catch (err) {
    console.warn('Network error publishing agro-advisory record:', err);
    return null;
  }
}

/**
 * Fetches federated agro-advisories from the REST endpoint.
 */
export async function fetchAgroAdvisories(params?: {
  type?: 'spray-safety' | 'regenerative';
  crop?: string;
  limit?: number;
}): Promise<AgroAdvisoryRecord[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.crop) searchParams.set('crop', params.crop);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const url = `/api/v1/agro-advisory?${searchParams.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return data.records || [];
  } catch (err) {
    console.warn('Error fetching agro advisories:', err);
    return [];
  }
}
