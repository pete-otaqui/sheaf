Sheaf
=====

An API to make looping over a series of async activities one at a time more
straightforward.

[![Build Status](https://secure.travis-ci.org/pete-otaqui/sheaf.png)](http://travis-ci.org/pete-otaqui/sheaf)

Essentially it helps you code in a more synchronous manner than is convenient
with many NodeJS libraries.  Since much of Node's value is exactly it's async
nature you should _use with caution_!

It is not the same promise.seq() in the node-promise, in that it
is designed to work on a series of values through a chain of functions, rather
than a single series of promise-returning functions.

You supply an array of initial values as the first argument to sheaf.
Subsequent arguments should be functions that return either a value or a promise
which resolves with a value.  Starting with the values from the list, the output
from each of function is given as the argument to the next.  As each run through
is complete, the next item in the list is used in the same way.

Sheaf itself returns a promise which resolves with an array of final values.

Here's a diagram of how it works:

![Sheaf flow](https://docs.google.com/drawings/pub?id=1TggGPBZUpjIygkfsE4A98Udc0Obx8wnjD-j4034z-Og&w=619&h=217)

Installation:
-------------
```bash
$ npm install sheaf
```

Example:
--------
```javascript

// The list we will use.
var urls = ['a.html', 'b.html'];

// A promise-returning function
var getu = function(u) {
    return $.get(u);
};

// A second promise returning function
// Note how it's a wrapper around a callback-based
// function.
var parse = function(data) {
    dfd = new $.Deferred();
    jsdom.env(data, [], function(win) {
        dfd.resolve(win);
    });
    return dfd.promise();
};

// A synchronous value-returning function
var check = function(win) {
    var val = false;
    return win.$('p').each(function() {
        if ( win.$(this).html().match(/^\s+/) ) {
            val = true;
        }
    }
    return val;
};

// Now, take the first item from `list`, run it through all the
// functions and when complete, take the second item and do the same
sheaf(urls, getu, parse, check)
    .then(
        function(allChecks) {
            console.log('all finished', allChecks);
        },
        null, // nb - currently no management of rejected promises
        function() {
            console.log('there was some progress');
        }
    );
```

A word on multiple returns
--------------------------

Theoretically, sheaf supports multiple return values for promise-resolution,
but unfortunately node-promise (which sheaf uses) does not.  This will
hopefully be rectified in the future with an alternative promises library.

Note that jQuery's Ajax functions are a good example of why you might want
promises to resolve with multiple arguments.
