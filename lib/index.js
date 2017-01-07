var	fs = require("fs"),
	safe = require("safe"),
	util = require("google-drive-util"),
	oauth = util.readTokenSync(),
	google = require('googleapis'),
	drive2 = google.drive({ version: 'v2', auth: oauth }),
	drive3 = google.drive({ version: 'v3', auth: oauth }),
	path = require("path"),
	_ = require("lodash"),
    os = require("os"),
	cachedCollections = {};

	require("colors");


/**
 * @param params.dbPath - path to db in your project
 * @param params.dbGoogle - id of folder in google drive
 * @constructor
 */
var GdriveTingodb = function(params) {
	this.dbPath = params.dbPath;
	this.dbGoogle = params.dbGoogle;
	this.queue = safe.queue(safe.trap(function(data, cb) {

		var fn = function() {
			return data.worker().then(() => cb());
		};

		fn.apply(this, arguments)
	}), 1);
};

/**
 *
 * @param params.colName - collection name
 * @returns {*}
 */
GdriveTingodb.prototype.sync = function (params) {
	this.queue.push({
		worker: () => {
			return this.getDriveFileLists({
				fn: item => {
					if (item.title != params.colName)
						return Promise.resolve();

					var path_ = path.join(this.dbPath, params.colName);

					try {
						var file = fs.readFileSync(path_);
					}
					catch (err) {
						return Promise.reject(err);
					}

					return new Promise((resolve, reject) => {
						drive2.files.update({
							fileId: item.id,
							media: {
								mimeType: "text/plain",
								body: file
							}
						}, safe.sure(reject, resolve))
					})
					.then(() => {
						console.log("Success upload file: ".blue + params.colName.yellow);
					})
					.catch(err => {
						console.error(err);
					})
				}
			})
		}
	});
};

/**
 * Read Google Drive and Write Collection
 * @param params.fn - what we do with file lists
 * @returns {*}
 */
GdriveTingodb.prototype.getDriveFileLists = function(params) {
	return new Promise((resolve, reject) => {
		if (!_.isEmpty(cachedCollections))
			return resolve(cachedCollections);

		drive2.children.list({folderId: this.dbGoogle}, safe.sure(reject, dataDrive => {
			cachedCollections = dataDrive;
			resolve(dataDrive);
		}));
	})
	.then(dataDrive => {
		var promises = [];

		_.each(dataDrive.items, i => {
			promises.push(new Promise((resolve, reject) => {
				drive2.files.get({fileId: i.id, fields: "title,id"}, safe.sure(reject, resolve));
			})
			.then(params.fn))
		});

		return Promise.all(promises);
	})
};

/**
 * Upload and Download not exists collection for each side
 */
GdriveTingodb.prototype.upDownCols = function() {
	var downLoadedCollections = {};
	var dbItems = [];

	return Promise.all([
		new Promise(resolve => {
			fs.readdir(this.dbPath, (err, dataCurr) => {
				resolve(dataCurr || [])
			});
		}),
		new Promise(resolve => {
			fs.mkdir(this.dbPath, () => {
				resolve();
			});
		})
	])
	.then(result => {
		dbItems = result[0];
		return this.getDriveFileLists({
			fn: item => {
				downLoadedCollections[item.title] = 1;
				var dir = new Set(result[0]);

				if (dir.has(item.title))
					return Promise.resolve();

				var dest = `${this.dbPath}/${item.title}`;

				return new Promise((resolve, reject) => {
					drive3.files.get({fileId: item.id, alt: "media"}, safe.sure(reject, data => {
                        fs.writeFile(dest, data, safe.sure(reject, () => {
                            console.info("Complete downloading collection: ".blue + item.title.yellow);
                            resolve();
                        }));
                    }));
                        /*
						.on('end', function () {
                            console.info("Complete downloading collection: ".blue + item.title.yellow);
							resolve()
						})
						.on('error', function(err) {
							console.error(err);
                            resolve()
						})
						.pipe(fs.createWriteStream(dest));
				    */
				})

			}
		})
	})
	.then(() => {
		return Promise.all(_.map(dbItems, i => {
			if (downLoadedCollections[i])
				return Promise.resolve();

			var req = drive3.files.create({
				resource: {
					name: i,
					mimeType: 'text/plain',
					parents: [this.dbGoogle]
				},
				media: {
					mimeType: 'text/plain',
					body: fs.readFileSync(`${this.dbPath}/${i}`),
				},
			});

			return new Promise(resolve => {
				req
					.on("end", () => {
						console.log("Complete uploading collection: ".blue + i.yellow);
						resolve();
					})
			})
		}))
	})
};

module.exports = GdriveTingodb;

