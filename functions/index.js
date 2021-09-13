const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data) => {
  return admin
    .auth()
    .getUserByEmail(data.email)
    .then((user) => {
      //設定用戶自訂義聲明，並將admin設為true
      return admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      })
    })
    .then(() => {
      return {
        message: `Success: ${data.email} has been made an admin!`,
      };
    })
    .catch((err) => {
      console.log(err);
    });
});
