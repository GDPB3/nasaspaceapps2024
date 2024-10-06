const GAMMA = 0.8;
const INTENSITY_MAX = 255;

// https://stackoverflow.com/questions/1472514/convert-light-frequency-to-rgb
export function wavelength2rgb(wavelength: number): {
  r: number;
  g: number;
  b: number;
} {
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

  return { r: r * 255, g: g * 255, b: b * 255 };
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

// https://github.com/neilbartlett/color-temperature/blob/master/index.js
export function colorTemperature2rgb(kelvin: number) {
  const temperature = kelvin / 100.0;
  let red, green, blue;

  if (temperature < 66.0) {
    red = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 351.97690566805693`,
    // b -> 0.114206453784165`,
    // c -> -40.25366309332127
    //x -> (kelvin/100) - 55}
    red = temperature - 55.0;
    red =
      351.97690566805693 +
      0.114206453784165 * red -
      40.25366309332127 * Math.log(red);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  /* Calculate green */

  if (temperature < 66.0) {
    // a + b x + c Log[x] /.
    // {a -> -155.25485562709179`,
    // b -> -0.44596950469579133`,
    // c -> 104.49216199393888`,
    // x -> (kelvin/100) - 2}
    green = temperature - 2;
    green =
      -155.25485562709179 -
      0.44596950469579133 * green +
      104.49216199393888 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 325.4494125711974`,
    // b -> 0.07943456536662342`,
    // c -> -28.0852963507957`,
    // x -> (kelvin/100) - 50}
    green = temperature - 50.0;
    green =
      325.4494125711974 +
      0.07943456536662342 * green -
      28.0852963507957 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  }

  /* Calculate blue */

  if (temperature >= 66.0) {
    blue = 255;
  } else {
    if (temperature <= 20.0) {
      blue = 0;
    } else {
      // a + b x + c Log[x] /.
      // {a -> -254.76935184120902`,
      // b -> 0.8274096064007395`,
      // c -> 115.67994401066147`,
      // x -> kelvin/100 - 10}
      blue = temperature - 10;
      blue =
        -254.76935184120902 +
        0.8274096064007395 * blue +
        115.67994401066147 * Math.log(blue);
      if (blue < 0) blue = 0;
      if (blue > 255) blue = 255;
    }
  }

  return {
    r: Math.round(red),
    g: Math.round(green),
    b: Math.round(blue),
  };
}

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);
