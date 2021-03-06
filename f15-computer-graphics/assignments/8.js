
function flatten(arr) {
	'use strict';
	return arr.reduce((a, b) => a.concat(b));
}

function draw(canvas, vertices) {
	var gl, prog;
	gl = document.getElementById(canvas).getContext('experimental-webgl');
	prog = gl.createProgram();

	function addShader(type, str) {
		var s = gl.createShader(type);
		gl.shaderSource(s, str);
		gl.compileShader(s);
		gl.attachShader(prog, s);
	}

	addShader(gl.VERTEX_SHADER, [
	  ,'attribute vec3 aPos;'
	  ,'uniform mat4 uMatrix;'
	  ,'varying vec3 uPos;'
	  ,'void main() {'
	  ,'   uPos = aPos;'
	  ,'   gl_Position = uMatrix * vec4(aPos, 1.);'
	  ,'}',
	].join('\n'));

	addShader(gl.FRAGMENT_SHADER, [
	  ,'precision highp float;'
	  ,'varying vec3 uPos;'
	  ,'void main() {'
	  ,'   	gl_FragColor = vec4(0.3, 0.8, 0.6, 1.);'
	  ,'}',
	].join('\n'));


	function address(name) { return gl.getUniformLocation(prog, name); }

	gl.linkProgram(prog);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	var attr = gl.getAttribLocation(prog, 'aPos');

	gl.enableVertexAttribArray(attr);
	gl.vertexAttribPointer(attr, 3, gl.FLOAT, false, 0, 0);
	gl.useProgram(prog);

	setInterval(tick, 1000 / 60);

	function tick() {
		var turn = (new Date()).getTime() / 1000.;
		var cos = Math.cos(turn);
		var sin = Math.sin(turn);
		var adjust = gl.canvas.height / gl.canvas.width;
		var matrix = [ adjust*cos,  0,sin, .1*sin,
			0,  1,  0,  0,
			-adjust*sin,  0,cos, .1*cos,
			0,  0,  0,  1];
			gl.uniformMatrix4fv(address('uMatrix'), false, matrix);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, sph_vertices.length / 3);
	}
}


var step = 0.02;
var mat = new Matrix().scale(0.3, 0.3, 0.3).rotateY(1.2).rotateX(0.5).translate(0.5, 0, 0);
var sph_vertices = [], cy_vertices = [], to_vertices = [];
var stepped = true;

for (var u = 0; u < 1; u += step) {
	for (var v = 0; v < 1; v += step) {
		var p = new ParamObj(u, v, 0.3);
		var p2 = new ParamObj(u + step, v, 0.3);
		var sph = p.sphere();
		var sph2 = p2.sphere();
		var cy = p.cylinder();
		var cy2 = p2.cylinder();
		var to = p.torus();
		var to2 = p2.torus();
		var sphobj = mat.transform([sph[0], sph[1], sph[2]]);
		var sphobj2 = mat.transform([sph2[0], sph2[1], sph2[2]]);
		var cyobj = mat.transform([cy[0], cy[1], cy[2]]);
		var cyobj2 = mat.transform([cy2[0], cy2[1], cy2[2]]);
		var toobj = mat.transform([to[0], to[1], to[2]]);
		var toobj2 = mat.transform([to2[0], to2[1], to2[2]]);
		if (stepped){
			sph_vertices.push(sphobj);
			sph_vertices.push(sphobj2);
			cy_vertices.push(cyobj);
			cy_vertices.push(cyobj2);
			to_vertices.push(toobj);
			to_vertices.push(toobj2);
		}
		stepped = !stepped;
	}
}

sph_vertices = flatten(sph_vertices);
cy_vertices = flatten(cy_vertices);
to_vertices = flatten(to_vertices);
console.log(to_vertices);

setTimeout( function() {
	draw('canvas1', sph_vertices);
	draw('canvas2', cy_vertices);
	draw('canvas3', to_vertices);
}, 100);
