import sharp from "sharp";

const width = 1200;
const height = 630;
const backdrop = Buffer.from(`
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#07111e"/>
        <stop offset="0.58" stop-color="#10192a"/>
        <stop offset="1" stop-color="#3b0a2b"/>
      </linearGradient>
      <radialGradient id="glow" cx="82%" cy="38%" r="52%">
        <stop offset="0" stop-color="#ff315f" stop-opacity=".4"/>
        <stop offset=".46" stop-color="#ff9d2e" stop-opacity=".11"/>
        <stop offset="1" stop-color="#07111e" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity=".045"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#glow)"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect x="70" y="88" width="8" height="366" rx="4" fill="#ff315f"/>
    <text x="112" y="186" fill="#ffb25b" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="5">PORTFOLIO / 2026</text>
    <text x="108" y="286" fill="#f7f3eb" font-family="Arial, sans-serif" font-size="70" font-weight="700">NAYEEM FAISAL</text>
    <text x="112" y="342" fill="#aab5c4" font-family="Arial, sans-serif" font-size="28">Connecting data, intelligence, and ideas.</text>
    <text x="112" y="420" fill="#ff8b60" font-family="Arial, sans-serif" font-size="20" letter-spacing="2">DATA · INTELLIGENCE · SYSTEMS</text>
    <text x="112" y="502" fill="#7f8b9c" font-family="monospace" font-size="18">nayeemfaisal.com</text>
  </svg>`);

const portrait = await sharp("public/nayeem-brand-portrait.webp")
  .resize({ width: 530, height: 530, fit: "contain" })
  .png()
  .toBuffer();
const logo = await sharp("public/nayeem-logo.png")
  .resize({ width: 116, height: 116, fit: "contain" })
  .png()
  .toBuffer();

await sharp(backdrop)
  .composite([
    { input: portrait, left: 690, top: 100 },
    { input: logo, left: 1062, top: 42 },
  ])
  .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
  .toFile("public/og.jpg");
