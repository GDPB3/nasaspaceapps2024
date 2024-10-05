const GAMMA = 0.8;
const INTENSITY_MAX = 255;

// https://stackoverflow.com/questions/1472514/convert-light-frequency-to-rgb
export function wavelength2rgb(wavelength: number): [number, number, number] {
  let factor: number;
  let r, g, b: number;

  if (wavelength >= 380 && wavelength <= 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength < 781) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else {
    r = 0.0;
    g = 0.0;
    b = 0.0;
  }

  // Let the intensity fall off near the vision limits

  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 701) {
    factor = 1.0;
  } else if (wavelength >= 701 && wavelength < 781) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700);
  } else {
    factor = 0.0;
  }

  // Don't want 0^x = 1 for x <> 0
  r = r == 0.0 ? 0 : Math.round(INTENSITY_MAX * Math.pow(r * factor, GAMMA));
  g = g == 0.0 ? 0 : Math.round(INTENSITY_MAX * Math.pow(g * factor, GAMMA));
  b = b == 0.0 ? 0 : Math.round(INTENSITY_MAX * Math.pow(b * factor, GAMMA));

  return [r, g, b];
}

// https://stackoverflow.com/a/54070620
// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
export function rgb2hsv(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

// https://stackoverflow.com/a/54024653
// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
export function hsv2rgb(
  h: number,
  s: number,
  v: number
): [number, number, number] {
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);
