"use strict";

function* makeGeneratorFromArray(array){
	var nextIndex = 0;
		
	while(nextIndex < array.length) {
		yield array[nextIndex++];
	}
}

function GeneratorsWrapper(input) {
	GeneratorsWrapper.prototype.regenerate = function() {
		var generator;

		if (Array.isArray(input))
			generator = makeGeneratorFromArray(input);
		else if (input.isGenerator && input.isGenerator())
			generator = input();
		else if (generator = input()) {
			if (typeof generator.next !== 'function')
				throw new TypeError('Unidentifiable input.');
		}

		this._internalGenerator = generator;

		return this;
	}

	this.regenerate(input);
}

function _property(key) {
	return function(obj) {
		return obj[key];
	};
};

// Returns a predicate for checking whether an object has a given set of `key:value` pairs.
function _matches(attrs) {
	return function(obj) {
		if (obj === attrs) return true; //avoid comparing an object to itself.
		for (var key in attrs) {
			if (attrs[key] !== obj[key])
				return false;
		}
		return true;
	}
};

GeneratorsWrapper.prototype.each = function(fn, context) {
	if (typeof fn !== 'function')
		throw new TypeError('callback is not a function.');

	var index = 0;

	for (var x of this._internalGenerator) {
		if (fn.call(context, x, index++, this) === false)
			break;
	}
}
GeneratorsWrapper.prototype.indexOf = function indexOf(value) {
	var foundIndex = -1;
	this.each(function(e, i) {
		if (e === value) {
			foundIndex = i;
			return false;
		}
	});
	return foundIndex;
}

GeneratorsWrapper.prototype.map = function(fn, context) {
	if (typeof fn !== 'function')
		throw new TypeError('callback is not a function.');

	var _internalGenerator = this._internalGenerator;

	return new GeneratorsWrapper(function* () {
		var index = 0;

		for (var x of _internalGenerator) {
			yield fn.call(context, x, index++, this);
		}
	});
}
GeneratorsWrapper.prototype.filter = function(fn, context) {
	if (typeof fn !== 'function')
		throw new TypeError('callback is not a function.');

	var _internalGenerator = this._internalGenerator;

	return new GeneratorsWrapper(function* () {
		var index = 0;

		for (var x of _internalGenerator) {
			if (fn.call(context, x, index++, this)) {
				yield x;
			}
		}
	});
}
GeneratorsWrapper.prototype.compact = function() {
	return this.filter(function(value) { return !!value; });
}

GeneratorsWrapper.prototype.flatten = function() {
	var _internalGenerator = this._internalGenerator;

	var flatten = function* (generator) {
		for (var x of generator) {
			if (Array.isArray(x))
				yield* flatten(makeGeneratorFromArray(x));
			else
				yield x;
		}
	}
	return new GeneratorsWrapper(function* () {
		yield* flatten(_internalGenerator);
	});	
};

GeneratorsWrapper.prototype.reduce = function(fn, initialValue) {
	if (typeof fn !== 'function')
		throw new TypeError('callback is not a function.');

	var index = 0;
	var accumulator;
	var genVal = this._internalGenerator.next();

	if (genVal.done)
		throw new TypeError('This generator is done for!');

	if (initialValue)
		accumulator = initialValue;
	else
		accumulator = genVal.value;

	while(!genVal.done) {
		accumulator = fn.call(undefined, accumulator, genVal.value, index, this);
		genVal = this._internalGenerator.next();
	}

	return accumulator;
}

GeneratorsWrapper.prototype.find = function(predicate) {
	return this.filter(predicate).first().single();
}
GeneratorsWrapper.prototype.where = function(attrs) {
	return this.filter(_matches(attrs));
}
GeneratorsWrapper.prototype.findWhere = function(attrs) {
	return this.where(attrs).first().single();
}

GeneratorsWrapper.prototype.skipUntil = function(predicate) {
	this.find(predicate);

	return this;
}
GeneratorsWrapper.prototype.skip = function(n) {
	if (n < 1)
		throw new TypeError('Can\'t take zero or less items!');

	return this.skipUntil(function(value, index) { return index === n - 1; });
}
GeneratorsWrapper.prototype.skipWhile = function(predicate) {
	this.skipUntil(function(value, index) {
		return !predicate(value, index);
	});

	return this;
}

GeneratorsWrapper.prototype.every = GeneratorsWrapper.prototype.all = function(predicate) {
	this.skipWhile(predicate);

	try {
		return this._internalGenerator.next().done;
	}
	catch(ex) {
		return true;
	}
}

GeneratorsWrapper.prototype.some = GeneratorsWrapper.prototype.any = function(predicate) {
	this.skipUntil(predicate);

	try {
		return !this._internalGenerator.next().done;
	}
	catch(ex) {
		return false;
	}
}
GeneratorsWrapper.prototype.contains = function(value) {
	return this.any(function(value, index) {
		return value === value;
	});
}

GeneratorsWrapper.prototype.invoke = function(methodName) {
	return this.map(function(value) {
		return value[methodName]();
	});
}

GeneratorsWrapper.prototype.take = function(n) {
	if (n < 1)
		throw new TypeError('Can\'t take zero or less items!');

	var _internalGenerator = this._internalGenerator;

	return new GeneratorsWrapper(function* () {
		var genVal, i = 0;

		while(i++ < n && !(genVal = _internalGenerator.next()).done) {
			yield genVal.value;
		}
	});
};

GeneratorsWrapper.prototype.first = function() {
	return this.take(1);
}

GeneratorsWrapper.prototype.toArray = function() {
	return this.reduce(function(arr, elem) {
		arr.push(elem);
		return arr;
	}, []);
}

GeneratorsWrapper.prototype.single = function() {
	var genVal = this._internalGenerator.next();
	return genVal.done ? undefined : genVal.value;
}

module.exports = GeneratorsWrapper;