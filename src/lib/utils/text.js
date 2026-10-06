export class FormatText {

	constructor() {
		this._rows = [[]];
		this._rowText = "";
	}

	get rowText() {
		return this._rowText;
	}

	get rows() {
		return this._rows;
	}

	get length() {
		return this._rows.length;
	}

	get lastRow() {
		return this._rows[this._rows.length - 1];
	}

	nextRow() {
		this._rowText = "";
		if (this.lastRow && this.lastRow.length > 0) {
			this._rows.push([]);
		}
	}

	addPackToRow(pack) {
		if (pack === " " && this.lastRow.length === 0) {
			return;
		} else {
			this._rowText = this._rowText + pack;
			this.lastRow.push(pack);
		}
	}

}

export function textWidth({ strokeWidth, font }, text) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	// eslint-disable-next-line const-immutable/no-mutation
	ctx.font = strokeWidth + "px " + font;
	const measureText = ctx.measureText(text);
	return measureText.width;
}

export function trimString(string, maxRowText, { strokeWidth, font }) {
	const dots = "...";
	const dotsWidth = textWidth({ strokeWidth, font }, dots);
	const maxFreeRowText = maxRowText - dotsWidth;

	return function recursion(str) {
		const stringWidth = textWidth({ strokeWidth, font }, str);
		if (stringWidth > maxFreeRowText) {
			return recursion(str.slice(0, -1), maxFreeRowText);
		} else {
			return str + dots;
		}
	}(string);
}

export function splitTextByRows({ maxRowWidth, maxRows, strokeWidth, font }, text) {
	const separator = /(\s|\t|\n|\v|\f|\r|[-,_.:;])/g;
	const packs = text ? text.split(separator) : [];

	let maxRow = 0;
	const rows = new FormatText();
	let isFull = false;

	packs.forEach((pack) => {
		if (isFull) {
			return;
		} else {
			let newRowWidth = textWidth({ strokeWidth, font }, rows.rowText + pack);
			if (newRowWidth < maxRowWidth) {
				if (pack === "\n") {
					rows.nextRow();
				} else {
					rows.addPackToRow(pack);
				}
			} else if (rows.length - 1 === maxRows) {
				rows.nextRow();
				rows.addPackToRow("...");
				isFull = true;
			} else { // new row
				const packWidth = textWidth({ strokeWidth, font }, pack);

				rows.nextRow();
				if (packWidth < maxRowWidth) {
					rows.addPackToRow(pack);
				} else {
					const trimPack = trimString(pack, maxRowWidth, { strokeWidth, font });
					newRowWidth = textWidth({ strokeWidth, font }, trimPack);
					rows.addPackToRow(trimPack);
					isFull = rows.length - 1 === maxRows;
				}
			}
			if (rows.length - 1 === maxRows && isFull) {
				rows.nextRow();
				rows.addPackToRow("...");
			}
			if (newRowWidth < maxRowWidth && maxRow < newRowWidth) {
				maxRow = newRowWidth;
			}
		}
	});

	return {
		rows: rows.rows,
		maxRow,
	};
}