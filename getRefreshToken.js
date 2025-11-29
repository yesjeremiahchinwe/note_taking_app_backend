const { google } = require("googleapis");

const CLIENT_ID = "78689087138-0bv03aml9se9q1ve4b23epvftmnvaeut.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);


const code = "4%2F0Ab32j933NSqtShmyQxHAv-CKlZLqvzEQTotRZQ68HTyaVcrwzRh3uSbpfrTVmUnh-7fpDA";

async function getToken() {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("TOKENS:", tokens);
  } catch (err) {
    console.error("Error exchanging code:", err);
  }
}

getToken();

// console.log("Authorize this URL:");

// console.log(
//   oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://mail.google.com/"],
//     prompt: "consent",
//   })
// );
