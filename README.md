# gdrive-tingodb

# Wrapper for tingodb and gdrive for fast and simply use on projects

# First you should auth your project with google through google-drive-util
# Create google.conf in root of your project

{
  "CLIENT_ID" : "your client ID",
  "CLIENT_SECRET" : "your cecret",
  "REDIRECT_URL_2" : "http://localhost",
  "ACCESS_TYPE" : "offline",
  "SCOPE" : "https://www.googleapis.com/auth/drive",
  "REDIRECT_URL" : "urn:ietf:wg:oauth:2.0:oob"
}

# Second, you should create googleapi token

node node_modules/google-drive-util/example/generate_token.js

# For use module

var GDrive = require("gdrive-tingodb")
var gDrive = new Gdrive({
    dbPath: "/path/to/your/db",
    dbGoogle: "ID Folder in Google Drive"
})

# Used for Uplaod/Download collections on start app
# return Promise

gDrive.upDownCols()
    .then(() => {
        console.log("done")
    })

# For update your collections with google drive use sync

gDrive.sync()
console.log("done");


