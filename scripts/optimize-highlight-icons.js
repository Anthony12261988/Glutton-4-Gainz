const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const brandingDir = path.join(__dirname, '../public/imageAssests/Branding');
const optimizedDir = path.join(__dirname, '../public/branding');

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

const highlightIcons = [
  'Glutton4Gainz FF_Highlight Icon Clients.png',
  'Glutton4Gainz FF_Highlight Icon Coaching.png',
  'Glutton4Gainz FF_Highlight Icon Inspiration.png',
  'Glutton4Gainz FF_Highlight Icon Mindset.png',
  'Glutton4Gainz FF_Highlight Icon Workout.png',
];

async function optimizeIcons() {
  console.log('🎨 Optimizing highlight icons for web...\n');

  for (const icon of highlightIcons) {
    const sourcePath = path.join(brandingDir, icon);
    const outputName = icon
      .replace('Glutton4Gainz FF_Highlight Icon ', '')
      .replace('.png', '-highlight.png')
      .toLowerCase()
      .replace(' ', '-');

    const outputPath = path.join(optimizedDir, outputName);

    await sharp(sourcePath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outputPath);

    const originalSize = fs.statSync(sourcePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${outputName}: ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB (${savings}% smaller)`);
  }

  console.log('\n✅ All highlight icons optimized successfully!');
  console.log(`📁 Optimized icons location: ${optimizedDir}`);
  console.log('\n💡 Note: Update image paths in components to use /branding/ directory for better performance.');
}

optimizeIcons().catch(error => {
  console.error('❌ Error optimizing icons:', error);
  process.exit(1);
});
