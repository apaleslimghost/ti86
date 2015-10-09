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

var c = document.createElement('canvas');
var dims = [400, 300];
var pixels = [c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
[c.style.width, c.style.height] = dims.map(x => x + 'px');
document.body.appendChild(c);
var ctx = c.getContext('2d');

ctx.translate(0, c.height);
ctx.scale(1, -1);

ctx.beginPath();

function graph(data) {
	var normd = normaliseAll(pixels, data);
	var gradients = data.map((_, i) => i).map(gradient(normd));

	group(2)(normd).forEach(([[x1, y1], [x2, y2]], i) => {
		var g1 = gradients[i];
		var g2 = gradients[i+1];

		var c1 = [
			x1 + 50,
			g1 * 50 + y1
		];
		var c2 = [
			x2 - 50,
			g2 * -50 + y2
		];

		ctx.moveTo(x1, y1);
		ctx.bezierCurveTo(
			...c1, ...c2,
			x2, y2
		);
	});

	ctx.stroke();
}

graph([
	[1, 1],
	[2, 4],
	[3, 5]
])
