# gdrive-tingodb

Wrapper for tingodb and gdrive for fast and simply use on projects

# First 

You should auth your project with google through google-drive-util\n
Create google.conf in root of your project

{
  "CLIENT_ID" : "your client ID",
  "CLIENT_SECRET" : "your cecret",
  "REDIRECT_URL_2" : "http://localhost",
  "ACCESS_TYPE" : "offline",
  "SCOPE" : "https://www.googleapis.com/auth/drive",
  "REDIRECT_URL" : "urn:ietf:wg:oauth:2.0:oob"
}

# Second 

You should create googleapi token\n
node node_modules/google-drive-util/example/generate_token.js

# For use

var GDrive = require("gdrive-tingodb")\n
var gDrive = new Gdrive({\n
    dbPath: "/path/to/your/db",\n
    dbGoogle: "ID Folder in Google Drive"\n
})\n

Used for Uplaod/Download collections on start app\n

gDrive.upDownCols()\n
    .then(() => {\n
        console.log("done")\n
    })

For update your collections with google drive use sync\n

gDrive.sync()\n
console.log("done");


