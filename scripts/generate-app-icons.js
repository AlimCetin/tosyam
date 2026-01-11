const fs = require('fs');
const path = require('path');

// SVG'yi PNG'ye dönüştürmek için sharp kullanacağız
// Eğer sharp yoksa, alternatif olarak puppeteer veya başka bir araç kullanabiliriz

async function generateIcons() {
  try {
    // Sharp'ı dinamik olarak import et
    const sharp = require('sharp');
    
    const svgPath = path.join(__dirname, '../assets/app-icon.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    // Android icon boyutları (mipmap density)
    const androidSizes = {
      'mipmap-mdpi': 48,
      'mipmap-hdpi': 72,
      'mipmap-xhdpi': 96,
      'mipmap-xxhdpi': 144,
      'mipmap-xxxhdpi': 192,
    };

    // iOS icon boyutları
    const iosSizes = {
      'icon-20@2x': 40,
      'icon-20@3x': 60,
      'icon-29@2x': 58,
      'icon-29@3x': 87,
      'icon-40@2x': 80,
      'icon-40@3x': 120,
      'icon-60@2x': 120,
      'icon-60@3x': 180,
      'icon-1024': 1024,
    };

    console.log('Generating Android icons...');
    
    // Android icons oluştur
    for (const [folder, size] of Object.entries(androidSizes)) {
      const folderPath = path.join(__dirname, `../android/app/src/main/res/${folder}`);
      
      // Klasör yoksa oluştur
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Normal icon
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // Round icon (yuvarlatılmış köşeler)
      const roundedIcon = await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer();

      // Round icon için mask uygula (basit yuvarlatma)
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          {
            input: roundedIcon,
            blend: 'over'
          }
        ])
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));

      console.log(`✓ Generated ${folder}/ic_launcher.png (${size}x${size})`);
      console.log(`✓ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
    }

    console.log('\nGenerating iOS icons...');
    
    // iOS icons oluştur
    const iosIconPath = path.join(__dirname, '../ios/tosyam/Images.xcassets/AppIcon.appiconset');
    
    if (!fs.existsSync(iosIconPath)) {
      fs.mkdirSync(iosIconPath, { recursive: true });
    }

    const contentsJson = {
      images: [
        { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'icon-20@2x.png' },
        { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'icon-20@3x.png' },
        { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'icon-29@2x.png' },
        { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'icon-29@3x.png' },
        { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'icon-40@2x.png' },
        { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'icon-40@3x.png' },
        { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'icon-60@2x.png' },
        { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'icon-60@3x.png' },
        { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'icon-1024.png' }
      ],
      info: {
        author: 'xcode',
        version: 1
      }
    };

    for (const [filename, size] of Object.entries(iosSizes)) {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(path.join(iosIconPath, `${filename}.png`));

      console.log(`✓ Generated iOS ${filename}.png (${size}x${size})`);
    }

    // Contents.json'u güncelle
    fs.writeFileSync(
      path.join(iosIconPath, 'Contents.json'),
      JSON.stringify(contentsJson, null, 2)
    );

    console.log('\n✅ All app icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Rebuild your Android app: npm run android');
    console.log('2. Rebuild your iOS app: npm run ios');

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('sharp')) {
      console.error('\n❌ Error: sharp module not found.');
      console.log('\nPlease install sharp by running:');
      console.log('npm install --save-dev sharp');
      console.log('\nOr use:');
      console.log('npm install --save-dev puppeteer');
      console.log('(and update this script to use puppeteer instead)');
    } else {
      console.error('Error generating icons:', error);
    }
    process.exit(1);
  }
}

generateIcons();

