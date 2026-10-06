[source](http://localhost:3081/lib/charts/ShowArea.js), [codesandbox](url)

Show when mouse is on some chart area.

Note: example of using the inner __event system__ is in inner ShowArea component.

```jsx
<ChartCanvas
	...
>
	<Chart id={1}>
		...
		<ShowArea
			activeArea={function(type, moreProps, state, event, context) { // This is default fn for example
				const { chartConfig: { id, height } } = context;
				const { currentCharts } = moreProps;
				if (type === "mousemove" // event type
					&& currentCharts.indexOf(id) > -1 // for this chart
					&& moreProps.mouseXY[1] > (height / 3 * 2) // set active area
				) {
					return true; // to show children
				} else {
					return false; // to hide children
				}
			}}
			hearerToggle={isShow => console.log('Is show children: ', isShow)}
		> //To show or hide Buttons area
			<ZoomButtons
				onReset={this.handleReset}
			/>
		</ShowArea>
		...
	</Chart>
```
