/**
 * Created by Anoxic on 5/27/2017.
 *
 * A OneDrive manager to manage all the network stuffs. Promises are used here
 *
 * The path referred below is from approot, i.e.
 * https://api.onedrive.com/v1.0/drive/root:/Apps/Trek/{the path starts here}
 */

import MicrosoftGraph from "@microsoft/microsoft-graph-client";

const APPROOT = "Apps/Trek/";
// client_id = "00000000441D0A11",
// scope = encodeURIComponent("wl.signin wl.offline_access onedrive.readwrite"),
// redirect_uri = encodeURIComponent(
//     "https://anoxdd.github.io/journal/callback.html");
//
// function popup(url) {
//   var width = 525,
//       height = 525,
//       screenX = window.screenX,
//       screenY = window.screenY,
//       outerWidth = window.outerWidth,
//       outerHeight = window.outerHeight;
//
//   var left = screenX + Math.max(outerWidth - width, 0) / 2;
//   var top = screenY + Math.max(outerHeight - height, 0) / 2;
//
//   var features = [
//     "width=" + width,
//     "height=" + height,
//     "top=" + top,
//     "left=" + left,
//     "status=no",
//     "resizable=yes",
//     "toolbar=no",
//     "menubar=no",
//     "scrollbars=yes"
//   ];
//   var popup = window.open(url, "oauth", features.join(","));
//
//   popup.focus();
// }

export default class OneDriveManager {

  // region general utility functions

  static getCookie(name) {
    name += "=";
    var cookies = document.cookie,
        start = cookies.indexOf(name);
    if (start >= 0) {
      start += name.length;
      var end = cookies.indexOf(";", start);
      if (end < 0) {
        end = cookies.length;
      }

      var value = cookies.substring(start, end);
      return value;
    }

    return "";
  }

  static getTokenFromCookie() {
    return this.getCookie("odauth");
  }

  static getRefreshFromCookie() {
    return this.getCookie("refresh");
  }

  static getCurrentToken() {
    // todo use the real token
    return new Promise((resolve, reject) => {
      let cookie = this.getTokenFromCookie();

      if (cookie) {
        resolve(cookie);
      } else {
        // popup(`https://login.live.com/oauth20_authorize.srf?client_id=${client_id}&scope=${scope}&response_type=code&redirect_uri=${redirect_uri}`);
        reject("Currently testing in Beta");
      }
    })
  }

  static getPathHeader(path) {
    return `/drive/root:/${APPROOT}${path}`;
  }

  static getClient() {
    return this.getCurrentToken().then(token => {
      return MicrosoftGraph.Client.init({
        authProvider: (done) => {
          done(null, token);
        }
      });
    })
  }

  /**
   * Returns a promise with URL of the content
   * @param id
   */
  static getItemContentById(id) {
    return this.getClient().then(client => {
      return client.api(`me/drive/item/${id}`)
          .select("@microsoft.graph.downloadUrl")
          .get();
    }).then(res => res["@microsoft.graph.downloadUrl"]);
  }

  static getItemContentByAbsolutePath(path) {
    return this.getClient().then(client => {
      return client.api(`me${this.getPathHeader(path)}`)
          .select("@microsoft.graph.downloadUrl")
          .get();
    }).then(res => res["@microsoft.graph.downloadUrl"]);
  }

  /**
   *
   * @param path
   * @returns {Promise.<*>} - each element of promise result is composed of
   *  {id: xxx, @microsoft.graph.downloadUrl: xxx, name: xxx}
   */
  static getItemListUnderPath(path) {
    return this.getClient().then(client => {
      return client.api(`me${this.getPathHeader(path)}:/children`)
          .select("id", "@microsoft.graph.downloadUrl", "name")
          .top(10000)
          .get();
    }).then(res => res.value);
  }

  static getIdFromPath(path) {
    return this.getClient().then(client => {
      client.api(`me${this.getPathHeader(path)}`).get()
    }).then(res => res.id);
  }

  static copyItemById(id, destPath, newName) {
    let DATA = {
      parentReference: {
        path: `/drive/root:/${APPROOT}${destPath}`,
      },
    };

    if (newName) {
      DATA.name = newName;
    }

    return this.getClient()
        .then(client => client.api(`me/drive/items/${id}/copy`)
            .post(DATA));
  }

  static uploadItemByPath(path, content) {
    return this.getClient()
        .then(client =>
            client.api(`me${this.getPathHeader(path)}:/content`)
                .put(content)
        );
  }

  static removeItemById(id) {
    return this.getClient()
        .then(client =>
            client.api(`me/drive/items/${id}`)
                .delete()
        );
  }

  static moveItemByPath(src, dest) {
    return this.getClient()
        .then(client =>
            client.api(`me/${this.getPathHeader(src)}`)
                .patch({
                  parentReference: {
                    path: dest,
                  },
                })
        );
  }

  static createFolderUnderId(id, folderName) {
    return this.getClient()
        .then(client =>
            client.api(`me/drive/items/${id}/children`)
                .post({
                  name  : folderName,
                  folder: {}
                })
        );
  }

  static getThumbNail(id) {
    const size = "c800x800_Crop";

    return this.getClient()
        .then(client =>
            client.api(`me/drive/items/${id}/thumbnails`)
                .select(size)
        ).then(res => res.value[0][size].url);
  }

  // endregion

  static signIn() {
    return OneDriveManager.getClient();
  }

  static silentSignIn() {
    return new Promise((resolve, reject) => {
      if (OneDriveManager.getTokenFromCookie()) {
        resolve();
      } else {
        reject();
      }
    });
  }
}