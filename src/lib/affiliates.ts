const GYG_PARTNER_ID = process.env.GYG_PARTNER_ID ?? 'OWXIEN9';
const TM_MEDIA_PARTNER_ID = process.env.TICKETMASTER_MEDIA_PARTNER_ID || '7049783';
const TM_PROGRAM_ID = process.env.TICKETMASTER_PROGRAM_ID || '4272';
const TM_AD_ID = process.env.TICKETMASTER_AD_ID || '264167';

/** Build a GYG affiliate URL with raceweekend tracking */
export function buildGYGAffiliateUrl(
  baseUrl: string,
  params?: { utmMedium?: string; utmContent?: string }
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('partner_id', GYG_PARTNER_ID);
  url.searchParams.set('utm_source', 'raceweekend');
  url.searchParams.set('utm_medium', params?.utmMedium ?? 'affiliate');
  if (params?.utmContent) url.searchParams.set('utm_content', params.utmContent);
  return url.toString();
}

/** Build a Ticketmaster URL with Impact.com tracking */
export function buildTicketmasterUrl(targetUrl: string, raceSlug: string): string {
  try {
    // 1. Enrich the destination URL with UTMs first
    const destUrl = new URL(targetUrl);
    destUrl.searchParams.set('utm_source', 'raceweekend');
    destUrl.searchParams.set('utm_medium', 'affiliate');
    destUrl.searchParams.set('utm_campaign', raceSlug);
    
    // 2. Wrap it in the Impact.com tracking structure
    // Format: https://ticketmaster.evyy.net/c/[PARTNER_ID]/[AD_ID]/[PROGRAM_ID]?u=[ENCODED_URL]
    const impactUrl = new URL(`https://ticketmaster.evyy.net/c/${TM_MEDIA_PARTNER_ID}/${TM_AD_ID}/${TM_PROGRAM_ID}`);
    impactUrl.searchParams.set('u', destUrl.toString());
    
    return impactUrl.toString();
  } catch {
    return targetUrl;
  }
}

/** Build a Ticketmaster Experience URL with Impact.com tracking */
export function buildTicketmasterExperienceUrl(targetUrl: string, raceSlug: string): string {
  try {
    const destUrl = new URL(targetUrl);
    destUrl.searchParams.set('utm_source', 'raceweekend');
    destUrl.searchParams.set('utm_medium', 'affiliate');
    destUrl.searchParams.set('utm_campaign', raceSlug);
    destUrl.searchParams.set('utm_content', 'experiences');
    
    const impactUrl = new URL(`https://ticketmaster.evyy.net/c/${TM_MEDIA_PARTNER_ID}/${TM_AD_ID}/${TM_PROGRAM_ID}`);
    impactUrl.searchParams.set('u', destUrl.toString());
    
    return impactUrl.toString();
  } catch {
    return targetUrl;
  }
}
