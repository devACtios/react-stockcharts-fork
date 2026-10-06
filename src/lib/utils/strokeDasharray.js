export const strokeDashTypes = [
	"Solid",
	"ShortDash",
	"ShortDash2",
	"ShortDash3",
	"ShortDot",
	"ShortDashDot",
	"ShortDashDotDot",
	"Dot",
	"Dash",
	"LongDash",
	"DashDot",
	"LongDashDot",
	"LongDashDotDot",
];

export function getStrokeDasharrayCanvas(type) {
	const a = getStrokeDasharray(type).split(",");

	if (a.length === 1) return [];

	return a.map(d => Number(d));

}

export function  getStrokeDasharraySVG(type) {
	return getStrokeDasharray(type).replace(/,/g, "");
}

export const getStrokeDasharray = (type) => {
	switch (type) {
		default:
		case "Solid":
			return "";
		case "ShortDash":
			return "6, 2";
		case "ShortDash2":
			return "6, 3";
		case "ShortDash3":
			return "4, 4";
		case "ShortDash4":
			return "5, 4";
		case "ShortDash5":
			return "3, 1";
		case "ShortDot":
			return "2, 2";
		case "ShortDashDot":
			return "6, 2, 2, 2";
		case "ShortDashDotDot":
			return "6, 2, 2, 2, 2, 2";
		case "Dot":
			return "2, 6";
		case "Dash":
			return "8, 6";
		case "LongDash":
			return "16, 6";
		case "DashDot":
			return "8, 6, 2, 6";
		case "LongDashDot":
			return "16, 6, 2, 6";
		case "LongDashDotDot":
			return "16, 6, 2, 6, 2, 6";
	}
};
