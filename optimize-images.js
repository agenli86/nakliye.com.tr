const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'public', 'resimler');
const OUTPUT_DIR = path.join(__dirname, 'public', 'resimler-optimized');
const MAX_WIDTH = 1920;
const QUALITY = 85;

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function optimizeImage(inputPath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const name = path.basename(filename, ext);

  // Skip if not an image
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    console.log(`⏭️  Skipping ${filename} (not an image)`);
    return;
  }

  console.log(`🔄 Processing: ${filename}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if larger than MAX_WIDTH
    const pipeline = metadata.width > MAX_WIDTH
      ? image.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
      : image;

    // Generate WebP
    const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);
    await pipeline
      .clone()
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(webpPath);

    // Generate AVIF
    const avifPath = path.join(OUTPUT_DIR, `${name}.avif`);
    await pipeline
      .clone()
      .avif({ quality: QUALITY, effort: 6 })
      .toFile(avifPath);

    // Get file sizes
    const originalStats = await fs.stat(inputPath);
    const webpStats = await fs.stat(webpPath);
    const avifStats = await fs.stat(avifPath);

    const originalSize = (originalStats.size / 1024).toFixed(2);
    const webpSize = (webpStats.size / 1024).toFixed(2);
    const avifSize = (avifStats.size / 1024).toFixed(2);
    const savedWebp = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);
    const savedAvif = (((originalStats.size - avifStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`  ✅ ${name}:`);
    console.log(`     Original: ${originalSize} KB`);
    console.log(`     WebP: ${webpSize} KB (${savedWebp}% saved)`);
    console.log(`     AVIF: ${avifSize} KB (${savedAvif}% saved)`);
  } catch (error) {
    console.error(`  ❌ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📁 Input: ${INPUT_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📏 Max width: ${MAX_WIDTH}px`);
  console.log(`🎨 Quality: ${QUALITY}%\n`);

  // Ensure output directory exists
  await ensureDir(OUTPUT_DIR);

  // Get all files from input directory
  const files = await fs.readdir(INPUT_DIR);

  let totalOriginal = 0;
  let totalWebp = 0;
  let totalAvif = 0;
  let processedCount = 0;

  // Process each image
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const stats = await fs.stat(inputPath);

    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        totalOriginal += stats.size;
        processedCount++;
        await optimizeImage(inputPath, file);
      }
    }
  }

  // Calculate total savings
  const webpFiles = await fs.readdir(OUTPUT_DIR);
  for (const file of webpFiles) {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = await fs.stat(filePath);
    if (file.endsWith('.webp')) {
      totalWebp += stats.size;
    } else if (file.endsWith('.avif')) {
      totalAvif += stats.size;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Processed: ${processedCount} images`);
  console.log(`   Total original size: ${(totalOriginal / 1024).toFixed(2)} KB`);
  console.log(`   Total WebP size: ${(totalWebp / 1024).toFixed(2)} KB (${((totalOriginal - totalWebp) / totalOriginal * 100).toFixed(1)}% saved)`);
  console.log(`   Total AVIF size: ${(totalAvif / 1024).toFixed(2)} KB (${((totalOriginal - totalAvif) / totalOriginal * 100).toFixed(1)}% saved)`);
  console.log('\n✨ Optimization complete!\n');
}

main().catch(console.error);
