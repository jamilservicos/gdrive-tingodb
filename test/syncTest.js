var GdriveTingoDB = require("../lib/index.js");
var gdriveTingoDB = new GdriveTingoDB({
    dbPath: __dirname + "/db",
    dbGoogle: "0B0-8vnNvFNZTZ1p6ek9kX2RYSjg",
	deprecatedCollections: {}
});

/**
 * Change or remove testcol for see changes in your project or GoogleDrive
 */
gdriveTingoDB.sync({colName: "testcol"})
console.log("Please check changes")