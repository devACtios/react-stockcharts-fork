

import { timeFormat, timeFormatDefaultLocale } from "d3-time-format";

import financeDiscontinuousScale from "./financeDiscontinuousScale";
import { slidingWindow, zipper, identity, isNotDefined, last } from "../utils";
import { defaultFormatters, levelDefinition } from "./levels";

function evaluateLevel(d, date, i, formatters) {
	return levelDefinition
		.map((eachLevel, idx) => {
			return {
				level: levelDefinition.length - idx - 1,
				format: formatters[eachLevel(d, date, i)]
			};
		})
		.find(l => !!l.format);
}

const discontinuousIndexCalculator = slidingWindow()
	.windowSize(2)
	.undefinedValue((d, idx, { initialIndex, formatters }) => {
		const i = initialIndex;
		const row = {
			date: d.getTime(),
			startOf30Seconds: false,
			startOfMinute: false,
			startOf5Minutes: false,
			startOf15Minutes: false,
			startOf30Minutes: false,
			startOfHour: false,
			startOfEighthOfADay: false,
			startOfQuarterDay: false,
			startOfHalfDay: false,
			startOfDay: true,
			startOfWeek: false,
			startOfMonth: false,
			startOfQuarter: false,
			startOfYear: false,
		};
		const level = evaluateLevel(row, d, i, formatters);
		return { ...row, index: i, ...level };
	});

const discontinuousIndexCalculatorLocalTime = discontinuousIndexCalculator
	.accumulator(([prevDate, nowDate], i, idx, { initialIndex, formatters }) => {
		const startOf30Seconds = nowDate.getSeconds() % 30 === 0;

		const startOfMinute = nowDate.getMinutes() !== prevDate.getMinutes();
		const startOf5Minutes = startOfMinute && nowDate.getMinutes() % 5 <= prevDate.getMinutes() % 5;
		const startOf15Minutes = startOfMinute && nowDate.getMinutes() % 15 <= prevDate.getMinutes() % 15;
		const startOf30Minutes = startOfMinute && nowDate.getMinutes() % 30 <= prevDate.getMinutes() % 30;

		const startOfHour = nowDate.getHours() !== prevDate.getHours();

		const startOfEighthOfADay = startOfHour && nowDate.getHours() % 3 === 0;
		const startOfQuarterDay = startOfHour && nowDate.getHours() % 6 === 0;
		const startOfHalfDay = startOfHour && nowDate.getHours() % 12 === 0;

		const startOfDay = nowDate.getDay() !== prevDate.getDay();
		// According to ISO calendar
		// Sunday = 0, Monday = 1, ... Saturday = 6
		// day of week of today < day of week of yesterday then today is start of week
		const startOfWeek = nowDate.getDay() < prevDate.getDay();
		// month of today != month of yesterday then today is start of month
		const startOfMonth = nowDate.getMonth() !== prevDate.getMonth();
		// if start of month and month % 3 === 0 then it is start of quarter
		const startOfQuarter = startOfMonth && (nowDate.getMonth() % 3 <= prevDate.getMonth() % 3);
		// year of today != year of yesterday then today is start of year
		const startOfYear = nowDate.getFullYear() !== prevDate.getFullYear();

		const row = {
			date: nowDate.getTime(),
			startOf30Seconds,
			startOfMinute,
			startOf5Minutes,
			startOf15Minutes,
			startOf30Minutes,
			startOfHour,
			startOfEighthOfADay,
			startOfQuarterDay,
			startOfHalfDay,
			startOfDay,
			startOfWeek,
			startOfMonth,
			startOfQuarter,
			startOfYear,
		};
		const level = evaluateLevel(row, nowDate, i, formatters);
		if (level == null) {
			console.log(row);
		}
		return { ...row, index: i + initialIndex, ...level };
	});

function doStuff(realDateAccessor, inputDateAccessor, initialIndex, formatters) {
	return function(data) {
		const dateAccessor = realDateAccessor(inputDateAccessor);
		const calculate = discontinuousIndexCalculatorLocalTime
			.source(dateAccessor)
			.misc({ initialIndex, formatters });

		const index = calculate(data).map(each => {
			const { format } = each;
			return {
				// ...each,
				index: each.index,
				level: each.level,
				date: new Date(each.date),
				format: timeFormat(format),
			};
		});

		return { index };
	};
}

export function discontinuousTimeScaleProviderBuilder() {
	let initialIndex = 0, realDateAccessor = identity;
	let inputDateAccessor = d => d.date,
		indexAccessor = d => d.idx,
		indexMutator = (d, idx) => ({ ...d, idx }),
		withIndex;

	let currentFormatters = defaultFormatters;
	let futureInterval = 0;
	let futureIntervalRepeat = 0;

	// eslint-disable-next-line prefer-const
	let discontinuousTimeScaleProvider = function(data, options = {}) {
		/*
		console.warn("Are you sure you want to use a discontinuousTimeScale?"
			+ " Use this only if you have discontinuous data which"
			+ " needs to be displayed as continuous."
			+ " If you have continuous data use a d3 scale like"
			+ " `d3.scaleTime`"
		);
		*/
		const currentFutureInterval = options.futureInterval !== undefined
			? options.futureInterval
			: futureInterval;
		const currentFutureIntervalRepeat = options.futureIntervalRepeat !== undefined
			? options.futureIntervalRepeat
			: futureIntervalRepeat;

		let index = withIndex;

		if (data.length > 0 &&
			currentFutureInterval > 0 &&
			currentFutureIntervalRepeat > 0) {

			const lastDate = data[data.length - 2].date.getTime();
			const extendedData = [...data];

			for (let i = 2; i < (currentFutureIntervalRepeat + 2); i++) {
				const newDate = new Date(lastDate + currentFutureInterval * i);

				const futureItem = {
					date: newDate,
					fake: true,
				};

				extendedData.push(futureItem);
			}
			data = extendedData;
		}

		if (isNotDefined(index)) {
			const response = doStuff(
				realDateAccessor,
				inputDateAccessor,
				initialIndex,
				currentFormatters
			)(data);

			index = response.index;
		} else if (index && index.length < data.length) {
			const diff = data.length - index.length;
			const diffArray = data.slice(data.length - diff, data.length);
			const response = doStuff(realDateAccessor, inputDateAccessor, last(index).index + 1, currentFormatters)(diffArray);

			index = index.concat(response.index);
		}

		const inputIndex = index;
		const xScale = financeDiscontinuousScale(
			inputIndex,
		);

		const mergedData = zipper().combine(indexMutator);
		const finalData = mergedData(data, inputIndex);

		return {
			data: finalData,
			xScale,
			xAccessor: d => d && indexAccessor(d).index,
			displayXAccessor: realDateAccessor(inputDateAccessor),
		};
	};

	discontinuousTimeScaleProvider.initialIndex = function(x) {
		if (!arguments.length) {
			return initialIndex;
		}
		initialIndex = x;
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.inputDateAccessor = function(x) {
		if (!arguments.length) {
			return inputDateAccessor;
		}
		inputDateAccessor = x;
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.indexAccessor = function(x) {
		if (!arguments.length) {
			return indexAccessor;
		}
		indexAccessor = x;
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.indexMutator = function(x) {
		if (!arguments.length) {
			return indexMutator;
		}
		indexMutator = x;
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.withIndex = function(x) {
		if (!arguments.length) {
			return withIndex;
		}
		withIndex = x;
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.utc = function() {
		realDateAccessor = dateAccessor => d => {
			const date = dateAccessor(d);
			// The getTimezoneOffset() method returns the time-zone offset from UTC, in minutes, for the current locale.
			const offsetInMillis = date.getTimezoneOffset() * 60 * 1000;
			return new Date(date.getTime() + offsetInMillis);
		};
		return discontinuousTimeScaleProvider;
	};
	discontinuousTimeScaleProvider.setLocale = function(locale, formatters = null) {
		if (locale) {
			timeFormatDefaultLocale(locale);
		}
		if (formatters) {
			currentFormatters = formatters;
		}
		return discontinuousTimeScaleProvider;
	};

	discontinuousTimeScaleProvider.futureXAxisPadding = function({ interval, repeat }) {
		if (!arguments.length) {
			return { interval: futureInterval, repeat: futureIntervalRepeat };
		}
		futureInterval = interval;
		futureIntervalRepeat = repeat;
		return discontinuousTimeScaleProvider;
	};

	discontinuousTimeScaleProvider.indexCalculator = function() {
		return doStuff(realDateAccessor, inputDateAccessor, initialIndex, currentFormatters);
	};

	return discontinuousTimeScaleProvider;
}

export default discontinuousTimeScaleProviderBuilder();
