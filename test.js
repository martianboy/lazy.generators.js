var Generator = require('./generators');

/************************************************
 *      Fibonacci Sequence & Golden Ratio       *
 ************************************************/
console.log('Simple map-filter example: { x^2 | 1 <= x <= 6, x^2 > 10 } ==',
	new Generator([1,2,3,4,5,6])
		.map(function(x) { return x * x; })
		.filter(function(x) { return x > 10; })
		.toArray()
);

/************************************************
 *      Fibonacci Sequence & Golden Ratio       *
 ************************************************/
function *fibonacci() {
	var a = 0, b = 1;

	while(true) {
		// Currently Firefox-only
		// [a, b] = [b, a + b];

		b = b + a;
		a = b - a;
		
		yield a;
	}
}

var previous;
new Generator(fibonacci)
	.skip(25)
	.take(2)
	.each(function(x) {
		if (previous)
			console.log('The Golden Ratio is approximatelay:', (previous + x) / x);
		previous = x;
	});

/************************************************
 *                   Flatten                    *
 ************************************************/
console.log('Flattened [1, [2, 3, [4, 5], 6, [7]]]:',
	new Generator([1, [2, 3, [4, 5], 6, [7]]])
		.flatten()
		.toArray()
);