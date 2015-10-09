const τ = 2 * Math.PI;

var bounds = xs => xs.reduce(([min, max], x) => [
	Math.min(min, x),
	Math.max(max, x)
], [Infinity, -Infinity]);

var normalise = (scale, min, max) => x => scale * (x - min) / (max - min);

var inLast = (...args) => {
	var then = moment().subtract(...args);
	return x => moment(x).isAfter(then);
};

var zipWith = fn => (xs, ys) => ( 
	  xs.length === 0? []
	: ys.length === 0? []
	: /*otherwise*/    [fn(xs[0], ys[0])].concat(zipWith(fn)(xs.slice(1), ys.slice(1)))
);

var transpose = rows => rows.reduce(zipWith((col, x) => col.concat([x])), rows[0].map(() => []));

var normaliseAll = (max, data) => transpose(transpose(data).map((xs, i) => xs.map(normalise(max[i], ...bounds(xs)))));

var group = n => xs => (
	  xs.length < n? []
	: /*otherwise*/  [xs.slice(0, n), ...group(n)(xs.slice(1))]
);

var rawGrad = ([[x1, y1], [x2, y2]]) => (y2 - y1)/(x2 - x1);

var gradient = xs => i => rawGrad(
	  i === 0?             [xs[0],   xs[1]]
	: i === xs.length - 1? [xs[i-1], xs[i]]
	: /*otherwise*/        [xs[i-1], xs[i+1]]
);


function graph(canvas, data) {
	var ctx = canvas.getContext('2d');
	ctx.save();
	ctx.translate(0, c.height);
	ctx.scale(1, -1);

	var normd = normaliseAll([canvas.width, canvas.height], data);
	var gradients = data.map((_, i) => i).map(gradient(normd));

	ctx.beginPath();
	group(2)(normd).forEach(([[x1, y1], [x2, y2]], i) => {
		var g1 = gradients[i];
		var g2 = gradients[i+1];

		var x_25 = x1 + (x2 - x1) / 4;
		var x_75 = x1 + 3 * (x2 - x1) / 4;

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

	ctx.stroke();

	normd.forEach(([x, y]) => {
		ctx.beginPath();
		ctx.ellipse(x, y, 2, 2, 0, 0, τ);
		ctx.fill();
	});

	ctx.restore();
}

var c = document.createElement('canvas');
var dims = [400, 300];
[c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
[c.style.width, c.style.height] = dims.map(x => x + 'px');
document.body.appendChild(c);

graph(c, Array.from(Array(20)).map((_, i) => [
	i + Math.random(), Math.random()
]))
