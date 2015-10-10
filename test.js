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

document.body.style.background = '#44505B';

(function draw() {
	graph(c, data, {bounds: [[Date.now() - 20000, Date.now() - 2000], [0, 1]], pathStyle(ctx) {
		ctx.lineWidth = 2 * devicePixelRatio;
		ctx.strokeStyle = '#fff1e0';
	}, pre(ctx, canvas) {
		ctx.translate(0, canvas.height);
		ctx.scale(1, -1);
		ctx.fillStyle = '#44505B';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}, pointStyle(ctx) {
		ctx.strokeStyle = '#44505B';
		ctx.fillStyle = '#fff1e0';
	}});
	requestAnimationFrame(draw);
}());
