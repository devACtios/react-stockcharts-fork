## React Stockcharts


Create highly customizable stock charts

Built with [React JS](http://facebook.github.io/react/) and [d3](http://d3js.org/)


#### Chart types

- Scatter
- Area
- Line
- Candlestick
- OHLC
- HeikenAshi
- Renko
- Kagi
- Point & Figure

#### Indicators

- EMA, SMA, WMA, TMA, OSMA, TEMA
- Bollinger band
- SAR
- MACD
- RSI
- ATR
- Stochastic (fast, slow, full)
- ForceIndex
- ElderRay
- Elder Impulse
- On Balance Volume (OBV)
- Market Flow Index (MFI)
- Accumulation / Distribution (AD)
- Volume
- Keltner Channel
- Donchian Channel
- Ichimoku
- Linear Regression Algorithm (LRI)
- Tirone
- Aroon
- AroonOscilator
- Bear Power
- Bull Power
- Commodity Channel Index (CCI)
- Demarker
- Dynamic Price Oscillator (DPO)
- Momentum
- Relative Strength Index (RSI)
- Vertical Horizontal Filter (VHF)
- Williams Percent Range (WILLIAMS_R)
- Relative Vigor Index (RVI)
- Qstick
- Ease of Movement Value (EMV)
- Chaikin Oscillator (CHO)
- Rate of Change (ROC)
- Mass index (MI)
- Acceleration / Deceleration (AC)
- Market Fasciliation Index (BW_MFI)
- Volume Average
- Variable Index Dynamic Average (VIDYA)
- Williams Percent Range (WPR)
- standardDeviation
- Envelopes
- Average Directional Index (ADX)
- Average Directional Movement Index Wilder (ADMIW)


#### Interactive Indicators

- Trendline
- Fibonacci Retracements
- Gann Fan
- Channel
- Linear regression channel
- SimpleLine
- OneLine
- Pitchfork
- TrendAngel
- FibonacciTimeZone
- Rectangle
- FibChannelWithArea
- TrendBaseFibExtension
- RotatedRectangle
- Ellipse
- RotatedTriangle
- CurveLine
- InteractiveBrush
- ArrowMark
- TextMark

Also added modal windows to edit indicator styles and components like Input, etc

### Tooltips
- MAMATooltip
- ATooltip

### Changes in project

- changed tracking zoom, pan and panend events in GenericComponent
- moving Inveractive Indicators in mobile devices
- update project to node20 + react18
- Clipping chart content
- Changes in markup and positioning of EdgeCoordinate & EdgeCoordinateV3

### New features

- ablitity to hide Indicator
- Axis zoom restrictions
- Axis zoom event tracking
- Scroll chart to certain point
- Profit scale on Y Axis
- Touch events
- Chart minimap for touch devices
- Magnet mode
- Hover on chart event
- Render space for future data
- Init chart with max axis zoom


---

### Installation
```sh
npm install  --save react-stockcharts
```

### LICENSE

[MIT](./LICENSE)