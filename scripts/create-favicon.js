const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\Marcio\\PROJETO ESCALA DE SERVIÇO\\DIAMOND RELICS\\public\\diamond-relics-logo.png';
const outputFavicon = 'C:\\Users\\Marcio\\PROJETO ESCALA DE SERVIÇO\\DIAMOND RELICS\\public\\favicon.png';
const outputAppIcon = 'C:\\Users\\Marcio\\PROJETO ESCALA DE SERVIÇO\\DIAMOND RELICS\\app\\icon.png';

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const srcW = this.width;
    const srcH = this.height;

    // Create a 512x512 square canvas with transparent background
    const size = 512;
    const favicon = new PNG({ width: size, height: size });

    // Fill with transparent pixels
    for (let i = 0; i < size * size * 4; i += 4) {
      favicon.data[i] = 0;
      favicon.data[i + 1] = 0;
      favicon.data[i + 2] = 0;
      favicon.data[i + 3] = 0;
    }

    // Scale and center the logo
    // Keep aspect ratio
    const scale = Math.min((size - 32) / srcW, (size - 32) / srcH);
    const destW = Math.round(srcW * scale);
    const destH = Math.round(srcH * scale);
    const offsetX = Math.round((size - destW) / 2);
    const offsetY = Math.round((size - destH) / 2);

    // Bilinear or nearest-neighbor downsampling
    for (let dy = 0; dy < destH; dy++) {
      for (let dx = 0; dx < destW; dx++) {
        const sx = Math.min(srcW - 1, Math.round(dx / scale));
        const sy = Math.min(srcH - 1, Math.round(dy / scale));
        const srcIdx = (sy * srcW + sx) << 2;

        const targetX = offsetX + dx;
        const targetY = offsetY + dy;
        const destIdx = (targetY * size + targetX) << 2;

        favicon.data[destIdx] = this.data[srcIdx];
        favicon.data[destIdx + 1] = this.data[srcIdx + 1];
        favicon.data[destIdx + 2] = this.data[srcIdx + 2];
        favicon.data[destIdx + 3] = this.data[srcIdx + 3];
      }
    }

    // Save to public/favicon.png
    favicon.pack().pipe(fs.createWriteStream(outputFavicon)).on('finish', () => {
      console.log('Saved:', outputFavicon);
      
      // Also copy to app/icon.png
      fs.copyFileSync(outputFavicon, outputAppIcon);
      console.log('Saved:', outputAppIcon);
    });
  });
