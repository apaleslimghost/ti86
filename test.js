var graph = require('./');

function create() {
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
		}, pre(ctx) {
			ctx.translate(0, ctx.canvas.height);
			ctx.scale(1, -1);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}, pointStyle(ctx) {
			ctx.fillStyle = '#fff1e0';
		}, drawPoint(ctx, [x, y]) {
			ctx.beginPath();
			ctx.globalCompositeOperation = 'destination-out';
			ctx.ellipse(x, y, 4 * devicePixelRatio, 4 * devicePixelRatio, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';

			ctx.beginPath();
			ctx.fillStyle = '#fff1e0';
			ctx.ellipse(x, y, 2 * devicePixelRatio, 2 * devicePixelRatio, 0, 0, 2 * Math.PI);
			ctx.fill();
		}, postPoint() {}, prePoint() {}});
		requestAnimationFrame(draw);
	}());
}

create();
create();
create();
create();
create();
