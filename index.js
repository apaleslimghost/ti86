const τ = 2 * Math.PI;

var defaults = (d, s) => {
	var o = Object.assign({}, s);
	Object.assign(o, d);
	return o;
}

var getBounds = xs => xs.reduce(([min, max], x) => [
	Math.min(min, x),
	Math.max(max, x)
], [Infinity, -Infinity]);

var normalise = ({scale, bounds: [min, max], margin: [start, end]}) => (
	x => start + (scale - start - end) * (x - min) / (max - min)
);

var zipWith = fn => (xs, ys) => { 
	var out = [];
	for(let i = 0, l = Math.min(xs.length, ys.length); i < l; ++i) {
		out.push(fn(xs[i], ys[i]));
	}
	return out;
};

var concatMap = (f, xs) => xs.reduce((ys, x) => ys.concat(f(x)), []);

var id = a => a;

var transpose = rows => rows.reduce(zipWith((col, x) => col.concat([x])), rows[0].map(() => []));

var normaliseAll = (data, options) => transpose(
	transpose(data)
	.map((xs, i) => xs.map(
		normalise({
			scale: options.scale[i],
			bounds: options.bounds[i],
			margin: [options.margin[1 - i], options.margin[3 - i]],
		})
	))
);

var group = n => xs => {
	var out = [];
	for(let i = 0, l = xs.length; i < l + 1 - n; ++i) {
		out.push(xs.slice(i, i + n));
	}
	return out;
};

var rawGrad = ([[x1, y1], [x2, y2]]) => (y2 - y1)/(x2 - x1);

var isDerivZero = ([y1, y2, y3]) => (
	   y1 < y2 && y3 < y2
	|| y1 > y2 && y3 > y2
);

var gradient = xs => i => (
	  i === 0?             rawGrad([xs[0],   xs[1]])
	: i === xs.length - 1? rawGrad([xs[i-1], xs[i]])
	: isDerivZero(
	  	xs.slice(i-1, i+2)
	  	.map(p => p[1])
	  )?                   0
	: /*otherwise*/        rawGrad([xs[i-1], xs[i+1]])
);

var expandMargin = xs => ({
	1: [xs[0], xs[0], xs[0], xs[0]],
	2: [xs[0], xs[1], xs[0], xs[1]],
	4: xs
}[xs.length]);

var ile = n => ([min, max]) => [
	min,
	...Array.from(Array(n - 1)).map((_, i) => min + (i + 1) * (max - min) / n),
	max
];

var quartile = ile(4);

var defaultOptions = {
	margin: [5],

	pre(ctx) {
		ctx.translate(0, ctx.canvas.height);
		ctx.scale(1, -1);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},

	post() {},

	prePaths(ctx, data) {
		ctx.beginPath();
		this.pathStyle(ctx);
		this.gradients = data.map((_, i) => i).map(gradient(data));
	},

	pathStyle(ctx) {
		ctx.lineWidth = 1 * devicePixelRatio;
	},

	drawPaths(ctx, points) {
		group(2)(points).forEach(([[x1, y1], [x2, y2]], i) => {
			var g1 = this.gradients[i];
			var g2 = this.gradients[i+1];

			var [_, x_25, _, x_75, _] = quartile([x1, x2]);

			var y0_1 = y1 - g1 * x1;
			var y0_2 = y2 - g2 * x2;

			var c1 = [
				x_25,
				g1 * x_25 + y0_1
			];
			var c2 = [
				x_75,
				g2 * x_75 + y0_2
			];

			ctx.moveTo(x1, y1);
			ctx.bezierCurveTo(
				...c1, ...c2,
				x2, y2
			);
		});
	},

	postPaths(ctx, data) {
		ctx.stroke();
		this.drawPoints(ctx, data);
	},

	drawPoints(ctx, data) {
		data.forEach((point) => {
			this.prePoint(ctx, point);
			this.drawPoint(ctx, point)
			this.postPoint(ctx, point);
		});
	},

	prePoint(ctx) {
		ctx.beginPath();
		this.pointStyle(ctx);
	},

	pointStyle(ctx) {
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2 * devicePixelRatio;
	},

	drawPoint(ctx, [x, y]) {
		ctx.ellipse(x, y, 3 * devicePixelRatio, 3 * devicePixelRatio, 0, 0, τ);
	},

	postPoint(ctx) {
		ctx.fill();
		ctx.stroke();
	}
};

function graph(options, ...series) {
	options = defaults(options, defaultOptions);

	var ctx = options.canvas.getContext('2d');
	ctx.save();

	options.pre(ctx);

	var scale = [ctx.canvas.width, ctx.canvas.height];
	var bounds = transpose(concatMap(data => data.data || data, series)).map(getBounds).map((b, i) => options.bounds[i] || b);
	var margin = expandMargin(options.margin);

	series.forEach(data => {
		var seriesOpts = defaults(data.options, options);
		if(data.data) {
			data = data.data;
		}

		var normd = normaliseAll(data, {scale, bounds, margin});

		seriesOpts.prePaths(ctx, normd);
		seriesOpts.drawPaths(ctx, normd);
		seriesOpts.postPaths(ctx, normd);
	});

	options.post(ctx);

	ctx.restore();
}

module.exports = graph;
