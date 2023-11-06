const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: "anthr-storage.json" });
const antHRbucket = storage.bucket("anthr-bucket");

exports.getSignedUrl = function getSignedUrl(pathFile) {
  const options = {
    action: "read",
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 Hrs
  };

  return new Promise((resolve, reject) => {
    const fileRef = antHRbucket.file(pathFile);
    fileRef.getSignedUrl(options, (err, url) => {
      if (err) {
        resolve(null);
      }
      resolve(url);
    });
  });
};


exports.uploadFile = function uploadFile(pathFile, file) {
  console.log("uploadFile", pathFile, file)
  const blob = antHRbucket.file(pathFile);
  const options = {
    metadata: {
      contentType: file.mimetype,
    },
  };
  const blobStream = blob.createWriteStream(options);

  return new Promise((resolve, reject) => {
    blobStream.on("error", (error) => {
      reject(error);
    });

    blobStream.on("finish", () => {
      resolve();
    });

    blobStream.end(file.buffer);
  });
};
