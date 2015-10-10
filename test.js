var graph = require('./');

var c = document.createElement('canvas');
var dims = [window.innerWidth, 100];
[c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
[c.style.width, c.style.height] = dims.map(x => x + 'px');
document.body.appendChild(c);

var data = Array.from(Array(20)).map((_, i) => [
	Date.now() - 20000 + i * 1000, Math.random()
]);

setInterval(function () {
	if(data[data.length - 1][0] < Date.now() - 1000) {
		data.push([Date.now(), Math.random()]);
	}

	if(data[0][0] < Date.now() - 22000) data.shift();
}, 1000);

(function draw() {
	graph(c, data, {bounds: [[Date.now() - 20000, Date.now() - 2000], [0, 1]]});
	requestAnimationFrame(draw);
}());
