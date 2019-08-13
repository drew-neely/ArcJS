var { Item, ItemSet } = require("./item");

var getItemSets = function(productions) {
    var is0 = new ItemSet(productions.map(e => e.startItem));
    var built = is0.build();
    console.log(is0.toString());
    built.forEach(e => console.log(e.toString()));
}

module.exports.getItemSets = getItemSets;