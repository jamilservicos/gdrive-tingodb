var GdriveTingoDB = require("../lib/index.js");
var gdriveTingoDB = new GdriveTingoDB({
    dbPath: __dirname + "/db",
    dbGoogle: "0B0-8vnNvFNZTZ1p6ek9kX2RYSjg"
});

gdriveTingoDB.upDownCols()
    .then(() => {
        console.log("Check Google Drive for new collections in db folder");
    })
    .catch(err => {
        console.error(err)
    });
