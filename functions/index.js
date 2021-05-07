const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const webpush = require("web-push");
const formidable = require("formidable");
const fs = require("fs");
const UUID = require("uuid-v4");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var serviceAccount = require("./pwagram-fb-key.json");

var gcconfig = {
  projectId: "pwagram-a333e",
  keyFilename: "pwagram-fb-key.json",
};

const gcs = require("@google-cloud/storage")(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwagram-a333e-default-rtdb.firebaseio.com",
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    var uuid = UUID();
    var formData = new formidable.IncomingForm();
    formData.parse(request, (err, fields, files) => {
      fs.rename(files.file.path, "/tmp/" + files.file.name);
      var bucket = gcs.bucket("pwagram-a333e.appspot.com");

      bucket.upload(
        "/tmp/" + files.file.name,
        {
          uploadType: Media,
          metadata: {
            metadata: {
              contentType: files.file.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        (err, uploadedFile) => {
          if (!err) {
            admin
              .database()
              .ref("posts")
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng,
                },
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid,
              })
              .then(() => {
                webpush.setVapidDetails(
                  "mailto: jamil.qolinezhad@gmail.com",
                  "BAD8YSlHy6yCmh-wkbS39ojK1eoro8RtuYnXz0TIAbrNFU_LJGHfZgYjoy5HK9tX02Jte5pMw27LCDfypZdr36A",
                  "a4byyZ-cq0ofc4HpFmHzwCJIKMet3BJGs850KpW9r0w"
                );
                return admin
                  .database()
                  .ref("subscriptions")
                  .once("value")
                  .then((subscriptions) => {
                    subscriptions.forEach((sub) => {
                      var pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: {
                          auth: sub.val().keys.auth,
                          p256dh: sub.val().keys.p256dh,
                        },
                      };
                      webpush
                        .sendNotification(
                          pushConfig,
                          JSON.stringify({
                            title: "New Post",
                            content: "New Post added!",
                            openUrl: "/help",
                          })
                        )
                        .catch((err) => {
                          console.log(err);
                        });
                    });
                    response
                      .status(201)
                      .json({ message: "Data stored", id: fields.id });
                  })
                  .catch((err) => {
                    response.status(500).json({ error: err });
                  });
              });
          } else {
            console.log(err);
          }
        }
      );
    });
  });
});
