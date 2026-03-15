/**
 * Enrichment Pipeline for Raceweekend Tickets.
 * Uses title-based heuristics to infer missing price and category data.
 * Restores original Ticketmaster images and only uses fallbacks for manual links.
 */
import mysql from 'mysql2/promise';

const TM_API_KEY = process.env.TICKETMASTER_API_KEY;
const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';

// High-quality category images for variety (Unsplash) - used ONLY for manual links
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Grandstand': [
    'https://images.unsplash.com/photo-1504450758481-7338ef7524ea?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
  ],
  'VIP / Premium': [
    'https://images.unsplash.com/photo-1564053489984-317bbd824340?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop',
  ],
  'GA / Standing': [
    'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473360123204-540056526230?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
  ]
};

async function fetchEventImage(eventId: string) {
  if (!TM_API_KEY) return null;
  const url = new URL(`${TM_BASE}/events/${eventId}.json`);
  url.searchParams.set('apikey', TM_API_KEY);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    const images = data.images || [];
    const bestImage = images
      .filter((img: any) => !img.url.endsWith('_SOURCE'))
      .sort((a: any, b: any) => {
         if (a.ratio === '16_9' && b.ratio !== '16_9') return -1;
         return (b.width || 0) - (a.width || 0);
      })[0];
    return bestImage?.url || null;
  } catch {
    return null;
  }
}

function enrichTicketHeuristic(title: string, index: number) {
  const t = title.toLowerCase();
  let category = "Grandstand";
  let price_min = 250;
  let price_max = 450;

  if (t.includes('vip') || t.includes('paddock') || t.includes('hospitality') || t.includes('club') || t.includes('premium')) {
    category = "VIP / Premium";
    price_min = 1200;
    price_max = 3500;
  } else if (t.includes('ga') || t.includes('general admission') || t.includes('standing') || t.includes('lawn')) {
    category = "GA / Standing";
    price_min = 95;
    price_max = 150;
  }

  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Grandstand'];
  const fallbackImage = images[index % images.length];

  // Price adjustments
  if (t.includes('friday') && !t.includes('3-day')) { price_min *= 0.35; price_max *= 0.35; }
  if (t.includes('saturday') && !t.includes('3-day')) { price_min *= 0.65; price_max *= 0.65; }

  return { category, price_min: Math.round(price_min), price_max: Math.round(price_max), fallbackImage };
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'raceweekend',
  });

  const [rows] = await conn.execute('SELECT id, title, tm_event_id, ticket_url, image_url, ticket_source FROM tickets');
  const tickets = rows as any[];
  
  console.log(`🔍 Processing ${tickets.length} tickets...`);

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    console.log(`✨ Processing: ${ticket.title}`);
    
    const heuristic = enrichTicketHeuristic(ticket.title, i);
    let finalImageUrl = ticket.image_url;

    // Logic:
    // 1. If it's a Ticketmaster ticket, try to get the REAL TM image if missing
    if (ticket.ticket_source === 'ticketmaster') {
       if (!finalImageUrl || finalImageUrl.includes('unsplash')) {
          if (ticket.tm_event_id) {
             const tmImage = await fetchEventImage(ticket.tm_event_id);
             if (tmImage) finalImageUrl = tmImage;
             await new Promise(r => setTimeout(r, 200)); 
          }
       }
    } 
    // 2. If it's a manual/official link OR TM image failed, use fallback
    if (!finalImageUrl) {
       finalImageUrl = heuristic.fallbackImage;
    }

    console.log(`   -> Source: ${ticket.ticket_source}, Image set.`);
    
    await conn.execute(
      'UPDATE tickets SET category = ?, price_min = ?, price_max = ?, currency = \"USD\", image_url = ? WHERE id = ?',
      [heuristic.category, heuristic.price_min, heuristic.price_max, finalImageUrl, ticket.id]
    );
  }

  console.log('✅ Enrichment complete.');
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
