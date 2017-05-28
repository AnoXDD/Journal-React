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

export default class OneDriveManager {

  static getCurrentToken() {
    // todo use the real token
    return new Promise((resolve, reject) => {
      resolve("token_token");
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

  static createFolderUnderId(Id, folderName) {
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
}
