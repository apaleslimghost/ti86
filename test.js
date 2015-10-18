var graph = require('./');
var genColor = require('@quarterto/pretty-color-gen');

document.body.style.background = '#44505B';

function create(fg) {
	var data = Array.from(Array(20)).map((_, i) => [
		Date.now() - 20000 + i * 1000, Math.random()
	]);

	setInterval(function () {
		if(data[data.length - 1][0] < Date.now() - 1000) {
			data.push([Date.now(), Math.random()]);
		}

		if(data[0][0] < Date.now() - 22000) data.shift();
	}, 1000);

	return {
		data,
		options: {
			pathStyle(ctx) {
				ctx.lineWidth = 2 * devicePixelRatio;
				ctx.strokeStyle = fg;
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
			},
			postPoint() {},
			prePoint() {}	
		}
	}
}

var c = document.createElement('canvas');
var dims = [window.innerWidth, 100];
[c.width, c.height] = dims.map(x => x * window.devicePixelRatio);
[c.style.width, c.style.height] = dims.map(x => x + 'px');
c.style.position = 'absolute';
c.style.top = '10px';
c.style.left = '0px';
document.body.appendChild(c);

var data = Array.from('abcd').map(a => genColor(a, {saturation: .5, lightness: .75})).map(create);

(function draw() {
	var bounds = [[Date.now() - 20000, Date.now() - 2000], [0,1]];
	graph({canvas: c, bounds,
				yAxisStyle(ctx) {
					ctx.textAlign = 'right';
					ctx.textBaseline = 'middle';
					ctx.font = `300 ${12 * window.devicePixelRatio}px Lato`;
					ctx.strokeStyle = ctx.fillStyle = 'white';
					ctx.lineCap = 'round';
					ctx.lineWidth = 1.5 * devicePixelRatio;
				}
	}, ...data);
	requestAnimationFrame(draw);
}());

