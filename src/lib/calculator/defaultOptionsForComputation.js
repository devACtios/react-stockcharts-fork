

export const BollingerBand = {
	windowSize: 20,
	sourcePath: "close",
	multiplier: 2,
	movingAverageType: "sma"
};

export const StandardDeviation = {
	windowSize: 20,
	sourcePath: "close"
};

export const Envelopes = {
	windowSize: 20,
	basisPoints: 1000,
	sourcePath: "close"
};

export const ADMIW = {
	windowSize: 14,
};

export const VIDYA = {
	windowSize: 20,
	sourcePath: "close"
};

export const ADX = {
	windowSize: 14,
};

export const ATR = {
	windowSize: 14,
	movingAverageType: "sma",
};

export const ForceIndex = {
	sourcePath: "close", // "high", "low", "open", "close"
	volumePath: "volume",
};
export const SmoothedForceIndex = {
	sourcePath: "close", // "high", "low", "open", "close"
	volumePath: "volume",
	smoothingType: "ema",
	smoothingWindow: 13,
};
export const Change = {
	sourcePath: "close", // "high", "low", "open", "close"
};
export const Compare = {
	basePath: "close",
	mainKeys: ["open", "high", "low", "close"],
	compareKeys: [],
};

export const ElderRay = {
	windowSize: 13,
	sourcePath: "close", // "high", "low", "open", "close"
	movingAverageType: "sma",
};

export const ElderImpulse = {
	sourcePath: "close", // "high", "low", "open", "close"
};

export const SAR = {
	accelerationFactor: 0.02,
	maxAccelerationFactor: 0.2,
};

export const MACD = {
	fast: 12,
	slow: 26,
	signal: 9,
	sourcePath: "close",
};

export const FullStochasticOscillator = {
	windowSize: 12,
	kWindowSize: 3,
	dWindowSize: 3,
	movingAverageType: "sma",
};

export const RSI = {
	windowSize: 14,
	sourcePath: "close", // "high", "low", "open", "close"
};

export const EMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const SMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const VMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const SMMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const KAMA = {
	sourcePath: "close",
	windowSize: 10,
	fast_ma_period: 2.0,
	slow_ma_period: 30.0,
};

export const HMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const FRAMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const DEMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const TEMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const MAMA = {
	sourcePath: "close",
	windowSize: 10,
	fastLimit: 0.5,
	slowLimit: 0.05,
};

export const WMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const WPR = {
	windowSize: 10,
};

export const TMA = {
	sourcePath: "close",
	windowSize: 10,
};

export const Kagi = {
	reversalType: "ATR", // "ATR", "FIXED"
	windowSize: 14,
	reversal: 2,
	sourcePath: "close", // "high", "low", "open", "close"
};

export const Renko = {
	reversalType: "ATR", // "ATR", "FIXED"
	windowSize: 14,
	fixedBrickSize: 2,
	sourcePath: "high/low", // "close", "high/low"
};

export const PointAndFigure = {
	boxSize: 0.5,
	reversal: 3,
	sourcePath: "high/low", // "close", "high/low"
};

/* new indicators*/
/* the volume indicators*/
export const OBV = {
	source: d => ({ volume: d.volume, close: d.close }),
	sourcePath: "volume/close",
	windowSize: 10,
};

export const MFI = {
	source: d => ({ volume: d.volume, high: d.high, low: d.low }),
	sourcePath: "volume/high/low",
	windowSize: 10,
};

export const A_D = {
	source: d => ({ volume: d.volume, high: d.high, low: d.low, close: d.close }),
	sourcePath: "volume/high/low/close",
	windowSize: 10,
};

export const VOLUME = {
	sourcePath: "volume",
};

export const VOLUME_AVG = {
	sourcePath: "volume",
	windowSize: 10,
	movingAverageType: "sma",
};

export const keltnerchannel = {
	windowSize: 20,
	windowSize_atr: 10,
	sourcePath: "close",
	multiplier: 2,
	movingAverageType: "ema"
};

export const donchianchannel = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
	multiplier: 2,
	percent: 50
};

export const ichimoku = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low, close: d.close }),
	sourcePath: "high/low/close",
	tenkanPeriod: 9,
	kijunPeriod: 26,
	senkouPeriod: 52
};

export const lri = {
	sourcePath: "close",
	windowSize: 10,
};

export const tirone = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low, close: d.close }),
	sourcePath: "high/low/close",
};

export const aroon = {
	windowSize: 25,
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
	uplineSize: 70,
	middlelineSize: 50,
	bottomlineSize: 30
};

export const aroonOscillator = {
	sourcePath: "high/low",
	windowSize: 25,
};

export const bearpower = {
	sourcePath: "low/close",
	windowSize: 5,
};

export const bullpower = {
	sourcePath: "high/close",
	windowSize: 5,
};

export const cci = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
	upborder: 100,
	bottomborder: -100,
};

export const demarker = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
};

export const dpo = {
	sourcePath: "close",
	windowSize: 20,
};

export const momentum = {
	sourcePath: "close",
	windowSize: 10,
};

export const williams_r = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low, close: d.close }),
	sourcePath: "high/low/close",
	upborder: 20,
	bottomborder: -80,
};

export const vhf = {
	sourcePath: "close",
	windowSize: 20,
};

export const rvi = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low, open: d.open, close: d.close }),
	sourcePath: "high/low/open/close",
};

export const qstick = {
	windowSize: 20,
	source: d => ({ open: d.open, close: d.close }),
	sourcePath: "open/close",
	movingAverageType: "sma",
};

export const emv = {
	windowSize: 20,
	windowSizeSignal: 14,
	sourcePath: "high/low/volume",
	movingAverageType: "sma",
	movingAverageTypeSignal: "sma",
};

export const osma = {
	fast: 12,
	slow: 26,
	signal: 9,
	MAfast: "sma",
	MAslow: "sma",
	MAsignal: "sma",
	sourcePath: "close",
};

export const cho = {
	windowSize: 20,
	maPeriod1: 3,
	maPeriod2: 10,
};

export const roc = {
	sourcePath: "close",
	windowSize: 20,
};

export const mi = {
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
	MassPeriod: 25,
	windowSize: 5,
	movingAverageType: "sma"
};

export const bw_mfi = {
	source: d => ({ high: d.high, low: d.low, volume: d.volume }),
	sourcePath: "high/low/volume",
	multiplier: 100000,
	windowSize: 10,
};

export const AC = {
	windowSize: 20,
	source: d => ({ high: d.high, low: d.low }),
	sourcePath: "high/low",
	FastMAPeriod: 5,
	SlowMAPeriod: 34,
};
