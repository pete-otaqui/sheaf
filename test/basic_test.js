





var sheaf = require('../lib/sheaf'),
    testCase = require('nodeunit').testCase,
    defer = require('node-promise').defer;

var async1 = function(a) {
    var dfd = defer();
    setTimeout(function() {
        dfd.resolve('a1:' + a);
    }, 1);
    return dfd.promise;
};
var async2 = function(a) {
    var dfd = defer();
    setTimeout(function() {
        dfd.resolve('a2:' + a/*, 'b2'*/); // @todo find a multi-arg promise lib
    }, 1);
    return dfd.promise;
};
var reject1 = function(a) {
    var dfd = defer();
    setTimeout(function() {
        dfd.reject('r1:' + a); // @todo find a multi-arg promise lib
    }, 1);
    return dfd.promise;
};
var sync1 = function(a) {
    return 's1:' + a;
};
// var async3 = function(a, b) {
//     var dfd = defer();
//     setTimeout(function() {
//         dfd.resolve('a3:' + a, 'b3:' + b, 'c3');
//     }, 1);
//     return dfd.promise;
// };

module.exports = testCase({
    test_single_promise: function(test) {
        var list = ['one', 'two', 'three'];
        sheaf(list, async1).then(function(values) {
            test.deepEqual(values, [['a1:one'], ['a1:two'], ['a1:three']]);
            test.done();
        });
    },
    test_two_promises: function(test) {
        var list = ['one', 'two', 'three'];
        sheaf(list, async1, async2).then(function(values) {
            test.deepEqual(values, [['a2:a1:one'], ['a2:a1:two'], ['a2:a1:three']]);
            test.done();
        });
    },
    test_progress: function(test) {
        var list = ['one', 'two', 'three'],
            index = 0;
        test.expect(4);
        sheaf(list, async1, async2).then(
            function(values) {
                test.deepEqual(values, [['a2:a1:one'], ['a2:a1:two'], ['a2:a1:three']]);
                test.done();
            },
            null,
            function(value) {
                var results = [['a2:a1:one'], ['a2:a1:two'], ['a2:a1:three']];
                test.deepEqual(value, results[index]);
                index++;
            }
        );
    },
    test_sync_function: function(test) {
        var list = ['one', 'two', 'three'];
        sheaf(list, async1, async2, sync1).then(function(values) {
            test.deepEqual(values, [['s1:a2:a1:one'], ['s1:a2:a1:two'], ['s1:a2:a1:three']]);
            test.done();
        });
    }/*, // @todo support promise rejection
    test_rejection: function(test) {
        var list = ['one', 'two', 'three'];
        sheaf(list, async1, reject1, sync1).then(
            function(values) {
                test.deepEqual(values, [['s1:a2:a1:one'], ['s1:a2:a1:two'], ['s1:a2:a1:three']]);
                test.done();
            },
            function() {
                console.log('error!');
                console.log(arguments);
            }
        );
    }*/
});
