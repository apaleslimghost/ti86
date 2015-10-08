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

console.log(normaliseAll([300, 200], [
	[1, 1],
	[2, 3],
	[3, 5],
]))
