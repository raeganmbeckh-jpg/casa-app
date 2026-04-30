import sharp from 'sharp'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#FFFFFF"/>
  <path d="M32 10 L52 28 L52 52 L12 52 L12 28 Z" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="32" cy="38" r="3.2" fill="#F9D96A"/>
</svg>`

await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile('src/app/icon.png')

await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile('src/app/apple-icon.png')

console.log('Favicons created!')
