/*!
 * Infinitia Links — tiny dependency-free QR code encoder.
 * Byte mode, error-correction level M, versions 1–10 (up to ~210 bytes).
 * Exposes window.QR with encode(), toSVG() and drawToCanvas().
 */
(function (global) {
  'use strict';

  // Error-correction codewords per block and number of blocks (level M), index = version.
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  var NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  var MAX_VERSION = 10;

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }

  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }

  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDivisor(degree) {
    var r = [];
    for (var i = 0; i < degree - 1; i++) r.push(0);
    r.push(1);
    var root = 1;
    for (i = 0; i < degree; i++) {
      for (var j = 0; j < r.length; j++) {
        r[j] = gfMul(r[j], root);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      root = gfMul(root, 0x02);
    }
    return r;
  }

  function rsRemainder(data, divisor) {
    var r = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ r.shift();
      r.push(0);
      divisor.forEach(function (coef, i) { r[i] ^= gfMul(coef, factor); });
    });
    return r;
  }

  function utf8Bytes(str) {
    if (global.TextEncoder) return Array.prototype.slice.call(new TextEncoder().encode(str));
    return unescape(encodeURIComponent(str)).split('').map(function (c) { return c.charCodeAt(0); });
  }

  function alignmentPositions(ver, size) {
    if (ver === 1) return [];
    var n = Math.floor(ver / 7) + 2;
    var step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2;
    var result = [6];
    for (var pos = size - 7; result.length < n; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  function maskFn(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
      case 5: return (x * y) % 2 + (x * y) % 3 === 0;
      case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
      default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
    }
  }

  /** Encode text and return a square boolean matrix (true = dark). */
  function encode(text) {
    var bytes = utf8Bytes(String(text));
    var ver;
    for (ver = 1; ver <= MAX_VERSION; ver++) {
      var ccBits = ver < 10 ? 8 : 16;
      if (4 + ccBits + bytes.length * 8 <= dataCodewords(ver) * 8) break;
    }
    if (ver > MAX_VERSION) throw new Error('QR: text too long');

    // --- Data bit stream
    var bits = [];
    function push(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    push(4, 4);
    push(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { push(b, 8); });
    var capacity = dataCodewords(ver) * 8;
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (var j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      data.push(byte);
    }

    // --- Split into blocks, add error correction, interleave
    var numBlocks = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver];
    var rawCodewords = Math.floor(rawModules(ver) / 8);
    var numShort = numBlocks - rawCodewords % numBlocks;
    var shortLen = Math.floor(rawCodewords / numBlocks);
    var divisor = rsDivisor(eccLen);
    var blocks = [];
    for (var b = 0, k = 0; b < numBlocks; b++) {
      var len = shortLen - eccLen + (b < numShort ? 0 : 1);
      var dat = data.slice(k, k + len);
      k += len;
      var ecc = rsRemainder(dat, divisor);
      if (b < numShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var codewords = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (b = 0; b < blocks.length; b++) {
        if (i !== shortLen - eccLen || b >= numShort) codewords.push(blocks[b][i]);
      }
    }

    // --- Build the matrix
    var size = ver * 4 + 17;
    var mod = [], fn = [];
    for (i = 0; i < size; i++) {
      mod.push(new Array(size).fill(false));
      fn.push(new Array(size).fill(false));
    }
    function set(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }

    for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }

    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
        }
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

    var al = alignmentPositions(ver, size), n = al.length;
    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    function drawFormat(mask) {
      var d = (0 << 3) | mask; // level M = 0b00
      var rem = d;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var f = ((d << 10) | rem) ^ 0x5412;
      function bit(i) { return ((f >>> i) & 1) === 1; }
      for (i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, true);
    }
    drawFormat(0);

    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vbits = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var bt = ((vbits >>> i) & 1) === 1;
        var a = size - 11 + (i % 3), c = Math.floor(i / 3);
        set(a, c, bt); set(c, a, bt);
      }
    }

    // --- Place codewords in zig-zag order
    var bitIdx = 0, total = codewords.length * 8;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var v = 0; v < size; v++) {
        for (j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - v : v;
          if (!fn[y][x] && bitIdx < total) {
            mod[y][x] = ((codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx++;
          }
        }
      }
    }

    function applyMask(mask) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          if (!fn[y][x] && maskFn(mask, x, y)) mod[y][x] = !mod[y][x];
        }
      }
    }

    function penalty() {
      var p = 0, dark = 0, x, y, run;
      for (y = 0; y < size; y++) {
        run = 1;
        for (x = 1; x < size; x++) {
          if (mod[y][x] === mod[y][x - 1]) run++;
          else { if (run >= 5) p += run - 2; run = 1; }
        }
        if (run >= 5) p += run - 2;
      }
      for (x = 0; x < size; x++) {
        run = 1;
        for (y = 1; y < size; y++) {
          if (mod[y][x] === mod[y - 1][x]) run++;
          else { if (run >= 5) p += run - 2; run = 1; }
        }
        if (run >= 5) p += run - 2;
      }
      for (y = 0; y < size - 1; y++) {
        for (x = 0; x < size - 1; x++) {
          var c = mod[y][x];
          if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3;
        }
      }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (mod[y][x]) dark++;
      var t = size * size;
      p += (Math.ceil(Math.abs(dark * 20 - t * 10) / t) - 1) * 10;
      return p;
    }

    var best = 0, bestScore = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m);
      drawFormat(m);
      var score = penalty();
      if (score < bestScore) { bestScore = score; best = m; }
      applyMask(m);
    }
    applyMask(best);
    drawFormat(best);
    return mod;
  }

  var cache = {};
  function matrix(text) {
    if (!cache[text]) cache[text] = encode(text);
    return cache[text];
  }

  /** Return an SVG string for the QR code. */
  function toSVG(text, opts) {
    opts = opts || {};
    var m = matrix(text), size = m.length, margin = opts.margin == null ? 0 : opts.margin;
    var dim = size + margin * 2, d = '';
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (m[y][x]) d += 'M' + (x + margin) + ' ' + (y + margin) + 'h1v1h-1z';
      }
    }
    return '<svg class="' + (opts.className || 'qr-svg') + '" viewBox="0 0 ' + dim + ' ' + dim +
      '" shape-rendering="crispEdges" role="img" aria-label="' + (opts.label || 'QR code') + '">' +
      (opts.light ? '<rect width="100%" height="100%" fill="' + opts.light + '"/>' : '') +
      '<path fill="' + (opts.dark || '#0A1433') + '" d="' + d + '"/></svg>';
  }

  /** Draw the QR into a 2D canvas context at (x, y) with total width w (no quiet zone). */
  function drawToCanvas(ctx, text, x, y, w, color) {
    var m = matrix(text), size = m.length, cell = w / size;
    ctx.fillStyle = color || '#0A1433';
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (m[r][c]) ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }
  }

  global.QR = { encode: encode, matrix: matrix, toSVG: toSVG, drawToCanvas: drawToCanvas };
})(typeof window !== 'undefined' ? window : globalThis);
