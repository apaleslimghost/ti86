var graph = require('./');

document.body.style.background = '#44505B';

function create(fg) {
	var c = document.createElement('canvas');
	var dims = [window.innerWidth, 100];
	[c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
	[c.style.width, c.style.height] = dims.map(x => x + 'px');
	c.style.position = 'absolute';
	c.style.top = '10px';
	c.style.left = '0px';
	document.body.appendChild(c);

	var data = Array.from(Array(20)).map((_, i) => [
		Date.now() - 20000 + i * 1000, Math.random()*0.9+0.05
	]);

	setInterval(function () {
		if(data[data.length - 1][0] < Date.now() - 1000) {
			data.push([Date.now(), Math.random()*0.9+0.05]);
		}

		if(data[0][0] < Date.now() - 22000) data.shift();
	}, 1000);


	(function draw() {
		graph(c, data, {bounds: [[Date.now() - 20000, Date.now() - 2000], [0, 1]], pathStyle(ctx) {
			ctx.lineWidth = 2 * devicePixelRatio;
			ctx.strokeStyle = fg;
		}, pre(ctx) {
			ctx.translate(0, ctx.canvas.height);
			ctx.scale(1, -1);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}, pointStyle(ctx) {
			ctx.fillStyle = fg;
		}, drawPoint(ctx, [x, y]) {
			ctx.beginPath();
			ctx.globalCompositeOperation = 'destination-out';
			ctx.ellipse(x, y, 4 * devicePixelRatio, 4 * devicePixelRatio, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';

			ctx.beginPath();
			ctx.fillStyle = fg;
			ctx.ellipse(x, y, 2 * devicePixelRatio, 2 * devicePixelRatio, 0, 0, 2 * Math.PI);
			ctx.fill();
		}, postPoint() {}, prePoint() {}});
		requestAnimationFrame(draw);
	}());
}

require('pleasejs').make_color({colors_returned: 4}).map(create);
