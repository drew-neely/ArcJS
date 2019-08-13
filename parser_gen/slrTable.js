var { Item, ItemSet } = require("./item");

var getItemSets = function(productions) {
    var is0 = new ItemSet([productions[0].startItem]);
    var built = is0.buildAll();
    built.forEach(e => console.log(e.toString()));
}

module.exports.getItemSets = getItemSets;