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
	: /* otherwise */  [fn(xs[0], ys[0])].concat(zipWith(fn)(xs.slice(1), ys.slice(1)))
);

var transpose = rows => rows.reduce(zipWith((col, x) => col.concat([x])), rows[0].map(() => []));

var normaliseAll = (max, data) => transpose(transpose(data).map((xs, i) => xs.map(normalise(max[i], ...bounds(xs)))));

var group = n => xs => (
	  xs.length < n? []
	: [xs.slice(0, n), ...group(n)(xs.slice(1))]
);

var c = document.createElement('canvas');
var dims = [800, 600];
[c.width, c.height] = dims;
[c.style.width, c.style.height] = dims.map(x => x/2 + 'px');
document.body.appendChild(c);
var ctx = c.getContext('2d');

ctx.beginPath();
group(2)(normaliseAll(dims, [
	[1, 1],
	[2, 4],
	[3, 5],
])).forEach(([[x1, y1], [x2, y2]]) => {
	ctx.moveTo(x1, dims[1] - y1);
	ctx.bezierCurveTo(
		x1 * 1.5, dims[1] - y1,
		x2 * 0.5, dims[1] - y2,
		x2, dims[1] - y2
	);
});
ctx.stroke();
