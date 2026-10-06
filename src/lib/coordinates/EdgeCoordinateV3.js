

import React from "react";

import { hexToRGBA, isDefined, getStrokeDasharray } from "../utils";

/* eslint-disable react/prop-types */
export function renderSVG(props) {
	const { className, arrowType } = props;

	const edge = helper(props);
	if (edge === null) return null;
	let line, dot, coordinateBase, coordinate;

	if (isDefined(edge.line)) {
		line = (
			<line
				className="react-stockcharts-cross-hair"
				strokeOpacity={edge.line.opacity}
				stroke={edge.line.stroke}
				strokeDasharray={getStrokeDasharray(edge.line.strokeDasharray)}
				x1={edge.line.x1}
				y1={edge.line.y1}
				x2={edge.line.x2}
				y2={edge.line.y2}
			/>
		);
	}
	if (isDefined(edge.dot)) {
		dot = (
			<circle
				className="react-stockcharts-dot"
				fill={edge.dot.fill}
				cx={edge.dot.cx}
				cy={edge.dot.cy}
				r={edge.dot.r}
			/>
		);
	}
	if (isDefined(edge.coordinateBase)) {
		const { rectWidth, rectHeight, arrowWidth, fixedTextBackground } = edge.coordinateBase;
		const path = (fixedTextBackground)
			? edge.orient === "left"
				? `M0,0L0,${rectHeight}L${rectWidth},${rectHeight}L${rectWidth +
					arrowWidth},10L${rectWidth},0L0,0L0,0`
				: `M0,${rectHeight / 2}L${arrowWidth},0 L${arrowWidth},${rectHeight} L0,${rectHeight / 2}`
			: edge.orient === "left"
				? `M0,0L0,${rectHeight}L${rectWidth},${rectHeight}L${rectWidth +
					arrowWidth},10L${rectWidth},0L0,0L0,0`
				: `M0,${rectHeight / 2}L${arrowWidth},${rectHeight}L${rectWidth +
					arrowWidth},${rectHeight}L${rectWidth +
					arrowWidth},0L${arrowWidth},0L0,${rectHeight / 2}`;
		const textPath =
			edge.orient === "left"
				? `M0,0L0,${rectHeight}L${rectWidth},${rectHeight}L${rectWidth +
					arrowWidth},10L${rectWidth},0L0,0L0,0`
				: `M${arrowWidth},${rectHeight}L${rectWidth +
					arrowWidth},${rectHeight}L${rectWidth +
					arrowWidth},0L${arrowWidth},0`;
		coordinateBase =
			arrowWidth && (edge.orient === "left" || edge.orient === "right") ? (
				<g
					key={1}
					transform={`translate(${edge.coordinateBase.edgeXRect},${
						edge.coordinateBase.edgeYRect
					})`}
				>
					{edge.coordinateBase.fixedTextBackground ? (
						<React.Fragment>
							{edge.coordinateBase.rectRadius ? (
								<rect
									key={1}
									className="react-stockchart-text-background-radius"
									x={arrowWidth + rectWidth - edge.coordinateBase.rectRadius}
									y={0}
									height={rectHeight}
									width={edge.coordinateBase.rectRadius * 2}
									fill={edge.coordinateBase.fixedTextBackground}
									opacity={edge.coordinateBase.opacity}
									rx={edge.coordinateBase.rectRadius}
									ry={edge.coordinateBase.rectRadius}
								/>
							) : null}
							{arrowType === "rect" &&
							<rect
								className="react-stockchart-background 1"
								x={0}
								y={0}
								height={rectHeight}
								width={arrowWidth + edge.coordinateBase.rectRadius}
								fill={edge.coordinateBase.fill}
								opacity={edge.coordinateBase.opacity}
								rx={edge.coordinateBase.rectRadius}
								ry={edge.coordinateBase.rectRadius}
							/>}
							<path
								d={textPath}
								className="react-stockchart-text-background"
								height={rectHeight}
								width={rectWidth}
								stroke={edge.coordinateBase.stroke}
								strokeLinejoin="miter"
								strokeOpacity={edge.coordinateBase.strokeOpacity}
								strokeWidth={edge.coordinateBase.strokeWidth}
								fill={edge.coordinateBase.fixedTextBackground}
								fillOpacity={edge.coordinateBase.opacity}
							/>
							{arrowType === "arrow" &&
							<path
								d={path}
								className="react-stockchart-background 2"
								height={rectHeight}
								width={rectWidth}
								stroke={edge.coordinateBase.stroke}
								strokeLinejoin="miter"
								strokeOpacity={edge.coordinateBase.strokeOpacity}
								strokeWidth={edge.coordinateBase.strokeWidth}
								fill={edge.coordinateBase.fill}
								fillOpacity={edge.coordinateBase.opacity}
							/>}
						</React.Fragment>) : (
						<path
							d={path}
							className="react-stockchart-background 3"
							height={rectHeight}
							width={rectWidth}
							stroke={edge.coordinateBase.stroke}
							strokeLinejoin="miter"
							strokeOpacity={edge.coordinateBase.strokeOpacity}
							strokeWidth={edge.coordinateBase.strokeWidth}
							fill={edge.coordinateBase.fill}
							fillOpacity={edge.coordinateBase.opacity}
						/>
					)}
				</g>
			) : (
				<rect
					key={1}
					className="react-stockchart-text-background"
					x={edge.coordinateBase.edgeXRect}
					y={edge.coordinateBase.edgeYRect}
					height={rectHeight}
					width={rectWidth}
					fill={edge.coordinateBase.fill}
					opacity={edge.coordinateBase.opacity}
					rx={edge.coordinateBase.rectRadius}
					ry={edge.coordinateBase.rectRadius}
					stroke={edge.coordinateBase.stroke}
				/>
			);

		coordinate = (
			<text
				key={2}
				x={edge.coordinate.edgeXText}
				y={edge.coordinate.edgeYText}
				textAnchor={edge.coordinate.textAnchor}
				fontFamily={edge.coordinate.fontFamily}
				fontSize={edge.coordinate.fontSize}
				fontWeight={edge.coordinate.fontWeight}
				dy={edge.coordinate.dy}
				fill={edge.coordinate.textFill}
			>
				{edge.coordinate.displayCoordinate}
			</text>
		);
	}
	return (
		<g className={className}>
			{line}
			{dot}
			{coordinateBase}
			{coordinate}
		</g>
	);
}
/* eslint-enable react/prop-types */

function helper(props) {
	const {
		coordinate: displayCoordinate,
		show,
		type,
		orient,
		edgeAt,
		hideLine,
		lineStrokeDasharray,
		fixedTextBackground,
	} = props;
	const {
		fill,
		opacity,
		fontFamily,
		fontSize,
		fontWeight,
		textFill,
		lineStroke,
		lineOpacity,
		drawDot,
	} = props;
	const { stroke, strokeOpacity, strokeWidth } = props;
	const { arrowWidth, rectWidth, rectHeight, rectRadius } = props;
	const { x1, y1, x2, y2, dx, dy, rectDy } = props;

	if (!show) return null;

	let coordinateBase, coordinate;
	if (isDefined(displayCoordinate)) {
		const textAnchor = props.textAnchor ? props.textAnchor : "middle"; // TODO: Below it is necessary to implement logic for the possibility of alignment from the right or from the left.
		const textPadding = 5;

		let edgeXRect, edgeYRect, edgeXText, edgeYText;

		if (type === "horizontal") {
			edgeXRect =
				dx + (orient === "right" ? edgeAt + 1 : edgeAt - rectWidth - 1);
			edgeYRect = y1 - rectHeight / 2 - strokeWidth;
			if (textAnchor === "end") {
				edgeXText =
				dx +
				(orient === "right"
					? edgeAt + arrowWidth + rectWidth - textPadding
					: edgeAt - arrowWidth - rectWidth / 2);
			}	else if (textAnchor === "start") {
				edgeXText = dx + edgeAt + arrowWidth + textPadding;
			}	else {
				edgeXText =
				dx +
				(orient === "right"
					? edgeAt + arrowWidth + rectWidth / 2
					: edgeAt - arrowWidth - rectWidth / 2);
			}

			edgeYText = y1;
		} else {
			const dy = orient === "bottom" ? strokeWidth - 1 : -strokeWidth + 1;
			edgeXRect = x1 - rectWidth / 2;
			edgeYRect =
				(orient === "bottom" ? edgeAt + rectDy : edgeAt - rectHeight) + dy;
			edgeXText = x1;
			edgeYText =
				(orient === "bottom"
					? edgeAt + rectHeight / 2
					: edgeAt - rectHeight / 2) + dy;
		}

		coordinateBase = {
			edgeXRect,
			edgeYRect: edgeYRect,
			rectHeight: rectHeight + strokeWidth,
			rectWidth,
			rectRadius,
			fill,
			opacity,
			arrowWidth,
			stroke,
			strokeOpacity,
			strokeWidth,
			fixedTextBackground,
		};
		coordinate = {
			edgeXText,
			edgeYText,
			textAnchor,
			fontFamily,
			fontSize,
			fontWeight,
			textFill,
			displayCoordinate,
			dy
		};
	}

	const line = hideLine
		? undefined
		: {
			opacity: lineOpacity,
			stroke: lineStroke,
			strokeDasharray: lineStrokeDasharray,
			x1,
			y1,
			x2: x2 + dx,
			y2
		};

	const dot = drawDot
		? {
			fill: lineStroke,
			cx: x1,
			cy: y1,
			r: 3,
		}
		: undefined;

	return {
		coordinateBase,
		coordinate,
		line,
		dot,
		orient
	};
}

export function drawOnCanvas(ctx, props) {
	const { fontSize, fontFamily, rectWidth } = props;

	ctx.font = `${fontSize}px ${fontFamily}`;
	ctx.textBaseline = "middle";
	const calcWidth = Math.round(ctx.measureText(props.coordinate).width + 10);
	const width = (rectWidth > calcWidth) ? rectWidth : calcWidth;

	const edge = helper({ ...props, rectWidth: width });

	if (edge === null) return;

	if (isDefined(edge.line)) {
		const dashArray = getStrokeDasharray(edge.line.strokeDasharray)
			.split(",")
			.map(d => +d);
		ctx.setLineDash(dashArray);
		ctx.strokeStyle = hexToRGBA(edge.line.stroke, edge.line.opacity);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(edge.line.x1, edge.line.y1);
		ctx.lineTo(edge.line.x2, edge.line.y2);
		ctx.stroke();
	}

	ctx.setLineDash([]);
	if (isDefined(edge.coordinateBase)) {
		const {
			rectWidth,
			rectHeight,
			rectRadius,
			arrowWidth
		} = edge.coordinateBase;

		ctx.fillStyle = hexToRGBA(
			edge.coordinateBase.fill,
			edge.coordinateBase.opacity
		);
		if (isDefined(edge.coordinateBase.stroke)) {
			ctx.strokeStyle = hexToRGBA(
				edge.coordinateBase.stroke,
				edge.coordinateBase.strokeOpacity
			);
			ctx.lineWidth = edge.coordinateBase.strokeWidth;
		}

		let x = edge.coordinateBase.edgeXRect;
		const y = edge.coordinateBase.edgeYRect;
		const halfHeight = rectHeight / 2;

		ctx.beginPath();
		if (arrowWidth) {
			if (edge.orient === "right") {
				x -= arrowWidth;
				ctx.moveTo(x, y + halfHeight);
				ctx.lineTo(x + arrowWidth, y);
				ctx.lineTo(x + rectWidth + arrowWidth, y);
				ctx.lineTo(x + rectWidth + arrowWidth, y + rectHeight);
				ctx.lineTo(x + arrowWidth, y + rectHeight);
				ctx.closePath();
			} else if (edge.orient === "left") {
				ctx.moveTo(x, y);
				ctx.lineTo(x + rectWidth, y);
				ctx.lineTo(x + rectWidth + arrowWidth, y + halfHeight);
				ctx.lineTo(x + rectWidth, y + rectHeight);
				ctx.lineTo(x, y + rectHeight);
				ctx.closePath();
			}
		} else {
			if (rectRadius) {
				roundRect(ctx, x, y, rectWidth, rectHeight, rectRadius);
			} else {
				ctx.rect(x, y, rectWidth, rectHeight);
			}
		}
		ctx.fill();

		if (isDefined(edge.coordinateBase.stroke)) {
			ctx.stroke();
		}

		ctx.fillStyle = edge.coordinate.textFill;
		ctx.textAlign =
			edge.coordinate.textAnchor === "middle"
				? "center"
				: edge.coordinate.textAnchor;
		ctx.fillText(
			edge.coordinate.displayCoordinate,
			edge.coordinate.edgeXText,
			edge.coordinate.edgeYText
		);
	}
}

function roundRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}