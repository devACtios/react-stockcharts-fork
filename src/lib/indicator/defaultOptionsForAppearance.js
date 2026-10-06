

export const themes = {
	light: {
		BollingerBand: {
			stroke: {
				top: "#964B00",
				middle: "#000000",
				bottom: "#964B00",
			},
			fill: "#4682B4",
		},
		Envelopes: {
			stroke: {
				top: "#6BA583",
				bottom: "#FF0000",
			},
		},
		StandardDeviation: {
			stroke: "#964B00"
		},
		VIDYA: {
			stroke: "#964B00"
		},
		ADMIW: {
			stroke: {
				plus: "#6BA583",
				minus: "#FF0000",
				admiw: "#0000FF",
			}
		},
		ElderImpulse: {
			stroke: {
				up: "#6BA583",
				down: "#FF0000",
				neutral: "#0000FF",
			}
		},
		MACD: {
			fill: {
				divergence: "#4682B4"
			},
			stroke: {
				macd: "#FF0000",
				signal: "#00F300",
			},
		},
		osma: {
			fill: {
				divergence: "#4682B4"
			},
			stroke: {
				osma: "#FF0000",
				signal: "#00F300",
			},
		},
		FullStochasticOscillator: {
			stroke: {
				top: "#37a600",
				middle: "#b8ab00",
				bottom: "#37a600",
				dLine: "#17becf",
				kLine: "#ff7f0e",
			},
		},
		ichimoku: {
			stroke: {
				tenkan: "#964B00",
				kijun: "#4b4b4b",
				senkou_a: "#EE0000",
				senkou_b: "#009900",
				chikou: "#CCCCCC",
			},
			fill: "#4682B4",
		},

	},
	dark: {
		BollingerBand: {
			stroke: {
				top: "#964B00",
				middle: "#FF6600",
				bottom: "#964B00",
			},
			fill: "#4682B4",
		},
		Envelopes: {
			stroke: {
				top: "#6BA583",
				bottom: "#FF0000",
			},
		},
		StandardDeviation: {
			stroke: "#FF6600"
		},
		VIDYA: {
			stroke: "#964B00"
		},
		ADMIW: {
			stroke: {
				plus: "#6BA583",
				minus: "#FF0000",
				admiw: "#0000FF",
			}
		},
		ElderImpulse: {
			stroke: {
				up: "#6BA583",
				down: "#FF0000",
				neutral: "#0000FF",
			}
		},
		MACD: {
			fill: {
				divergence: "#FF6600"
			},
			stroke: {
				macd: "#ea2bff",
				signal: "#74d400",
			},
		},
		osma: {
			fill: {
				divergence: "#FF6600"
			},
			stroke: {
				osma: "#ea2bff",
				signal: "#74d400",
			},
		},
		FullStochasticOscillator: {
			stroke: {
				top: "#37a600",
				middle: "#b8ab00",
				bottom: "#37a600",
				dLine: "#ea2bff",
				kLine: "#74d400"
			}
		},
		ichimoku: {
			stroke: {
				tenkan: "#964B00",
				kijun: "#964B00",
				senkou_a: "red",
				senkou_b: "green",
				chikou: "#964B06",
			},
			fill: "#4682B4",
		},

	}
};

export const BollingerBand = themes.light.BollingerBand;
export const ElderImpulse = themes.light.ElderImpulse;
export const MACD = themes.light.MACD;
export const osma = themes.light.osma;
export const FullStochasticOscillator = themes.light.FullStochasticOscillator;
