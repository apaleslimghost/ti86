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

var normaliseAll = (data, options = {}) => transpose(
	transpose(data)
	.map((xs, i) => xs.map(
		normalise(
			options.scale ? options.scale[i] : 1,
			...(options.bounds ? options.bounds[i] : bounds(xs))
		)
	))
);

var group = n => xs => (
	  xs.length < n? []
	: /*otherwise*/  [xs.slice(0, n), ...group(n)(xs.slice(1))]
);

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

function graph(canvas, data, options = {}) {
	var ctx = canvas.getContext('2d');
	ctx.save();
	ctx.translate(0, c.height);
	ctx.scale(1, -1);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var normd = normaliseAll(data, {scale: [canvas.width, canvas.height], bounds: options.bounds});
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
var dims = [window.innerWidth, 100];
[c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
[c.style.width, c.style.height] = dims.map(x => x + 'px');
document.body.appendChild(c);


var data = Array.from(Array(20)).map((_, i) => [
	Date.now() - 20000 + i * 1000, Math.random()
]);

setInterval(function () {
	data = data.map(([x, y]) => [x - 0.01, y]);
	if(data[data.length - 1][0] < Date.now() - 1000) {
		data.push([Date.now(), Math.random()]);
	}

	if(data[0][0] < Date.now() - 22000) data.shift();
}, 1000);

(function draw() {
	graph(c, data, {bounds: [[Date.now() - 20000, Date.now() - 2000], [0, 1]]});
	requestAnimationFrame(draw);
}());
