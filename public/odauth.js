/**
 * Created by Anoxic on 5/28/2017.
 *
 * A plain JavaScript file to deal with sign-in
 */

function getAppInfo() {
  const clientId = "00000000441D0A11",
      scopes = encodeURIComponent(
          "wl.signin wl.offline_access onedrive.readwrite"),
      redirectUri = encodeURIComponent(
          "https://anoxdd.github.io/journal/callback.html"),
      clientSecret = "s0rwHqRtgUvQosAZNPzdtfN";

  return {
    "clientId"    : clientId,
    "scopes"      : scopes,
    "redirectUri" : redirectUri,
    "clientSecret": clientSecret
  };
}

function setCookie(token, expiresInSeconds) {
  var expiration = new Date();
  // Expiration set up back 5 minutes
  expiration.setTime(expiration.getTime() + (expiresInSeconds || 3600) * 1000 - 300000);
  localStorage["expiration"] = expiration.getTime();
  // Access token
  var cookie = "odauth=" + token + "; path=/; expires=" + expiration.toUTCString();
  if (document.location.protocol.toLowerCase() == "https") {
    cookie = cookie + ";secure";
  }
  document.cookie = cookie;
}

function onAuthenticated() {
  // do nothing here
}

console.info("Tip: use `setCookie(token) to log in manually");