const fs = require('fs');

// Supabase bilgilerin
const SUPA_URL = 'https://erygxodyxjayxszxugwp.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeWd4b2R5eGpheXhzenh1Z3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NzUxMzIsImV4cCI6MjA5ODA1MTEzMn0.uz5tbIPBXNhupJu2xpf7eKyRSWKSAvZDiodj46qISaI';
const BASE_URL = 'https://d-mozz.blogspot.com'; //

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function slug(t) {
  return String(t).toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

async function run() {
  try {
    // Veritabanından Kategorileri Çek
    const catRes = await fetch(`${SUPA_URL}/rest/v1/categories?select=*&order=sort_order`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    });
    const categories = await catRes.json();

    // Veritabanından Siteleri Çek
    const siteRes = await fetch(`${SUPA_URL}/rest/v1/sites?select=*&order=created_at.desc`, {
      headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` }
    });
    const sites = await siteRes.json();

    const now = new Date().toISOString();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Ana Sayfa
    xml += `  <url>\n    <loc>${esc(BASE_URL)}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Kategoriler
    categories.forEach(c => {
      xml += `  <url>\n    <loc>${esc(BASE_URL)}/?cat=${encodeURIComponent(c.id)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Siteler
    sites.forEach(s => {
      const lastmod = s.created_at ? new Date(s.created_at).toISOString() : now;
      xml += `  <url>\n    <loc>${esc(BASE_URL)}/?v=${encodeURIComponent(slug(s.name))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += '</urlset>';

    // sitemap.xml dosyasını yaz
    fs.writeFileSync('sitemap.xml', xml, 'utf8');
    console.log('sitemap.xml başarıyla oluşturuldu!');

  } catch (err) {
    console.error('Hata oluştu:', err);
    process.exit(1);
  }
}

run();
