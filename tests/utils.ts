import type { Result } from '../src/leagues/types';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Ratings } from '../src/rulesets/rulesets';
import type { TrueSkillConfig } from '../src/rulesets/types';

export function expectedElo(
  elo: { home: number; away: number },
  result: Result,
  scale: number,
  k: number
): { home: number; away: number } {
  const qH = 10 ** (elo.home / scale);
  const qA = 10 ** (elo.away / scale);
  const delta = Math.round(k * (result.homeWin - qH / (qA + qH)));
  return {
    home: elo.home + delta,
    away: elo.away - delta,
  };
}

export function makeTempDir(prefix: string) {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function expectedTrueSkill(
  ratings: Ratings,
  result: Result,
  config: TrueSkillConfig,
  sigma0: number
): Ratings {
  const homeSkillMean = ratings.home.rating + config.conservatism * ratings.home.uncertainty;
  const homeUncertainty = Math.sqrt(ratings.home.uncertainty ** 2 + config.driftRate ** 2);
  const awayUncertainty = Math.sqrt(ratings.away.uncertainty ** 2 + config.driftRate ** 2);
  const awaySkillMean = ratings.away.rating + config.conservatism * ratings.away.uncertainty;
  const performanceVariance =
    2 * config.performanceNoise ** 2 + homeUncertainty ** 2 + awayUncertainty ** 2;
  const epsilon =
    drawMarginFromRate(config.drawRate, config.performanceNoise, sigma0) /
    Math.sqrt(performanceVariance);
  let teamUpdates;
  if (result.homeWin == 1 || result.homeWin == 0) {
    const performanceDiff =
      ((2 * result.homeWin - 1) * (homeSkillMean - awaySkillMean)) / Math.sqrt(performanceVariance);
    const v = vWinSafe(performanceDiff - epsilon);
    const w = wWin(performanceDiff - epsilon);
    teamUpdates = {
      home: {
        rating:
          homeSkillMean +
          (2 * result.homeWin - 1) * (homeUncertainty ** 2 / Math.sqrt(performanceVariance)) * v,
        uncertainty: Math.sqrt(
          homeUncertainty ** 2 * (1 - w * (homeUncertainty ** 2 / performanceVariance))
        ),
      },
      away: {
        rating:
          awaySkillMean -
          (2 * result.homeWin - 1) * (awayUncertainty ** 2 / Math.sqrt(performanceVariance)) * v,
        uncertainty: Math.sqrt(
          awayUncertainty ** 2 * (1 - w * (awayUncertainty ** 2 / performanceVariance))
        ),
      },
    };
  } else {
    const performanceDiff = (homeSkillMean - awaySkillMean) / Math.sqrt(performanceVariance);
    const a = -performanceDiff - epsilon;
    const b = epsilon - performanceDiff;
    const v = vDraw(a, b);
    const w = wDraw(a, b);
    teamUpdates = {
      home: {
        rating: homeSkillMean + (homeUncertainty ** 2 / Math.sqrt(performanceVariance)) * v,
        uncertainty: Math.sqrt(
          homeUncertainty ** 2 * (1 - w * (homeUncertainty ** 2 / performanceVariance))
        ),
      },
      away: {
        rating: awaySkillMean - (awayUncertainty ** 2 / Math.sqrt(performanceVariance)) * v,
        uncertainty: Math.sqrt(
          awayUncertainty ** 2 * (1 - w * (awayUncertainty ** 2 / performanceVariance))
        ),
      },
    };
  }
  return {
    home: {
      rating: teamUpdates.home.rating - config.conservatism * teamUpdates.home.uncertainty,
      uncertainty: teamUpdates.home.uncertainty,
    },
    away: {
      rating: teamUpdates.away.rating - config.conservatism * teamUpdates.away.uncertainty,
      uncertainty: teamUpdates.away.uncertainty,
    },
  };
}

// Standard normal PDF
function phi(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Standard normal CDF using the error function approximation
// Abramowitz & Stegun approximation (accurate to ~1.5e-7)
function Phi(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Scale for erf → Phi conversion
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * z);
  const erfc = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return x < 0 ? 0.5 * erfc : 1 - 0.5 * erfc;
}

function PhiInverse(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  // Rational approximation for central region
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ] as const;
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ] as const;
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ] as const;
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ] as const;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

// Calculate draw margin from observed draw rate
function drawMarginFromRate(drawRate: number, beta: number, sigma0: number): number {
  const cDefault = Math.sqrt(2 * beta * beta + 2 * sigma0 * sigma0);
  return cDefault * PhiInverse((1 + drawRate) / 2);
}

// Inverse Mills ratio: v(t) = φ(t) / Φ(t)
function vWinSafe(t: number, delta = 1e-10): number {
  const cdf = Phi(t);
  if (cdf <= delta) {
    return -t - 1 / t;
  }
  return phi(t) / cdf;
}

// Variance correction: w(t) = v(t) * (v(t) + t)
function wWin(t: number): number {
  const v = vWinSafe(t);
  return v * (v + t);
}

function vDraw(a: number, b: number, delta = 1e-10): number {
  const denom = Phi(b) - Phi(a);
  if (denom < delta) {
    return (a + b) / 2;
  }
  return (phi(a) - phi(b)) / (Phi(b) - Phi(a));
}
function wDraw(a: number, b: number, delta = 1e-10): number {
  const denom = Phi(b) - Phi(a);
  if (denom < delta) {
    return 1;
  }
  const v = vDraw(a, b);
  const raw = v ** 2 - (a * phi(a) - b * phi(b)) / denom;
  return Math.min(Math.max(raw, 0), 1);
}
