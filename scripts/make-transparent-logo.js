const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = 'C:\\Users\\Marcio\\.gemini\\antigravity-ide\\brain\\974cf50e-08ab-4013-ac26-4b7fb7bdb9d9\\.user_uploaded\\media_1789259637213.png';
const outputPath = 'C:\\Users\\Marcio\\PROJETO ESCALA DE SERVIÇO\\DIAMOND RELICS\\public\\diamond-relics-logo.png';

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const w = this.width;
    const h = this.height;
    const data = this.data;

    const getIdx = (x, y) => (y * w + x) << 2;

    // 1. Flood fill from borders to identify ONLY exterior background
    const visited = new Uint8Array(w * h);
    const queue = [];

    // Push all outer border pixels
    for (let x = 0; x < w; x++) {
      queue.push([x, 0], [x, h - 1]);
      visited[0 * w + x] = 1;
      visited[(h - 1) * w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      queue.push([0, y], [w - 1, y]);
      visited[y * w + 0] = 1;
      visited[y * w + (w - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      const idx = getIdx(cx, cy);
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const goldHueDiff = r - b;
      const minVal = Math.min(r, g, b);

      // It's background if it's very light/white and not golden
      // (Gold has goldHueDiff > 35)
      const isBg = minVal > 210 && goldHueDiff < 40;

      if (isBg) {
        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const pos = ny * w + nx;
            if (!visited[pos]) {
              visited[pos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    // 2. Also flood-fill from inside enclosed letter holes (like inside the 'D', 'O', 'R')
    // Find white areas inside letter cavities
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const pos = y * w + x;
        if (!visited[pos]) {
          const idx = getIdx(x, y);
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const minVal = Math.min(r, g, b);
          const goldHueDiff = r - b;

          // Pure white letter hole (R,G,B > 248)
          if (minVal > 248 && goldHueDiff < 10) {
            // Found an internal white cavity! Fill it
            const cavityQueue = [[x, y]];
            visited[pos] = 1;
            let cHead = 0;
            while (cHead < cavityQueue.length) {
              const [ccx, ccy] = cavityQueue[cHead++];
              const nList = [
                [ccx + 1, ccy],
                [ccx - 1, ccy],
                [ccx, ccy + 1],
                [ccx, ccy - 1]
              ];
              for (const [nx, ny] of nList) {
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                  const npos = ny * w + nx;
                  if (!visited[npos]) {
                    const nidx = getIdx(nx, ny);
                    const nr = data[nidx];
                    const ng = data[nidx + 1];
                    const nb = data[nidx + 2];
                    if (Math.min(nr, ng, nb) > 220 && (nr - nb) < 35) {
                      visited[npos] = 1;
                      cavityQueue.push([nx, ny]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // 3. Apply transparency ONLY to visited background pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pos = y * w + x;
        const idx = getIdx(x, y);

        if (visited[pos]) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const minVal = Math.min(r, g, b);
          const goldHueDiff = r - b;

          if (minVal >= 235 || goldHueDiff < 20) {
            data[idx + 3] = 0; // completely transparent
          } else {
            // Anti-aliased transition edge
            const alpha = Math.max(0, Math.min(255, (235 - minVal) * 5));
            data[idx + 3] = alpha;
            // Darken slightly for clean blending on dark background
            data[idx] = Math.round(r * 0.4);
            data[idx + 1] = Math.round(g * 0.4);
            data[idx + 2] = Math.round(b * 0.4);
          }
        }
      }
    }

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Flawless transparent PNG generated at:', outputPath);
    });
  });
