const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = path.join(__dirname, '../public/IMG_5614.PNG');
const outputDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons from branding assets...\n');

  // Generate PWA icons
  for (const size of sizes) {
    await sharp(sourceImage)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate favicons
  await sharp(sourceImage)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  console.log('✓ Generated favicon-32x32.png');

  await sharp(sourceImage)
    .resize(16, 16)
    .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
  console.log('✓ Generated favicon-16x16.png');

  console.log('\n✅ All PWA icons and favicons generated successfully!');
  console.log(`📁 Icons location: ${outputDir}`);
  console.log(`📁 Favicons location: ${path.join(__dirname, '../public/')}`);
}

generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
