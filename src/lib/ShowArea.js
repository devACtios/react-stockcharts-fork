import React, { Component } from "react";
import PropTypes from "prop-types";
import ChartContext from "./ChartContext";

class ShowArea extends Component {

	constructor(props) {
		super(props);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);
		this.listener = this.listener.bind(this);

		this.state = {
			isShow: false,
		};
	}
	UNSAFE_componentWillMount() {
		const { subscribe, chartConfig: { id } } = this.context;
		subscribe("chart_" + id,
			{
				listener: this.listener,
			}
		);
	}
	componentWillUnmount() {
		const { unsubscribe, chartConfig: { id } } = this.context;
		unsubscribe("chart_" + id, this.listener);
	}
	listener(type, moreProps, state, e) {
		if (this.props.activeArea(type, moreProps, state, e, this.context)) {
			this.onMouseEnter();
		} else {
			this.onMouseOut();
		}
	}
	onMouseEnter() {
		const isShow = true;
		this.setState({
			isShow,
		}, function() {
			this.props.hearerToggle(isShow);
		});
	}
	onMouseOut() {
		const isShow = false;
		this.setState({
			isShow,
		}, function() {
			this.props.hearerToggle(isShow);
		});
	}
	render() {
		const { isShow } = this.state;
		if (isShow) {
			return (
				<g>
					{this.props.children}
				</g>
			);
		} else {
			return null;
		}
	}
}

ShowArea.propTypes = {
	children: PropTypes.node.isRequired,
	activeArea: PropTypes.func,
	hearerToggle: PropTypes.func,
};

ShowArea.defaultProps = {
	activeArea: function(type, moreProps, state, event, context) {
		const { chartConfig: { id, height } } = context;
		const { currentCharts } = moreProps;

		if ((type === "mousemove" || type === "mouseleave" || type === "mouseenter")
			&& currentCharts.indexOf(id) > -1
			&& moreProps.mouseXY[1] > (height / 3 * 2)
		) {
			return true;
		} else {
			return false;
		}
	},
	hearerToggle: function() {},
};

ShowArea.contextType = ChartContext;

export default ShowArea;
