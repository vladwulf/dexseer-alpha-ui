import { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  AutoscaleInfo,
  Coordinate,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
  ISeriesApi,
  IChartApi,
} from "lightweight-charts";

interface RibbonRendererData {
  x: Coordinate | number;
  upper: Coordinate | number;
  lower: Coordinate | number;
  color?: string;
}

class MARibbonPaneRenderer implements IPrimitivePaneRenderer {
  _viewData: RibbonViewData;

  constructor(data: RibbonViewData) {
    this._viewData = data;
  }

  draw() {}

  drawBackground(target: CanvasRenderingTarget2D) {
    const points: RibbonRendererData[] = this._viewData.data;

    if (points.length < 2) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio);

      // Draw ribbon segments with individual colors
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // Create a segment between current and next point
        const segment = new Path2D();
        segment.moveTo(p1.x, p1.upper);
        segment.lineTo(p2.x, p2.upper);
        segment.lineTo(p2.x, p2.lower);
        segment.lineTo(p1.x, p1.lower);
        segment.closePath();

        // Use per-point color if available, otherwise use default
        const fillColor = p1.color || this._viewData.options.fillColor;
        ctx.fillStyle = fillColor;
        ctx.fill(segment);
      }

      // Optionally draw border lines
      if (this._viewData.options.lineWidth > 0) {
        ctx.strokeStyle = this._viewData.options.lineColor;
        ctx.lineWidth = this._viewData.options.lineWidth;

        // Draw upper line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].upper);
        for (const point of points) {
          ctx.lineTo(point.x, point.upper);
        }
        ctx.stroke();

        // Draw lower line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].lower);
        for (const point of points) {
          ctx.lineTo(point.x, point.lower);
        }
        ctx.stroke();
      }
    });
  }
}

interface RibbonViewData {
  data: RibbonRendererData[];
  options: Required<MARibbonOptions>;
}

class MARibbonPaneView implements IPrimitivePaneView {
  _source: MARibbonIndicator;
  _data: RibbonViewData;

  constructor(source: MARibbonIndicator) {
    this._source = source;
    this._data = {
      data: [],
      options: this._source._options,
    };
  }

  update() {
    const series = this._source._series;
    const chart = this._source._chart;
    if (!series || !chart) return;

    const timeScale = chart.timeScale();
    this._data.data = this._source._ribbonData.map((d) => {
      return {
        x: timeScale.timeToCoordinate(d.time) ?? -100,
        upper: series.priceToCoordinate(d.upper) ?? -100,
        lower: series.priceToCoordinate(d.lower) ?? -100,
        color: d.color, // Pass through the per-point color
      };
    });
  }

  renderer() {
    return new MARibbonPaneRenderer(this._data);
  }
}

export interface MARibbonData {
  time: Time;
  upper: number;
  lower: number;
  color?: string; // Optional per-point color
}

export interface MARibbonOptions {
  lineColor?: string;
  fillColor?: string;
  lineWidth?: number;
  upperColor?: string;
  lowerColor?: string;
}

const defaults: Required<MARibbonOptions> = {
  lineColor: "rgba(255, 255, 255, 0.2)",
  fillColor: "rgba(61, 171, 255, 0.2)",
  lineWidth: 0,
  upperColor: "rgba(34, 197, 94, 0.2)",
  lowerColor: "rgba(239, 68, 68, 0.2)",
};

export class MARibbonIndicator implements ISeriesPrimitive<Time> {
  _paneViews: MARibbonPaneView[];
  _ribbonData: MARibbonData[] = [];
  _options: Required<MARibbonOptions>;
  _series: ISeriesApi<"Candlestick"> | null = null;
  _chart: IChartApi | null = null;

  constructor(options: MARibbonOptions = {}) {
    this._options = { ...defaults, ...options };
    this._paneViews = [new MARibbonPaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }

  paneViews() {
    return this._paneViews;
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this._series = param.series as ISeriesApi<"Candlestick">;
    this._chart = param.chart;
  }

  detached(): void {
    this._series = null;
    this._chart = null;
  }

  setData(data: MARibbonData[]) {
    this._ribbonData = data;
    this.updateAllViews();
  }

  autoscaleInfo(): AutoscaleInfo | null {
    // Let the main series handle autoscaling
    return null;
  }
}
