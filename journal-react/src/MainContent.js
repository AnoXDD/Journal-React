/**
 * Created by Anoxic on 042917.
 * The main frame of the whole thing
 */

import React, {Component} from "react";
import NotificationSystem from "react-notification-system";

import Button from "./Button";
import Editor from './Editor';
import Calendar from "./Calendar";
import EntryView from "./EntryView";
import SearchBar from "./SearchBar";
import BulbMap from "./BulbMap";
import Chart from "./Chart";
import BulbEditor from "./BulbEditor";
import LoadingScreen from "./LoadingScreen";
import Settings from "./Settings";

import OneDriveManager from "./OneDriveManager";

import R from "./R";

const BULB_WEB_URL_PATTERN = /(.+)@(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(.*)/,
    BULB_LOCATION_PATTERN = /(.+)#\[(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)\](.*)/,
    BULB_LOCATION_PATTERN_WITH_NAME = /(.+)#\[(.+),(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)\](.*)/;


function upgradeDataFromVersion2To3(oldData) {
  let data = [],
      list = ["video", "voice", "place", "book"];

  for (let d of oldData) {
    let entry = {};
    entry.type = d.contentType === 1 ? R.TYPE_BULB : R.TYPE_ARTICLE;
    entry.time = Object.assign({}, d.time);
    entry.body = d.text.body;
    // for debug here
    // entry.body = d.text.body.replace(/[a-z0-9]/gi,
    //     Math.random().toString(36).charAt(3));

    if (d.images && d.images.length) {
      let images = [];
      for (let image of d.images) {
        images.push(image.fileName);
      }

      entry.images = images;
    }

    if (entry.type === R.TYPE_BULB) {
      entry.place = Object.assign({}, d.place);
    }

    if (entry.type === R.TYPE_ARTICLE) {
      entry.title = d.title;
      // for debug here
      // entry.title = d.title.replace(/[a-z]/gi,
      //     Math.random().toString(36).charAt(3));
      entry.tags = d.tags.split("|");

      if (d.music && d.music.length) {
        entry.music = Object.assign({}, d.music);
      }

      if (d.movie && d.movie.length) {
        entry.movie = Object.assign({}, d.movie);
      }

      if (d.weblink && d.weblink.length) {
        entry.links = Object.assign({}, d.weblink);
      }

      if (d.video || d.voice || d.book || d.place) {
        let others = {};
        for (let l of list) {
          if (d[l] && d[l].length) {
            others[l] = Object.assign({}, d[l]);
          }
        }

        if (Object.keys(others).length) {
          entry.others = others;
        }
      }
    }

    data.push(entry);
  }

  return data;
}

const defaultColors = {
      success: {
        rgb: '94, 164, 0',
        hex: '#5ea400'
      },
      error  : {
        rgb: '236, 61, 61',
        hex: '#ec3d3d'
      },
      warning: {
        rgb: '235, 173, 23',
        hex: '#ebad1a'
      },
      info   : {
        rgb: '54, 156, 199',
        hex: '#369cc7'
      }
    },
    notificationBoxShadow = "1px 2px 6px grey",
    notificationStyle = {
      Title: {
        DefaultStyle: {
          fontSize  : '15px',
          margin    : '0 0 5px 0',
          padding   : 0,
          fontWeight: 'bold'
        },

        success: {
          color: defaultColors.success.hex
        },

        error: {
          color: defaultColors.error.hex
        },

        warning: {
          color: defaultColors.warning.hex
        },

        info: {
          color: "#448AFF",
        }

      },

      NotificationItem: {
        DefaultStyle: {
          position       : 'relative',
          width          : '230px',
          cursor         : 'pointer',
          fontSize       : 'inherit',
          margin         : '10px 0 0',
          padding        : '20px 30px',
          display        : 'block',
          WebkitBoxSizing: 'border-box',
          MozBoxSizing   : 'border-box',
          boxSizing      : 'border-box',
          opacity        : 0,
          transition     : '.4s ease',
          willChange     : 'transform, opacity',

          isHidden: {
            opacity: 0
          },

          isVisible: {
            opacity: 1
          }
        },

        success: {
          borderTop      : "none",
          backgroundColor: '#009688',
          color          : 'black',
          boxShadow      : notificationBoxShadow,
        },

        error: {
          borderTop      : "none",
          backgroundColor: '#FF8A80',
          color          : 'black',
          boxShadow      : notificationBoxShadow,
        },

        warning: {
          borderTop      : "none",
          backgroundColor: '#FFFF8D',
          color          : "black",
          boxShadow      : notificationBoxShadow,
        },

        info: {
          borderTop      : "none",
          backgroundColor: 'white',
          color          : 'black',
          boxShadow      : notificationBoxShadow,
        }
      },
    };

export default class MainContent extends Component {

  SEARCH_BAR_TAGS = ["tags", "months", "attachments"];
  TAB = {
    NO_CHANGE: 0,
    LIST     : 1 << 1,
    EDITOR   : 1 << 2,
    HISTORY  : 1 << 3,
    STATS    : 1 << 4,
    OPTIONS  : 1 << 5,
  };

  state = {
    data   : [],
    version: 0,

    isDisplaying        : this.TAB.LIST,
    isDisplayingCalendar: false,
    isDisplayingMapView : true,

    // Use | to connect them later
    enabledTabs: this.TAB.LIST | this.TAB.STATS | this.TAB.OPTIONS,

    editArticleIndex: undefined,

    loadingPrompt        : "Signing in ...",
    isLoadingPreviousYear: false,
    isLoadingNextYear    : false,

    isShowingBulbEditor: false,
  };

  data = [];
  imageMap = {};

  year = new Date().getFullYear();

  notificationSystem = null;

  /**
   * Stores the original positions and times of articles and bulbs
   * @type {{}}
   */
  contentStyle = {};
  articleList = [];
  bulbList = [];
  highlightBulbIndex = -1;

  editorVersion = 0;
  editedEntryTimestamp = 0;
  bulbEditorContent = "";

  unprocessedBulbs = 0;

  /* Press escape anywhere to return to this tab */
  escapeToReturn = this.TAB.NO_CHANGE;


  constructor(props) {
    super(props);

    /**
     * `this.data` stores all the data that can be displayed, while
     * `this.state.data` stores the data that are actually displayed
     */
    this.data = [...this.state.data];

    this.updateContentStyle = this.updateContentStyle.bind(this);

    this.loadData = this.loadData.bind(this);
    this.extractRawContent = this.extractRawContent.bind(this);
    this.handleNewRawBulbs = this.handleNewRawBulbs.bind(this);
    this.handleNewContent = this.handleNewContent.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
    this.handleCalendarClick = this.handleCalendarClick.bind(this);
    this.handleArticleClick = this.handleArticleClick.bind(this);
    this.handleBulbClick = this.handleBulbClick.bind(this);
    this.handleCreateArticle = this.handleCreateArticle.bind(this);
    this.handlePromptCancel = this.handlePromptCancel.bind(this);
    this.handleBulbEditorSend = this.handleBulbEditorSend.bind(this);
    this.handleBulbEditorEdit = this.handleBulbEditorEdit.bind(this);
    this.handleMissingImages = this.handleMissingImages.bind(this);
    this.toggleIsDisplayingCalendar = this.toggleIsDisplayingCalendar.bind(this);
    this.toggleIsDisplayingMapView = this.toggleIsDisplayingMapView.bind(this);
    this.findDataIndexByArticleIndex = this.findDataIndexByArticleIndex.bind(
        this);

    this.updateContentStyle(this.state.data);
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateContentStyle(nextState.data);

    // Update `editArticleIndex`
    if (this.editedEntryTimestamp) {
      let editArticleIndex = this.articleList.findIndex(
          article => article.time.created === this.editedEntryTimestamp);
      nextState.editArticleIndex = editArticleIndex;

      this.editedEntryTimestamp = 0;
    }
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentDidMount() {
    this.notificationSystem = this.refs.notificationSystem;

    this.loadData();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  loadData() {
    // Fetch data from server
    return OneDriveManager.verifyFileStructure(this.year,
        val => this.setState({loadingProgress: val}))
        .then(() => {
          this.setState({
            loadingProgress: 0,
            loadingPrompt  : "Downloading content ..."
          });

          return OneDriveManager.getData(this.year);
        })
        .then(content => {
          this.handleNewContent(content);

          this.setState({
            loadingPrompt: "Merging bulbs ..."
          });

          return OneDriveManager.getBulbs(
              val => this.setState({loadingProgress: val}))
              .then(bulbs => this.handleNewRawBulbs(bulbs));
        })
        .catch(err => {
          this.setState({
            loadingPrompt: "Looks like there is an error fetching you data. Refresh the website and try again."
          });
          throw new Error(JSON.stringify(err));
        })
        .then(() => {
          this.setState({
            loadingProgress: 0,
            loadingPrompt  : "Downloading images ..."
          });

          return OneDriveManager.getImages(this.year);
        })
        .then(images => {
          this.handleNewImageMap(images);

          this.setState({
            loadingPrompt      : "",
            isDisplayingMapView: false,
            version            : new Date().getTime(),
          });
        });
  }

  // region Utility functions

  extractWebsiteFromContent(bulb) {
    var result = BULB_WEB_URL_PATTERN.exec(bulb.content);
    if (result) {
      bulb.links = result[2];

      // Remove the website
      bulb.content = result[1] + result[result.length - 1];
    }
  }

  extractLocationFromContent(bulb) {
    // Location, without name
    var data = bulb.content;
    var result = BULB_LOCATION_PATTERN.exec(data);

    if (result) {
      bulb.place = {
        title    : result[2] + "," + result[3],
        latitude : result[2],
        longitude: result[3]
      };

      // Remove the location
      bulb.content = result[1] + result[result.length - 1];
    } else {
      // Location, with name
      result = BULB_LOCATION_PATTERN_WITH_NAME.exec(data);
      if (result) {
        bulb.place = {
          title    : result[2],
          latitude : result[3],
          longitude: result[4]
        };

        // Remove the location
        bulb.content = result[1] + result[result.length - 1];
      }
    }
  }

  extractRawContent(bulb) {
    this.extractWebsiteFromContent(bulb);
    this.extractLocationFromContent(bulb);
  }

  /**
   * Converts the name of the bulb to the seconds from epoch
   * @param myStr - e.g. 050711_080523
   * @returns {number}
   */
  convertBulbTime(myStr) {
    var month = parseInt(myStr.substr(0, 2), 10);
    var day = parseInt(myStr.substr(2, 2), 10);
    var year = 2000 + parseInt(myStr.substr(4, 2), 10);
    var hour = parseInt(myStr.substr(7, 2), 10);
    var minute = parseInt(myStr.substr(9, 2), 10);
    var second = parseInt(myStr.substr(11, 2), 10);

    return new Date(year, month - 1, day, hour, minute, second).getTime();
  }

  // endregion

  /**
   * Process a bulb object and merge it with data. Upload it if
   * `this.unprocessedBulbs` is equal to 0
   * DO NOT call this function while other bulb handling function is not
   * finished
   * @param bulbContent - a string of the content of bulb
   * @param image - an object an image { id : xxx , name : xxx }
   */
  handleNewRawBulb(bulbContent, image) {
    this.unprocessedBulbs = 1;

    let bulb = {
      time   : {created: new Date().getTime()},
      content: bulbContent
    };

    this.extractRawContent(bulb);

    if (image) {
      bulb.imageId = image.id;
      return OneDriveManager.addImageById(bulb.imageId, this.year)
          .then(() => this.handleNewProcessedBulbs([bulb], [image]));
    }

    return this.handleNewProcessedBulbs([bulb], []);
  }

  /**
   *
   * @param bulbObject - the object that takes from the promise of
   *     OneDriveManager.getBulbs()
   * @returns {Promise}
   */
  handleNewRawBulbs(bulbObject) {
    return new Promise((resolve, rej) => {
      if (!bulbObject || bulbObject.length === 0) {
        resolve();
      }

      let uploadedImages = [];

      const onBulbFinish = () => {
        if (--this.unprocessedBulbs === 0) {
          this.handleNewProcessedBulbs(bulbObject, uploadedImages)
              .then(res => resolve(res));
        }
      };

      for (let bulb of bulbObject) {
        bulb.content = bulb.content.replace(/\r*\n/g, " ");

        this.extractRawContent(bulb);
      }

      this.unprocessedBulbs = bulbObject.length;

      for (let bulb of bulbObject) {
        // Check if the bulb has not been merged
        let merged = false,
            time = this.convertBulbTime(bulb.name);
        for (let entry of this.state.data) {
          if (entry.type === R.TYPE_BULB) {
            if (entry.time.created <= time) {
              merged = entry.time.created === time;
              break;
            }
          }
        }

        if (merged) {
          bulb.merged = true;
          onBulbFinish();
          continue;
        }

        bulb.time = {created: time};

        // Transfer the image (if any)
        if (bulb.imageId) {
          OneDriveManager.addImageById(bulb.imageId, this.year)
              .then(image => {
                uploadedImages.push({id: image.id, name: image.name});
                onBulbFinish();
              }, ()=> {
                onBulbFinish();
              })
        } else {
          onBulbFinish();
        }
      }
    });
  }

  /**
   * Handles the new processed bulbs.
   * @param bulbObjects - a list of bulb object { content: xxx, (imageId: xxx)}
   * @param uploadedImages - a list of image objects { id: xxx, name: xxx}
   */
  handleNewProcessedBulbs(bulbObjects, uploadedImages) {
    let processedBulbs = [],
        processedBulbIds = [];

    for (let bulb of bulbObjects) {
      // First see if this bulb has been merged already
      if (bulb.merged) {
        processedBulbIds.push(bulb.id);
        if (bulb.imageId) {
          processedBulbIds.push(bulb.imageId);
        }

        continue;
      }

      bulb.body = bulb.content;
      bulb.type = R.TYPE_BULB;

      // Add image to the bulb if applicable
      if (bulb.imageId) {
        let image = uploadedImages.find(
            image => image.id === bulb.imageId);

        if (image) {
          // Uploaded successfully!
          bulb.images = [image.name];
        } else {
          continue;
        }
      }

      if (bulb.id) {
        processedBulbIds.push(bulb.id);
      }

      // Remove unnecessary keys
      delete bulb.id;
      delete bulb.name;
      delete bulb.content;
      delete bulb.imageId;

      processedBulbs.push(R.copy(bulb));
    }

    if (processedBulbs.length) {
      return this.uploadUnprocessedData([...this.state.data, ...processedBulbs])
          .then(() => {
                if (processedBulbIds.length) {
                  return OneDriveManager.removeBulbs(processedBulbIds);
                }
              }
          );
    }

    return OneDriveManager.removeBulbs(processedBulbIds);
  };

  handleNewImageMap(images) {
    this.imageMap = {};
    for (let image of images) {
      this.imageMap[image.name] = {
        id       : image.id,
        thumbnail: image.thumbnails,
      };
    }
  }

  handleNewContent(raw) {
    if (raw) {
      this.data = raw[0] === '2' ? upgradeDataFromVersion2To3(JSON.parse(raw.substr(
          1))) : JSON.parse(raw.substr(1));

      this.setState({
        data: this.data,
      });
    } else {
      this.data = [];

      this.setState({
        data: [],
      });
    }
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.handleViewChange(this.escapeToReturn);
    }

    this.escapeToReturn = this.TAB.NO_CHANGE;
  }

  handleCalendarClick(top) {
    this.scrollTop = top;

    this.setState({
      version: new Date().getTime(),
    });
  }

  handleChangeCriteria(c) {
    if (c.simple && !c.keywords.length) {
      // Empty
      this.setState({
        data   : this.data,
        version: new Date().getTime(),
      });
    } else {
      let newData = this.data.filter(d => {
        // First, type
        if (!c.simple && ((!c.hasArticle && d.type === R.TYPE_ARTICLE) ||
            (!c.hasBulb && d.type === R.TYPE_BULB))) {
          return false;
        }

        // Second, keywords
        if (c.keywords && c.keywords.length && c.keywords.findIndex(k => {
              return (d.title && d.title.indexOf(k) !== -1) ||
                  d.body.indexOf(k) !== -1;
            }) === -1) {
          return false;
        }

        // Time
        if (c.months && c.months.length && c.months.findIndex(m => {
              return new Date(d.time.created).getMonth() === m;
            }) === -1) {
          return false;
        }

        // Tag
        if (c.tags && c.tags.length && d.tags) {
          if (c.tags.findIndex(t => {
                return d.tags.indexOf(t) !== -1;
              }) === -1) {
            return false;
          }
        }

        // Attachments
        if (c.attachments && c.attachments.length && c.attachments.findIndex(
                a => {
                  return typeof d[a] !== "undefined";
                }) === -1) {
          return false;
        }

        return true;
      })

      this.setState({
        data   : newData,
        version: new Date().getTime(),
      });
    }
  }

  handleViewChange(newView) {
    if (newView && newView !== this.TAB.NO_CHANGE) {
      this.setState({
        isDisplaying: newView,
      });
    }
  }

  handlePromptCancel(e) {
    // Set to zero to tell the editor that that data is not the latest
    this.editorVersion = 0;
    this.handleViewChange(this.TAB.LIST);
  }

  handleCreateArticle() {
    this.editorVersion = new Date().getTime();
    this.setState({
      editArticleIndex   : -1,
      enabledTabs        : this.state.enabledTabs | this.TAB.EDITOR,
      isShowingBulbEditor: false,
    }, this.handleViewChange(this.TAB.EDITOR));
  }

  handleArticleClick(i) {
    this.editorVersion = new Date().getTime();
    this.escapeToReturn = this.TAB.LIST;
    this.setState({
      editArticleIndex: i,
      enabledTabs     : this.state.enabledTabs | this.TAB.EDITOR,
    }, this.handleViewChange(this.TAB.EDITOR));
  }

  handleBulbClick(top, index) {
    this.highlightBulbIndex = index;
    this.handleCalendarClick(top);
  }

  handleBulbEditorSend(bulbContent, imageId) {
    return this.handleNewRawBulb(bulbContent, imageId)
        .then(() => {
          this.setState({
            isShowingBulbEditor: false,
          })
        })
        .catch(err => {
          R.notifyError(this.notificationSystem,
              "There is an error when publishing the bulb. Try again");
        });
  }

  handleBulbEditorEdit(bulbContent) {
    this.bulbEditorContent = bulbContent;
    this.handleCreateArticle();
  }

  handleArticleChange(newEntry) {
    this.editedEntryTimestamp = newEntry.time.created;

    if (this.articleList[this.state.editArticleIndex]) {
      let index = this.findDataIndexByArticleIndex(this.state.editArticleIndex),
          dataCopy = [...this.state.data];

      if (index !== -1) {
        dataCopy[index] = newEntry;
        return this.uploadUnprocessedData(dataCopy);
      } else {
        // Technically this shouldn't happen
        R.notifyError(this.notificationSystem,
            "Unable to upload the data. Try exit the editor and upload again");
        return new Promise((res, rej) => rej());
      }
    }

    // Adding a new entry
    return this.uploadUnprocessedData([...this.state.data, newEntry]);
  }

  /**
   * Prompts the user and ask them if they really want it removed
   * @param articleIndex
   */
  handleArticleRemove(articleIndex) {
    let index = this.findDataIndexByArticleIndex(articleIndex),
        dataCopy = [...this.state.data];

    if (index !== -1) {
      dataCopy.splice(index, 1);

      return this.uploadData(dataCopy);
    } else {
      // Technically this shouldn't happen
      R.notifyError(this.notificationSystem,
          "Unable to upload the data. Try refreshing the website");
      return new Promise((res, rej) => rej());
    }
  }

  handleEditorRefreshQueue() {
    return OneDriveManager.getImages(this.year)
        .then(imageMap => {
          this.handleNewImageMap(imageMap);
          this.forceUpdate();

          return OneDriveManager.getImagesInQueue();
        })
        .catch(err => {
          console.error(err.stack);
          R.notifyError(this.notificationSystem,
              "There was an error when fetching the queue. Try again");
        });
  }

  /**
   * Finds all the images in the resource folder that doesn't belong to any
   * bulbs and articles and move them to `queue`
   */
  handleMissingImages() {
    // First, make a list of all the images
    let images = [];

    for (let entry of this.state.data) {
      if (entry.images) {
        images = [...images, ...entry.images];
      }
    }

    // Then get a list of all the images in the folder
    return OneDriveManager.getJournalImagesByYear(this.year)
        .then(journalImages => {
          let missingImages = journalImages.filter(
              journalImage => images.indexOf(journalImage.name) === -1);

          return new Promise(res => {
            if (missingImages.length === 0) {
              R.notify(this.notificationSystem, "No missing images found");
              res();
            }

            let unprocessed = missingImages.length,
                onFinished = () => {
                  if (--unprocessed === 0) {
                    R.notify(this.notificationSystem,
                        `Fixed ${missingImages.length} missing images`);
                    res();
                  }
                };

            for (let image of missingImages) {
              OneDriveManager.removeImageById(image.id)
                  .then(() => onFinished());
            }
          });
        });

  }

  /**
   * Tring to upload an unprocessed data, which means the data will be
   * processed and then uploaded
   * @param data
   */
  uploadUnprocessedData(data) {
    return this.uploadData(
        data.sort((lhs, rhs) => rhs.time.created - lhs.time.created)
    );
  }

  /**
   * Uploads the data, assuming that the data is sorted
   * @param data
   */
  uploadData(data) {
    return OneDriveManager.upload(this.year,
            R.DATA_VERSION + JSON.stringify(data))
        .then(() => {
          R.notify(this.notificationSystem, "Uploaded");
        }, () => {
          R.notifyError(this.notificationSystem,
              "Unable to upload the data. Try again!");
        })
        .then(() => OneDriveManager.getImages(this.year))
        .then(images => {
          this.handleNewImageMap(images);

          this.setState({
            data   : data,
            version: new Date().getTime()
          });
        });
  }

  toggleIsDisplayingCalendar() {
    this.setState({
      isDisplayingCalendar: !this.state.isDisplayingCalendar,
    });
  }

  toggleIsDisplayingMapView() {
    this.setState({
      isDisplayingMapView: !this.state.isDisplayingMapView,
    });
  }

  /**
   * To make the querying easier, the program breaks the data into a list of
   * articles and a list of bulbs. But to do data manipulation, the real index
   * of data is needed. This functions converts the article index into the data
   * index.
   * @param articleIndex
   */
  findDataIndexByArticleIndex(articleIndex) {
    let timestamp = this.articleList[articleIndex].time.created;
    for (let i = 0; i < this.state.data.length; ++i) {
      let entry = this.state.data[i];
      if (entry.type === R.TYPE_ARTICLE && entry.time.created === timestamp) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Return the correct state based on this.props
   */
  updateContentStyle(data) {
    this.contentStyle = {};
    this.bulbList = [];
    this.articleList = [];

    let articleHeight = 0,
        bulbHeight = 0;

    for (let content of data) {
      if (content.type === R.TYPE_BULB) {
        // Bulb
        this.bulbList.push(content);

        // Calculate the height
        let top = Math.max(articleHeight - R.BULB_HEIGHT_ORIGINAL,
            bulbHeight);
        this.contentStyle[content.time.created] = top;

        bulbHeight = top + R.BULB_HEIGHT;
      } else {
        // Article
        this.articleList.push(content);

        let currentHeight = content.images ? R.ARTICLE_IMAGE_HEIGHT : R.ARTICLE_NO_IMAGE_HEIGHT,
            top = Math.max(bulbHeight - (currentHeight - R.ARTICLE_MARGIN),
                articleHeight);
        this.contentStyle[content.time.created] = top;

        articleHeight = top + currentHeight;
      }
    }

    this.contentStyle.height = Math.max(articleHeight, bulbHeight);
  }

  toPreviousYear() {
    this.setState({
      isLoadingPreviousYear: true
    });

    return OneDriveManager.getAvailableYears()
        .then(years => {
          let i = years.findIndex(year => year === this.year);

          if (i !== 0) {
            this.year = years[i - 1];
            this.loadData()
                .then(() => {
                  this.setState({
                    isLoadingPreviousYear: false,
                  });
                }, () => {
                  this.year = years[i];
                  this.forceUpdate();
                });
          } else {
            R.notify(this.notificationSystem,
                "You've reached the earliest days of your journal");
          }
        });
  }

  toNextYear() {
    this.setState({
      isLoadingNextYear: true
    });

    return OneDriveManager.getAvailableYears()
        .then(years => {
          let i = years.findIndex(year => year === this.year);

          if (i !== years.length - 1) {
            this.year = years[i + 1];
            this.loadData()
                .then(() => {
                  this.setState({
                    isLoadingNextYear: false,
                  });
                }, () => {
                  this.year = years[i];
                  this.forceUpdate();
                });
          } else {
            R.notify(this.notificationSystem, "You can't travel to the future");
          }
        });
  }

  render() {
    const BUTTONS = [{
      text     : "LIST",
      icon     : "list",
      className: `list-tab dark ${this.state.isDisplaying === this.TAB.LIST ? "active" : ""}`
    }, {
      text     : "calendar",
      icon     : "date_range",
      indent   : "indent",
      className: `dark ${this.state.isDisplayingCalendar && this.state.isDisplaying === this.TAB.LIST ? "active" : ""} ${this.state.isDisplaying === this.TAB.LIST ? "" : "disabled"}`,
      onClick  : this.toggleIsDisplayingCalendar,
    }, {
      text     : "map view",
      icon     : "map",
      indent   : "indent",
      className: `dark ${this.state.isDisplayingMapView && this.state.isDisplaying === this.TAB.LIST ? "active" : ""} ${this.state.isDisplaying === this.TAB.LIST ? "" : "disabled"}`,
      onClick  : this.toggleIsDisplayingMapView,
    }, {
      text: "EDITOR",
      icon: "edit"
    }, {
      text: "HISTORY",
      icon: "restore"
    }, {
      text: "STATS",
      icon: "show_chart"
    }, {
      text     : "OPTIONS",
      icon     : "settings",
      className: `list-tab dark ${this.state.isDisplaying === this.TAB.OPTIONS ? "active" : ""}`
    }];

    // <Button onClick={() => OneDriveManager.test()}>code</Button>

    return (
        <div className="MainContent">
          <NotificationSystem ref="notificationSystem"
                              style={notificationStyle}/>
          <BulbEditor hidden={!this.state.isShowingBulbEditor}
                      onClose={() => this.setState({isShowingBulbEditor: false})}
                      onEdit={this.handleBulbEditorEdit}
                      onSend={this.handleBulbEditorSend}
          />
          <aside className="sidebar">
            <div className="create-btn">
              <Button className="accent" text="create"
                      onClick={() => {this.setState({isShowingBulbEditor: true})}}>add</Button>
            </div>
            <div className="other-btn">
              {BUTTONS.map(b =>
                  <Button key={b.text}
                          className={`${(this.state.enabledTabs & this.TAB[b.text]) || b.indent ? "" : "disabled" } ${b.className || `dark ${this.state.isDisplaying === this.TAB[b.text] ? "active" : ""}`} ${b.indent || ""}`}
                          text={b.text}
                          onClick={b.onClick || (() => this.handleViewChange(this.TAB[b.text]))}
                  >{b.icon}</Button>
              )}
            </div>
          </aside>
          <main>
            <div
                className={`flex-extend-inner-wrapper inner-main ${this.state.isDisplaying === this.TAB.LIST ? "" : "hidden"}`}>
              <header className="main-header flex-center">
                <SearchBar tagPrediction={R.TAG_PREDICTION_DICTIONARY}
                           onChange={this.handleChangeCriteria}
                />
                <Button className="dark"
                        onClick={this.toPreviousYear.bind(this)}
                        disabled={this.state.isLoadingNextYear}
                        loading={this.state.isLoadingPreviousYear}
                >navigate_before</Button>
                <span className="year">{this.year}</span>
                <Button
                    className="dark"
                    onClick={this.toNextYear.bind(this)}
                    loading={this.state.isLoadingNextYear}
                    disabled={this.year === new Date().getFullYear() || this.state.isLoadingPreviousYear}>
                  navigate_next
                </Button>
              </header>
              <div className="content">
                <div
                    className="flex-extend-inner-wrapper inner-content list-view">
                  <div
                      className={`calendar-view ${this.state.isDisplayingCalendar ? "" : "hidden"}`}
                  >
                    <div className="calendar-padding"></div>
                    <div className="calendar-parent">
                      <div className="flex-extend-inner-wrapper">
                        <Calendar
                            version={this.state.version}
                            contentStyle={this.contentStyle}
                            onBlockClick={this.handleCalendarClick}
                            data={this.state.data}/>
                      </div>
                    </div>
                  </div>
                  <EntryView
                      version={this.state.version}
                      data={this.state.data}
                      imageMap={this.imageMap}
                      contentStyle={this.contentStyle}
                      scrollTop={this.scrollTop}
                      articles={this.articleList}
                      bulbs={this.bulbList}
                      highlightBulbIndex={this.highlightBulbIndex}
                      onArticleClick={this.handleArticleClick}
                      onArticleRemove={this.handleArticleRemove.bind(this)}
                  />
                  <div
                      className={`bulb-map-view ${this.state.isDisplayingMapView ? "" : "hidden"}`}>
                    <BulbMap
                        hidden={!this.state.isDisplayingMapView}
                        data={this.bulbList}
                        contentStyle={this.contentStyle}
                        onBulbClick={this.handleBulbClick}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
                className={`flex-extend-inner-wrapper editor-view ${this.state.isDisplaying === this.TAB.EDITOR ? "" : "hidden"}`}>
              <Editor {...(R.copy(this.articleList[this.state.editArticleIndex]) || {newData: this.bulbEditorContent})}
                  hidden={this.state.isDisplaying !== this.TAB.EDITOR}
                  onPromptCancel={this.handlePromptCancel}
                  imageMap={this.imageMap}
                  version={this.editorVersion}
                  tagPrediction={R.TAG_PREDICTION_DICTIONARY}
                  onChange={this.handleArticleChange.bind(this)}
                  onRefreshQueue={this.handleEditorRefreshQueue.bind(this)}
                  year={this.year}
                  oneDriveManager={OneDriveManager}
              />
            </div>
            <div
                className={`flex-extend-inner-wrapper stats-view ${this.state.isDisplaying === this.TAB.STATS ? "" : "hidden"}`}>
              <Chart
                  hidden={this.state.isDisplaying !== this.TAB.STATS}
                  data={this.state.data}/>
            </div>
            <div
                className={`flex-extend-inner-wrapper options-view ${this.state.isDisplaying === this.TAB.OPTIONS ? "" : "hidden"}`}>
              <Settings hidden={this.state.isDisplaying === this.TAB.OPTIONS}
                        handleMissingImages={this.handleMissingImages}
                        OneDriveManager={OneDriveManager}
              />
            </div>
          </main>
          <LoadingScreen title={this.state.loadingPrompt}
                         progress={this.state.loadingProgress}/>
        </div>
    );
  }
}