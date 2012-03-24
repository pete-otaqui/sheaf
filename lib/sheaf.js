(function() {
    var root, sheaf, sheafRecurse, promiseRecurse, defer, argsToArray, isPromise;
    
    defer = require('bond').defer;
    root = this;
    
    argsToArray = function(args) {
        return Array.prototype.slice.call(args);
    };

    sheaf = function() {
        var list = arguments[0],
            promise_fns = argsToArray(arguments).splice(1),
            return_values = [],
            dfd = defer();
        sheafRecurse(list, 0, promise_fns, return_values, dfd, function() {
            dfd.resolve(return_values);
        });
        return dfd.promise();
    };
    sheafRecurse = function(list, index, promise_fns, return_values, dfd, callback) {
        var item = list[index];
        promiseRecurse(promise_fns, 0, [item], function() {
            var args = argsToArray(arguments);
            dfd.notify(args);
            return_values.push(args);
            if ( index+1 < list.length ) {
                sheafRecurse(list, index+1, promise_fns, return_values, dfd, callback);
            } else {
                callback(return_values);
            }
        });
    };
    promiseRecurse = function(promise_fns, promise_index, promise_args, promise_callback) {
        var promise_return = promise_fns[promise_index].apply(this, argsToArray(promise_args)),
            args, fn;
        fn = function() {
            if ( promise_index+1 < promise_fns.length ) {
                promiseRecurse(promise_fns, promise_index+1, args, promise_callback);
            } else {
                promise_callback.apply(this, args);
            }
        };
        if ( isPromise(promise_return) ) {
            promise_return.then(function() {
                args = argsToArray(arguments);
                fn();
           });
        } else {
            args = [promise_return];
            fn();
        }
    };
    
    sheaf.isPromise = isPromise = function(obj) {
        return (typeof obj.then === 'function');
    };

    // Export the sheaf object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `sheaf` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = sheaf;
        }
        exports.sheaf = sheaf;
    } else {
        root['sheaf'] = sheaf;
    }
}).call(this);
