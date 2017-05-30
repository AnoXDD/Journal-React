/**
 * Created by Anoxic on 5/27/2017.
 *
 * A OneDrive manager to manage all the network stuffs. Promises are used here
 *
 * The path referred below is from approot, i.e.
 * https://api.onedrive.com/v1.0/drive/root:/Apps/Trek/{the path starts here}
 */

const MicrosoftGraph = require("@microsoft/microsoft-graph-client");

const APPROOT = "Apps/Trak/";
// const client_id = "00000000441D0A11",
// scope = encodeURIComponent("wl.signin wl.offline_access onedrive.readwrite"),
// redirect_uri = encodeURIComponent(
//     "https://anoxdd.github.io");
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

  static bulbFolderId = "";
  static coreFolderId = "";
  static queueFolderId = "";
  static resourceFolderId = "";
  static client = null;

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
        // popup(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&scope=${scope}&response_type=code&redirect_uri=${redirect_uri}`);
        reject("Currently testing in Beta");
      }
    })
  }

  static getPathHeader(path) {
    return `/drive/root:/${APPROOT}${path}`;
  }

  static getClient() {
    return this.getCurrentToken().then(token => {
      if (this.client) {
        return this.client;
      }

      return (this.client = MicrosoftGraph.Client.init({
        authProvider: (done) => {
          done(null, token);
        }
      }));
    })
  }

  static getRootId() {
    return this.getClient().then(client => {
      return client.api(`me/drive/root/`)
          .get();
    }).then(res => res.id);
  }

  static getBulbFolderId() {
    if (this.bulbFolderId) {
      return new Promise(resolve => resolve(this.bulbFolderId));
    }

    return this.getIdByPath("bulb").then(id => this.bulbFolderId = id);
  }

  static getCoreFolderId() {
    if (this.coreFolderId) {
      return new Promise(resolve => resolve(this.coreFolderId));
    }

    return this.getIdByPath("core").then(id => this.coreFolderId = id);
  }

  static getDataFolderId() {
    if (this.dataFolderId) {
      return new Promise(resolve => resolve(this.dataFolderId));
    }

    return this.getIdByPath("data").then(id => this.dataFolderId = id);
  }

  static getQueueFolderId() {
    if (this.queueFolderId) {
      return new Promise(resolve => resolve(this.queueFolderId));
    }

    return this.getIdByPath("queue").then(id => this.queueFolderId = id);
  }

  static getResourceFolderId() {
    if (this.resourceFolderId) {
      return new Promise(resolve => resolve(this.resourceFolderId));
    }

    return this.getIdByPath("resource").then(id => this.resourceFolderId = id);
  }

  static getItemContentByUrl(url) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status    : this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status    : this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  /**
   * Returns a promise with URL of the content
   * @param id
   */
  static getItemContentById(id) {
    return this.getClient()
        .then(client => {
          return client.api(`me/drive/item/${id}`)
              .select("microsoft.graph.downloadUrl")
              .get();
        })
        .then(res => res["@microsoft.graph.downloadUrl"])
        .then(url => this.getItemContentByUrl(url));
  }

  static getItemContentByPath(path) {
    return this.getClient().then(client => {
          return client.api(`me${this.getPathHeader(path)}`)
              .select("microsoft.graph.downloadUrl")
              .get();
        })
        .then(res => res["@microsoft.graph.downloadUrl"])
        .then(url => this.getItemContentByUrl(url));
  }

  /**
   *
   * @param path
   * @returns {Promise.<*>} - each element of promise result is composed of
   *  {id: xxx, @microsoft.graph.downloadUrl: xxx, name: xxx}
   */
  static getChildrenByPath(path) {
    return this.getClient().then(client => {
      return client.api(`me${this.getPathHeader(path)}:/children`)
          .select("id", "microsoft.graph.downloadUrl", "name")
          .top(10000)
          .get();
    }).then(res => res.value);
  }

  /**
   *
   * @param path
   * @returns {Promise.<*>} - each element of promise result is composed of
   *  {id: xxx, @microsoft.graph.downloadUrl: xxx, name: xxx}
   */
  static getChildrenById(id) {
    return this.getClient().then(client => {
      return client.api(`me/drive/items/children`)
          .select("id", "microsoft.graph.downloadUrl", "name")
          .top(10000)
          .get();
    }).then(res => res.value);
  }

  /**
   *
   * @param path
   * @returns {Promise.<*>} - each element of promise result is composed of
   *  {id: xxx, @microsoft.graph.downloadUrl: xxx, name: xxx, thumbnails: xxx}
   */
  static getChildrenByPathWithThumbnails(path) {
    return this.getClient().then(client => {
      return client.api(`me${this.getPathHeader(path)}:/children`)
          .select("id", "microsoft.graph.downloadUrl", "name")
          .expand("thumbnails(select=large)")
          .top(10000)
          .get();
    }).then(res => res.value.map(val => {
      if (val.thumbnails) {
        val.thumbnails = val.thumbnails[0].large.url;
      }

      return val;
    }));
  }

  static getIdByPath(path) {
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

  static moveItemByPath(src, dest, newName) {
    return this.getClient()
        .then(client =>
            client.api(`me/${this.getPathHeader(src)}`)
                .patch(newName ? {
                  name           : newName,
                  parentReference: {
                    path: dest,
                  },
                } : {
                  parentReference: {
                    path: dest,
                  },
                })
        );
  }

  static moveItemById(id, dest, newName) {
    return this.getClient()
        .then(client =>
            client.api(`me/drive/items/${id}`)
                .patch(newName ? {
                  name           : newName,
                  parentReference: {
                    path: dest,
                  },
                } : {
                  parentReference: {
                    path: dest,
                  },
                })
        );
  }

  /**
   * Will return 409 if there is a conflict
   * @param id
   * @param folderName
   * @returns {Promise.<*>}
   * {
      "id": "0123456789abc",
      "name": "FolderA",
      "folder": { "childCount": 0 }
     }
   */
  static createFolderByIdWithConflict(id, folderName) {
    return this.getClient()
        .then(client =>
            client.api(`me/drive/items/${id}/children`)
                .post({
                  name  : folderName,
                  folder: {}
                })
        );
  }

  /**
   * Tries to create a folder under certain directory. If the folder already
   * exists, return that folder
   * @param id
   * @param folderName
   */
  static createFolderById(id, folderName) {
    return this.getChildrenById(id).then(files => {
      for (let file of files) {
        if (file.name === folderName) {
          if (file.folder) {
            return file;
          }

          // This is not a folder
          throw new Error(`File structure corrupted: expect "${folderName}" to be a folder, but got a file. `);
        }
      }

      // Nothing found, create one
      return this.createFolderByIdWithConflict(id, folderName);
    });
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

  /**
   * Validates the file structure and create necessary folders
   * The following folders have to be there before continuing:
   * Apps
   * -| Trak
   *   -| bulb
   *    | core
   *    | data
   *    | queue
   *    | resource
   */
  static verifyFileStructure(year) {
    let rootId = "";
    return this.getRootId().then(id => {
          return this.createFolderById(id, "Apps");
        })
        .then(appsId => this.getChildrenById(rootId = appsId))
        .then(folders => {
          for (let folder of folders) {
            if (folder.name === "bulb") {
              this.bulbFolderId = folder.id;
            } else if (folder.name === "core") {
              this.coreFolderId = folder.id;
            } else if (folder.name === "queue") {
              this.queueFolderId = folder.id;
            } else if (folder.name === "resource") {
              this.resourceFolderId = folder.id;
            }
          }

          return Promise.all([
            this.bulbFolderId || this.createFolderById(rootId, "bulb"),
            this.coreFolderId || this.createFolderById(rootId, "core"),
            this.queueFolderId || this.createFolderById(rootId, "queue"),
            this.resourceFolderId || this.createFolderById(rootId, "resource"),
          ]);
        })
        .catch(err => {
          throw new Error(`Unable to verify the integrity of file structure. (err: ${err})`);
        })
        .then(ids => {
          this.bulbFolderId = ids[0];
          this.coreFolderId = ids[1];
          this.queueFolderId = ids[3];
          this.resourceFolderId = ids[4];

          // Create year folder for `core` and `resource`
          return Promise.all([
            this.createFolderById(this.coreFolderId, year),
            this.createFolderById(this.queueFolderId, year)
          ])
        })
        .then(ids => {
          // Lastly, if this is the end of the year, try to create a folder for
          // the next year

          let now = new Date().getTime();
          if (now.getMonth() === 11 && now.getDate() === 31) {
            return Promise.all([
              this.createFolderById(this.coreFolderId, year + 1),
              this.createFolderById(this.queueFolderId, year + 1)
            ]);
          }
        });
  }

  /**
   * Returns a promise with a list of elements, each element being represented
   * as { id: xxx, name: {filename}, content: xxx }
   */
  static getBulbs() {
    return this.getChildrenById(this.bulbFolderId)
        .then(bulbs => bulbs.length ? new Promise(resolve => {
          let counter = 0,
              getContent = bulb => {
                this.getItemContentByUrl(bulb.url)
                    .catch(() => {
                      // Do nothing
                    })
                    .then(content => {
                      if (content) {
                        bulb.content = content;
                      }

                      // Test if all the contents have been fetched
                      if (++counter === bulbs.length) {
                        resolve(bulbs);
                      }
                    });
              }

          for (let bulb of bulbs) {
            getContent(bulb);
          }
        }) : []);
  }

  static getImagesInQueue() {
    return this.getChildrenByPathWithThumbnails("queue");
  }

  /**
   * Removes the items with these ids. Does not care about if the removal is
   * successful
   * @param ids
   */
  static removeBulbs(ids) {
    for (let bulb of ids) {
      this.removeItemById(bulb);
    }
  }

  static getJournalByYear(year) {
    return this.getItemContentByPath(`core/${year}/data.js`);
  }

  static backupJournalByYear(year, newName) {
    return this.moveItemByPath(`core/${year}/data.js`, `core/${year}`, newName);
  }

  static uploadJournalByYear(year, content) {
    return this.uploadItemByPath(`core/${year}/data.js`, content);
  }

  static getJournalImagesByYear(year) {
    return this.getChildrenByPathWithThumbnails(`resource/${year}`);
  }

  /**
   * Adds an image to an entry, and returns a promise with new name
   * @param id
   */
  static addImageById(id, year, newName) {
    return this.moveItemById(id, `resource/${year}`, newName);
  }

  /**
   * Moves an image back to under queue folder
   * @param id
   */
  static removeImageById(id, year) {
    return this.moveItemById(id, `resource/${year}`);
  }

  // region alias

  static getData(year) {
    return this.getJournalByYear(year);
  }

  /**
   * Returns a promise with a list of all the images that are attached to this
   * year and from queue, with each element as
   * { id: xxx, name: xxx, thumbnail: xxx, url: xxx, }
   * @param year
   */
  static getImages(year) {
    return Promise.all([this.getJournalImagesByYear(year), this.getImagesInQueue()])
        .then(lists => [...lists[0], lists[1]]);
  }

  static upload(year, content) {
    return this.uploadJournalByYear(year, content);
  }

  // endregion

  static test() {
    let year = 2017,
        content = "DSFAS2cdsafds",
        imageIds = [];

    this.verifyFileStructure(year)
        .then(() => {
          console.log("Uploading stuffs");
          return this.upload(year, content);
        })
        .then(() => {
          console.log("Get what just being uploaeded");
          return this.getData(year);
        })
        .then(c => {
          console.log(c === content ? "Matched" : "NOTTTT matched");
          console.log("Backing up");
          return this.backupJournalByYear(year, "data_backup.js");
        })
        .then(() => {
          console.log("Then try to grab the moved file");
          return this.getData(year);
        })
        .catch(err => {
          throw new Error(err);
        })
        .then(() => {
          console.error("You shouldn't get anything");
        }, err => {
          console.log(`Expected: with error "${JSON.stringify(err)}"`);
          console.log("Try to cause some conflict when moving files");
          return this.upload(year, content);
        })
        .then(() => {
          return this.backupJournalByYear(year, "data_backup.js");
        })
        .then(() => {
          console.error("Nothing happens, which is wrong");
        }, err => {
          console.log(`Expected conflict with error "${JSON.stringify(err)}"`);
          console.log("Then we try to do something with bulbs");

          return Promise.all([
            this.uploadItemByPath("bulb/1.txt", "1"),
            this.uploadItemByPath("bulb/2.txt", "2"),
            this.uploadItemByPath("bulb/3.txt", "3"),
            this.uploadItemByPath("bulb/4.txt", "4"),
          ]);
        })
        .then(() => {
          console.log("Fetching the content of bulbs");
          return this.getBulbs();
        })
        .then(bulbs => {
          console.log(`Got a total of ${bulbs.length}, and expect 4`);
          console.log(`And the contents are: ${bulbs.map(bulb => bulb.content)
              .join(" ")}, and expect "1 2 3 4" or something like that`);
          console.log("Then we try to remove them");
          return this.removeBulbs(bulbs.map(bulb=>bulb.id));
        })
        .then(() => {
          console.log("Let's see if everything is removed");
          return this.getBulbs();
        })
        .then(bulbs => {
          if (bulbs.length) {
            console.error("Hmmm, bulb list should be empty");
          } else {
            console.log("Yes, nothing in the bulb folder");
          }

          console.log(
              "Now we upload some fake images (texts) to the queue folder");

          return Promise.all([
            this.getItemContentByUrl("https://unsplash.it/30/30/?random")
                .then(c => this.uploadItemByPath("queue/1.jpg", c)),
            this.getItemContentByUrl("https://unsplash.it/30/30/?random")
                .then(c => this.uploadItemByPath("queue/2.jpg", c)),
            this.getItemContentByUrl("https://unsplash.it/30/30/?random")
                .then(c => this.uploadItemByPath("queue/3.jpg", c)),
            this.getItemContentByUrl("https://unsplash.it/30/30/?random")
                .then(c => this.uploadItemByPath("queue/4.jpg", c)),
            this.getItemContentByUrl("https://unsplash.it/30/30/?random")
                .then(c => this.uploadItemByPath("queue/5.jpg", c)),
          ]);
        })
        .then(ids => {
          console.log(
              "Before we get started, try to fetch the 'image list first'");

          return this.getImages(year);
        })
        .then(images => {
          console.log("The thumbnails will be open in other pages");

          for (let image of images) {
            if (image.thumbnails) {
              window.open(image.thumbnails);
            } else {
              console.error(`${image.name} does not have a thumbnail`);
            }
          }

          imageIds = images;

          console.log(`The names of them are ${images.map(image => image.name)
              .join(" ")}, expect 1.jpg 2.jpg 3.jpg 4.jpg 5.jpg or something like that`);
          console.log("Now we are moving them to some other locations");

          return Promise.all([
            this.addImageById(images[0].id, year, "renamed.jpg"),
            this.addImageById(images[1].id, year),
          ]);
        })
        .then(() => {
          console.log("Removing one of the image");

          return this.removeImageById(imageIds[1].id, year);
        })
        .then(() => {
          console.log("Move another image into the resource");

          return this.addImageById(imageIds[2].id, year);
        })
        .then(() => {
          console.log(
              "Now we are trying to get every image again to see if it changes");

          return this.getImages(year);
        })
        .then(images => {
          console.log("Finally, let's take a look at who they are");

          for (let image of images) {
            if (image.thumbnails) {
              window.open(image.thumbnails);
            } else {
              console.error(`${image.name} does not have a thumbnail`);
            }
          }

          imageIds = images;

          console.log(`The names of them are ${images.map(image => image.name)
              .join(" ")}, expect 1.jpg 2.jpg 3.jpg 4.jpg 5.jpg or something like that`);

          console.log("..... And finally we are done here ..... ");
        });
  }
}