var {parse} = require('./grammar.js');

var yeet  = { type: "yeet"  };
var em    = { type: "em"    };
var bois  = { type: "bois"  };
var girls = { type: "girls" };
var yaas  = { type: "yaas"  };

var tests = [
    [yeet, em, bois],
    [yeet, em, girls],
    [yaas, girls],
    [yaas, bois],
    [yeet, em, yaas],
    [yaas, em, bois]
]

var results = tests.map(e => {
    try {
        var warnings = [];
        var res = parse(e, (err) => {warnings.push(err)});
        return [res, warnings];
    } catch(error) {
        return error.toString();
    }
});
console.log(results)