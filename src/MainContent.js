// @flow strict-local

/**
 * Created by Anoxic on 042917.
 * The main frame of the whole thing
 */

import NotificationSystem from "react-notification-system";

import Button from "./lib/Button";

import Editor from './Editor';
import Calendar from "./Calendar";
import EntryView from "./EntryView";
import SearchBar from "./lib/SearchBar";
import BulbMap from "./BulbMap";
import Chart from "./Chart";
import BulbEditor from "./BulbEditor";
import LoadingScreen from "./LoadingScreen";
import Settings from "./Settings";
import Stats from "./Stats";

import OneDriveManager from "./OneDriveManager";

import R from "./R";

import * as React from "react";

// import TestData from "./TestData";

const CryptoJS = require("crypto-js");

const BULB_WEB_URL_PATTERN = /(.+)@(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(.*)/,
  BULB_LOCATION_PATTERN = /(.+)#\[(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)\](.*)/,
  BULB_LOCATION_PATTERN_WITH_NAME = /(.+)#\[(.+),(-?[0-9]+\.[0-9]+),(-?[0-9]+\.[0-9]+)\](.*)/;

function upgradeDataFromVersion2To3(oldData): Data {
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
      entry.tags = d.tags ? d.tags.split("|") : [];

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
      hex: '#5ea400',
    },
    error: {
      rgb: '236, 61, 61',
      hex: '#ec3d3d',
    },
    warning: {
      rgb: '235, 173, 23',
      hex: '#ebad1a',
    },
    info: {
      rgb: '54, 156, 199',
      hex: '#369cc7',
    },
  },
  notificationBoxShadow = "3px 2px 9px #333",
  notificationStyle = {
    Title: {
      DefaultStyle: {
        fontSize: '15px',
        margin: '0 0 5px 0',
        padding: 0,
        fontWeight: 'bold',
      },

      success: {
        color: defaultColors.success.hex,
      },

      error: {
        color: defaultColors.error.hex,
      },

      warning: {
        color: defaultColors.warning.hex,
      },

      info: {
        color: "#448AFF",
      },

    },

    NotificationItem: {
      DefaultStyle: {
        position: 'relative',
        width: '230px',
        cursor: 'pointer',
        fontSize: 'inherit',
        margin: '10px 0 0',
        padding: '20px 30px',
        display: 'block',
        WebkitBoxSizing: 'border-box',
        MozBoxSizing: 'border-box',
        boxSizing: 'border-box',
        opacity: 0,
        transition: '.4s ease',
        willChange: 'transform, opacity',

        isHidden: {
          opacity: 0,
        },

        isVisible: {
          opacity: 1,
        },
      },

      success: {
        borderTop: "none",
        backgroundColor: '#009688',
        color: 'black',
        boxShadow: notificationBoxShadow,
      },

      error: {
        borderTop: "none",
        backgroundColor: '#FF8A80',
        color: 'black',
        boxShadow: notificationBoxShadow,
      },

      warning: {
        borderTop: "none",
        backgroundColor: '#FFFF8D',
        color: "black",
        boxShadow: notificationBoxShadow,
      },

      info: {
        borderTop: "none",
        backgroundColor: 'white',
        color: 'black',
        boxShadow: notificationBoxShadow,
      },
    },
  };

const DEFAULT_SETTINGS = {
  bulbMapCenter: {
    latitude: 0,
    longitude: 0,
  },
  bulbAttachLocation: false,
  // passcode: undefined,
};

const TAB = {
  calendar: 0,
  "map view": 0,
  NO_CHANGE: 0,
  LIST: 1 << 1,
  EDITOR: 1 << 2,
  HISTORY: 1 << 3,
  INSIGHT: 1 << 4,
  STATS: 1 << 5,
  OPTIONS: 1 << 6,
};

const DEFAULT_IMAGE_MAP: ImageMap = {};

type Props = {||};

type State = {|
  bulbMapCenter?: GeoCoordinate,
  data: Data,
  editArticleIndex: number,
  enabledTabs: number,
  isDisplaying: $Values<typeof TAB>,
  isDisplayingCalendar: boolean,
  isDisplayingMapView: boolean,
  isLoadingNextYear: boolean,
  isLoadingPreviousYear: boolean,
  isShowingBulbEditor: boolean,
  loadingProgress: number,
  loadingPrompt: string,
  loadingPromptRequiringPassword: boolean,
  mapVersion: number,
  settings: SettingsType,
  settingsVersion: number,
  version: number,
|};

export default class MainContent extends React.Component<Props, State> {

  SEARCH_BAR_TAGS = ["tags", "months", "attachments"];
  /* The interval between each backup should occur, in miliseconds */
  BACKUP_INTERVAL = 3600000;

  state: State = {
    data: [],
    version: 0,

    isDisplaying: TAB.LIST,
    isDisplayingCalendar: false,
    isDisplayingMapView: true,

    // Use | to connect them later
    enabledTabs: TAB.LIST |
      TAB.STATS |
      TAB.OPTIONS |
      TAB.INSIGHT,

    editArticleIndex: -1,

    loadingProgress: 0,
    loadingPrompt: "Signing in ...",
    loadingPromptRequiringPassword: false,
    isLoadingPreviousYear: false,
    isLoadingNextYear: false,

    isShowingBulbEditor: false,

    mapVersion: 0,
    settingsVersion: 0,
    settings: R.copy(DEFAULT_SETTINGS),
  };

  data: Data = [];
  imageMap: ImageMap = DEFAULT_IMAGE_MAP;

  year: number = new Date().getFullYear();

  notificationSystem: ?NotificationSystem = null;

  /**
   * Stores the original positions and times of articles and bulbs
   * @type {{}}
   */
  contentStyle: ContentStyle = {
    height: 0,
  };
  articleList: Array<ArticleEntry> = [];
  bulbList: Array<BulbEntry> = [];
  highlightBulbIndex: number = -1;

  editorVersion: number = 0;
  editedEntryTimestamp: number = 0;
  bulbEditorContent: string = "";

  unprocessedBulbs: number = 0;

  /* Press escape anywhere to return to this tab */
  escapeToReturn: $Values<typeof TAB> = TAB.NO_CHANGE;

  lastBackup: number = 0;

  mapBound: ?MapBound = null;

  password: string = "";
  /* This function is to be called in the loading menu to process the password given by the user. */
  redeemPassword = () => {
  };

  tagPrediction: Array<string> = [];

  scrollTop: number = 0;

  constructor(props: Props) {
    super(props);

    /**
     * `this.data` stores all the data that can be displayed, while
     * `this.state.data` stores the data that are actually displayed
     */
    this.data = [...this.state.data];

    this.updateContentStyle(this.state.data);
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    this.updateContentStyle(nextState.data);

    // Update `editArticleIndex`
    if (this.editedEntryTimestamp) {
      let editArticleIndex = this.articleList.findIndex(
        article => article.time.created === this.editedEntryTimestamp);
      nextState.editArticleIndex = editArticleIndex;

      this.editedEntryTimestamp = 0;
    }
  }

  componentWillMount(): void {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidMount(): void {
    this.notificationSystem = this.refs.notificationSystem;

    this.loadData();
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  loadData = (): Promise<void> => {
    // Fetch data from server
    return OneDriveManager.verifyFileStructure(
      this.year,
      val => this.setState({loadingProgress: val}),
    )
      .then(() => {
        this.setState({
          loadingProgress: 0,
          loadingPrompt: "Downloading content ...",
        });

        return OneDriveManager.getData(this.year);
      })
      .then(content => {
        // Now, we try to decrypt it
        return new Promise(res => {
          if (this.handleNewContent(content)) {
            res();
          }

          // Set the way to use the password
          this.redeemPassword = (password: string) => {
            this.password = password;

            if (this.handleNewContent(content)) {
              // Matches!
              res();
            } else {
              this.setState({
                loadingPrompt: "Password does not work",
              });
            }
          };

          // Prompt the user for a password
          this.setState({
            loadingPrompt: "",
            loadingPromptRequiringPassword: true,
          });

        });
      })
      .then(() => {
        // The data was successfully decrypted (or is not encrypted)
        this.setState({
          loadingPromptRequiringPassword: false,
          loadingPrompt: "Merging bulbs ...",
        });

        return OneDriveManager.getBulbs(
          val => this.setState({loadingProgress: val}))
          .then(bulbs => this.handleNewRawBulbs(bulbs));
      })
      .catch(err => {
        this.setState({
          loadingPrompt: "Looks like there is an error fetching you data. If this is your first time using Trak, please make sure you can access your OneDrive, and then refresh the website and try again.",
        });
        console.error(err.stack);

        throw new Error(JSON.stringify(err));
      })
      .then(() => {
        this.setState({
          loadingProgress: 0,
          loadingPrompt: "Downloading images ...",
        });

        return OneDriveManager.getImages(this.year);
      })
      .then(images => {
        this.handleNewImageMap(images);

        this.setState({
          loadingPrompt: "",
          version: new Date().getTime(),
        });
      });
  };

  // region Utility functions

  /**
   *
   * @param data
   * @param keyword
   * @returns {Array|*} - an array of mixed strings and JSX
   */
  highlightDataWithKeyword(data: string, keyword: string) {
    // For each string, break them into different groups
    let group = data.split(keyword),
      realGroup = [];

    // Then insert a highlighted version of keyword between each element
    for (let g of group) {
      realGroup.push(g);
      realGroup.push({highlight: keyword});
    }

    realGroup.pop();

    return realGroup;
  }

  /**
   * Converts the data (or this.state.data) to the form that to be stored online
   * @param data
   */
  convertDataToString(data: Data) {
    return JSON.stringify({
      version: R.DATA_VERSION,
      data: this.encryptData(data),
      settings: this.state.settings,
    });
  }

  generateBackupFileName(): string {
    return `data_${new Date().getTime()}.js`;
  }

  extractWebsiteFromContent(bulb: OneDriveRawBulbItem): OneDriveRawBulbItem {
    var result = BULB_WEB_URL_PATTERN.exec(bulb.content);
    if (result) {
      bulb.links = [{url: result[2]}];

      // Remove the website
      bulb.content = result[1] + result[result.length - 1];
    }

    return bulb;
  }

  extractLocationFromContent(bulb: OneDriveRawBulbItem): OneDriveRawBulbItem {
    // Location, without name
    var data = bulb.content;
    var result = BULB_LOCATION_PATTERN.exec(data);

    if (result) {
      bulb.place = {
        title: result[2] + "," + result[3],
        latitude: parseFloat(result[2]),
        longitude: parseFloat(result[3]),
      };

      // Remove the location
      bulb.content = result[1] + result[result.length - 1];
    } else {
      // Location, with name
      result = BULB_LOCATION_PATTERN_WITH_NAME.exec(data);
      if (result) {
        bulb.place = {
          title: result[2],
          latitude: parseFloat(result[3]),
          longitude: parseFloat(result[4]),
        };

        // Remove the location
        bulb.content = result[1] + result[result.length - 1];
      }
    }

    return bulb;
  }

  extractRawContent(bulb: OneDriveRawBulbItem): OneDriveRawBulbItem {
    return this.extractLocationFromContent(this.extractWebsiteFromContent(bulb));
  }

  /**
   * Converts the name of the bulb to the seconds from epoch
   * @param myStr - e.g. 050711_080523
   * @returns {number}
   */
  convertBulbTime(myStr: string): number {
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
  handleNewRawBulb(
    bulbContent: string,
    image?: {|
      +id: string,
      +name: string
    |},
  ): Promise<void> {
    this.unprocessedBulbs = 1;

    let bulb: OneDriveRawBulbItem = {
      time: {created: new Date().getTime()},
      content: bulbContent,
      name: "",
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
  handleNewRawBulbs(bulbObject: Array<OneDriveRawBulbItem>): Promise<void> {
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
        for (let entry of this.data) {
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
        if (bulb.imageId != null) {
          OneDriveManager.addImageById(bulb.imageId, this.year)
            .then(image => {
              uploadedImages.push({
                id: image.id,
                name: image.name,
              });
              onBulbFinish();
            }, () => {
              onBulbFinish();
            });
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
  handleNewProcessedBulbs(
    bulbObjects: Array<OneDriveRawBulbItem>,
    uploadedImages: Array<{|
      +id: string,
      +name: string
    |}>,
  ): Promise<void> {
    let processedBulbs: Array<BulbEntry> = [],
      processedBulbIds = [];

    for (let bulb of bulbObjects) {
      // First see if this bulb has been merged already
      if (bulb.merged === true) {
        processedBulbIds.push(bulb.id);
        if (bulb.imageId != null) {
          processedBulbIds.push(bulb.imageId);
        }

        continue;
      }

      const bulbEntry: BulbEntry = {
        body: bulb.content,
        type: R.TYPE_BULB,
        time: bulb.time,
      };

      if (bulb.place) {
        bulbEntry.place = bulb.place;
      }

      if (bulb.links) {
        bulbEntry.links = bulb.links;
      }

      // Add image to the bulb if applicable
      if (bulb.imageId != null) {
        let image = uploadedImages.find(
          image => image.id === bulb.imageId);

        if (image) {
          // Uploaded successfully!
          bulbEntry.images = [image.name];
        } else {
          continue;
        }
      }

      if (bulb.id != null) {
        processedBulbIds.push(bulb.id);
      }

      processedBulbs.push(bulbEntry);
    }

    if (processedBulbs.length) {
      return this.uploadUnprocessedData([...this.data, ...processedBulbs])
        .then(() => {
            if (processedBulbIds.length) {
              return OneDriveManager.removeItemsById(processedBulbIds);
            }
          },
        );
    }

    return OneDriveManager.removeItemsById(processedBulbIds);
  };

  handleNewImageMap(images: Array<OneDriveImageItem>): void {
    this.imageMap = DEFAULT_IMAGE_MAP;
    for (let image of images) {
      this.imageMap[image.name] = {
        id: image.id,
        thumbnail: image.thumbnails,
      };
    }

    this.removeInvalidImageNames(this.data);
  }

  /**
   * Handles new content fetched directly from server, given an optional
   * password
   * @param raw
   * @return boolean - true if handle is successful, false otherwise (e.g.
   *     wrong password)
   */
  handleNewContent(raw: string): boolean {
    // raw = '2' + JSON.stringify(TestData.data);
    if (raw) {

      let settings = R.copy(DEFAULT_SETTINGS);

      if (raw[0] === '[') {
        this.data = upgradeDataFromVersion2To3(JSON.parse(raw));
      } else if (raw[0] === '2') {
        this.data = upgradeDataFromVersion2To3(JSON.parse(raw.substr(1)));
      } else if (raw[0] === '3') {
        // todo remove this branch when released - this line is for debug only
        this.data = JSON.parse(raw.substr(1));
      } else {
        let parsedData = JSON.parse(raw);

        if (typeof parsedData.data === "string") {
          this.data = this.decryptData(parsedData.data);
        } else {
          this.data = parsedData.data;
        }

        if (this.data === null) {
          // Decrypting fails
          return false;
        }

        settings = Object.assign(
          settings,
          parsedData.settings,
          {password: this.password},
        );
      }

      this.applySettings(settings);

      this.updateTagPrediction(this.data);

      this.setState({
        data: this.data,
      });
    } else {
      this.data = [];

      this.setState({
        data: [],
      });
    }

    return true;
  }

  handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.handleViewChange(this.escapeToReturn);
    }

    this.escapeToReturn = TAB.NO_CHANGE;
  };

  handleCalendarClick = (top: ?number): void => {
    if (top == null) {
      return;
    }

    this.scrollTop = top;

    this.setState({
      version: new Date().getTime(),
    });
  };

  handleChangeCriteria = (c: SearchCriteria): void => {
    let data = this.data;
    if (!c.clear && this.state.isDisplayingMapView && this.mapBound) {
      let {west, east, north, south} = this.mapBound;

      data = data.filter(entry => {
        if (entry.place) {
          let {latitude, longitude} = entry.place;

          return latitude >= south && latitude <= north &&
            (
              west < east ? (
                  longitude >= west && longitude <= east
                ) :
                (
                  longitude >= west || longitude <= east
                )
            );
        }

        return false;
      });
    }

    if (c.clear ||
      (
        c.simple && !c.keywords.length
      )) {
      // Empty
      this.setState({
        data: data,
        version: new Date().getTime(),
      });
    } else {
      let newData = data.filter(d => {
        // First, type
        if (!c.simple &&
          (
            (
              !c.hasArticle && d.type === R.TYPE_ARTICLE
            ) ||
            (
              !c.hasBulb && d.type === R.TYPE_BULB
            )
          )) {
          return false;
        }

        // Second, keywords
        if (c.keywords && c.keywords.length && c.keywords.findIndex(k => {
          return (
              (
                d.title || ""
              ).indexOf(k) !== -1
            ) ||
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
          if (!(
            c.tags.some(t => (
              d.tags || []
            ).includes(t) !== -1)
          )) {
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
      });

      // Highlight the keyword
      if (c.keywords && c.keywords.length) {
        newData = newData.map(d => R.copy(d)).map(d => {
          for (let keyword of c.keywords) {
            if (d.title) {
              d.title = this.highlightDataWithKeyword(d.title, keyword);
            }

            d.body = this.highlightDataWithKeyword(d.body, keyword);
          }

          return d;
        });
      }

      this.setState({
        data: newData,
        version: new Date().getTime(),
      });
    }
  };

  handleViewChange(newView: $Values<typeof TAB>): void {
    if (newView && newView !== TAB.NO_CHANGE) {
      this.setState({
        isDisplaying: newView,
      });
    }
  }

  handlePromptCancel = (): void => {
    // Set to zero to tell the editor that that data is not the latest
    this.editorVersion = 0;
    this.handleViewChange(TAB.LIST);
  };

  handleCreateArticle() {
    this.editorVersion = new Date().getTime();
    this.setState({
      editArticleIndex: -1,
      enabledTabs: this.state.enabledTabs | TAB.EDITOR,
      isShowingBulbEditor: false,
    }, this.handleViewChange(TAB.EDITOR));
  }

  handleArticleClick = (i: number) => {
    this.editorVersion = new Date().getTime();
    this.escapeToReturn = TAB.LIST;
    this.setState({
      editArticleIndex: i,
      enabledTabs: this.state.enabledTabs | TAB.EDITOR,
    }, this.handleViewChange(TAB.EDITOR));
  };

  handleBulbClick = (top: number, index: number): void => {
    this.highlightBulbIndex = index;
    this.handleCalendarClick(top);
  };

  handleBulbEditorSend = (
    bulbContent: string,
    imageId?: {|
      +id: string,
      +name: string
    |},
  ): Promise<void> => {
    return this.handleNewRawBulb(bulbContent, imageId)
      .then(() => {
        this.setState({
          isShowingBulbEditor: false,
        });
      })
      .catch(err => {
        console.error(err.stack);

        R.notifyError(
          this.notificationSystem,
          "There is an error when publishing the bulb. Try again",
        );
      });
  };

  handleBulbEditorEdit = (bulbContent: string): void => {
    this.bulbEditorContent = bulbContent;
    this.handleCreateArticle();
  };

  handleArticleChange = (newEntry: ArticleEntry): Promise<void> => {
    this.editedEntryTimestamp = newEntry.time.created;

    if (this.articleList[this.state.editArticleIndex]) {
      let index = this.findDataIndexByArticleIndex(this.state.editArticleIndex),
        dataCopy = [...this.data];

      if (index !== -1) {
        dataCopy[index] = newEntry;
        return this.uploadUnprocessedData(dataCopy);
      } else {
        // Technically this shouldn't happen
        R.notifyError(
          this.notificationSystem,
          "Unable to upload the data. Try exit the editor and upload again",
        );
        return new Promise((res, rej) => rej());
      }
    }

    // Adding a new entry
    return this.uploadUnprocessedData([...this.data, newEntry]);
  };

  /**
   * Prompts the user and ask them if they really want it removed
   * @param articleIndex
   */
  handleArticleRemove = (articleIndex: number): Promise<void> => {
    let index = this.findDataIndexByArticleIndex(articleIndex);

    return this.handleDataRemoveByIndex(index);
  };

  handleBulbRemove = (bulbIndex: number): Promise<void> => {
    let index = this.findDataIndexByBulbIndex(bulbIndex);

    return this.handleDataRemoveByIndex(index);
  };

  handleBulbLocationClick = (place: GeoCoordinate): void => {
    this.setState({
      bulbMapCenter: place,
      mapVersion: new Date().getTime(),
      isDisplayingMapView: true,
    });
  };

  handleBoundChange = (bound: MapBound): void => {
    this.mapBound = bound;
  };

  handleDataRemoveByIndex(index: number): Promise<void> {
    let dataCopy = [...this.data];

    if (index !== -1) {
      dataCopy.splice(index, 1);

      return this.backupAndUploadData(dataCopy);
    } else {
      // Technically this shouldn't happen
      R.notifyError(
        this.notificationSystem,
        "Unable to upload the data: illegal index. Try refreshing the website",
      );
      return new Promise((res, rej) => rej());
    }
  }

  handleEditorRefreshQueue = (): Promise<Array<OneDriveImageItem>> => {
    return OneDriveManager.getImages(this.year)
      .then(imageMap => {
        this.handleNewImageMap(imageMap);
        this.forceUpdate();

        return OneDriveManager.getImagesInQueue();
      })
      .catch(err => {
        console.error(err.stack);
        R.notifyError(
          this.notificationSystem,
          "There was an error when fetching the queue. Try again",
        );
      });
  };

  /**
   * Finds all the images in the resource folder that doesn't belong to any
   * bulbs and articles and move them to `queue`
   */
  handleMissingImages = (): Promise<void> => {
    // First, make a list of all the images
    let images = [];

    for (let entry of this.data) {
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
                R.notify(
                  this.notificationSystem,
                  `Fixed ${missingImages.length} missing images`,
                );
                res();
              }
            };

          for (let image of missingImages) {
            OneDriveManager.removeImageById(image.id)
              .then(() => onFinished());
          }
        });
      });

  };

  handleSettingsSave = (settings: SettingsType): Promise<void> => {
    return new Promise(res => {
      this.password = settings.password || "";
      this.setState({
        settings: R.copy(settings),
      }, () => {
        this.backupAndUploadData()
          .then(() => {
            res();
          });
      });

      // R.notify(this.notificationSystem, "Saved");
    });
  };

  /**
   * Applies the settings from somewhere, assuming that `settings` has every
   * field of settings
   * @param settings
   */
  applySettings(settings: SettingsType): void {
    let state = {};

    // Bulb map center
    state.mapVersion = new Date().getTime();
    state.settingsVersion = new Date().getTime();
    state.settings = settings;

    this.setState(R.copy(state));
  }

  /**
   * Encrypts the data with `this.password` if applicable
   * @param data
   * @returns {string} - the JSON representation of the data, or the encrypted
   *     data
   */
  encryptData(data: Data): string {
    if (this.password) {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.password,
      ).toString();
    }

    return JSON.stringify(data);
  }

  /**
   * Decrypts the data with `this.password` if it is not null or empty. If
   * `this.password` is not set up, it will simply convert it from string to
   * JSON object
   * @param encrypted {string} - the encrypted string
   * @returns {object} - the decrypted object if the password is correct.
   *     `null` if the password is invalid
   */
  decryptData(encrypted: string): ?Data {
    // Try to convert to JSON
    try {
      let decrypted = encrypted;
      if (this.password) {
        let bytes = CryptoJS.AES.decrypt(encrypted, this.password);
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
      }

      var o = JSON.parse(decrypted);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the
      // type-checking, but... JSON.parse(null) returns null, and typeof null
      // === "object",  so we must check for that, too. Thankfully, null is
      // falsey, so this suffices:
      if (Array.isArray(o)) {
        return o;
      }
    } catch (e) {
    }

    return null;
  }

  /**
   * Tring to upload an unprocessed data, which means the data will be
   * processed and then uploaded
   * @param data
   */
  uploadUnprocessedData(data: Data): Promise<void> {
    return this.backupAndUploadData(
      data.sort((lhs, rhs) => rhs.time.created - lhs.time.created),
    );
  }

  /**
   * Backs up and uploads the data, assuming that the data is sorted
   * @param data
   */
  backupAndUploadData(data?: Data = this.data): Promise<void> {
    let dataString = this.convertDataToString(data);

    return this.backupData(dataString)
      .then(() => this.uploadData(dataString))
      .then(() => OneDriveManager.getImages(this.year))
      .then(images => {
        this.handleNewImageMap(images);
        this.handleNewContent(dataString);

        this.setState({
          data: data,
          version: new Date().getTime(),
        });
      });
  }

  /**
   * Uploads the data to server
   * @param dataString - the EXACT string data to be uploaded
   */
  uploadData(dataString: string): Promise<void> {
    return OneDriveManager.upload(this.year, dataString)
      .then(() => {
        R.notify(this.notificationSystem, "Uploaded");
      }, err => {
        console.error(err.stack);

        R.notifyError(
          this.notificationSystem,
          "Unable to upload the data. Try again!",
        );
      });
  }

  /**
   * Backs up current data
   * @param currentDataString - the EXACT string data to be uploaded
   */
  backupData(currentDataString: string): Promise<void> {
    if (new Date().getTime() - this.lastBackup >= this.BACKUP_INTERVAL) {
      return OneDriveManager.getLatestBackupData(this.year)
        .then(backupData => {
          if (backupData === null || backupData !== currentDataString) {
            return OneDriveManager.backupJournalByYear(
              this.year,
              this.generateBackupFileName(),
            );
          }
        })
        .then(() => {
          // Either the backup is needed or not, update lastBackup time
          this.lastBackup = new Date().getTime();
        });
    }

    return new Promise(res => {
      res();
    });
  }

  toggleIsDisplayingCalendar = (): void => {
    this.setState({
      isDisplayingCalendar: !this.state.isDisplayingCalendar,
    });
  };

  toggleIsDisplayingMapView = (): void => {
    this.setState({
      isDisplayingMapView: !this.state.isDisplayingMapView,
    });
  };

  /**
   * To make the querying easier, the program breaks the data into a list of
   * articles and a list of bulbs. But to do data manipulation, the real index
   * of data is needed. This functions converts the article index into the data
   * index.
   * @param articleIndex
   */
  findDataIndexByArticleIndex(articleIndex: number): number {
    let timestamp = this.articleList[articleIndex].time.created;

    return this.data.findIndex(
      entry => (
        entry.type === R.TYPE_ARTICLE && entry.time.created === timestamp
      ),
    );
  }

  /**
   * To make the querying easier, the program breaks the data into a list of
   * articles and a list of bulbs. But to do data manipulation, the real index
   * of data is needed. This functions converts the bulb index into the data
   * index.
   * @param articleIndex
   */
  findDataIndexByBulbIndex(bulbIndex: number): number {
    let timestamp = this.bulbList[bulbIndex].time.created;

    return this.data.findIndex(
      entry => (
        entry.type === R.TYPE_BULB && entry.time.created === timestamp
      ),
    );
  }

  /**
   * Removes the photos that are not indexed by imageMap
   * @param data
   */
  removeInvalidImageNames(data: Data): void {
    for (let d of data) {
      if (d.images && d.images.filter) {
        d.images = d.images.filter(image => this.imageMap[image]);
      }
    }
  }

  sanitizeBulbContent(content: BulbEntry): void {
    const {place} = content;
    if (place != null) {
      content.place = {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
      };
    }
  }

  /**
   * Give the prediction based on the tags we have so far
   * @param data
   */
  updateTagPrediction(data: Data): void {
    // this.tagPrediction = "";
    let map = {};

    // Propogate pre-defined
    for (let tag of R.TAG_PREDICTION_DICTIONARY) {
      map[tag] = 1;
    }

    // User content
    for (let content of data) {
      if (content.tags) {
        for (let tag of content.tags) {
          map[tag] = ++map[tag] || 1;
        }
      }
    }

    this.tagPrediction = Object.keys(map)
      .sort((a, b) => map[b] - map[a]);
  }

  /**
   * Return the correct state based on this.props
   */
  updateContentStyle(data: Data): void {
    this.contentStyle = {
      height: 0,
    };
    this.bulbList = [];
    this.articleList = [];

    let articleHeight = 0,
      bulbHeight = 0;

    for (let content of data) {
      if (content.type === "bulb") {
        // Bulb
        this.sanitizeBulbContent(content);
        this.bulbList.push(content);

        // Calculate the height
        let top = Math.max(
          articleHeight - R.BULB_HEIGHT_ORIGINAL,
          bulbHeight,
        );
        this.contentStyle[String(content.time.created)] = top;

        bulbHeight = top + R.BULB_HEIGHT;
      } else if (content.type === "article") {
        // Article
        this.articleList.push(content);

        let currentHeight = content.images ? R.ARTICLE_IMAGE_HEIGHT : R.ARTICLE_NO_IMAGE_HEIGHT,
          top = Math.max(
            bulbHeight -
            (
              currentHeight - R.ARTICLE_MARGIN
            ),
            articleHeight,
          );
        this.contentStyle[String(content.time.created)] = top;

        articleHeight = top + currentHeight;
      }
    }

    this.contentStyle.height = Math.max(articleHeight, bulbHeight);
  }

  toPreviousYear = (): void => {
    this.setState({
      isLoadingPreviousYear: true,
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
          R.notify(
            this.notificationSystem,
            "You've reached the earliest days of your journal",
          );
        }
      });
  };

  toNextYear = (): void => {
    this.setState({
      isLoadingNextYear: true,
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
  };

  render() {
    const BUTTONS = [
      {
        text: "LIST",
        icon: "list",
        className: `list-tab dark ${this.state.isDisplaying ===
        TAB.LIST ? "active" : ""}`,
      }, {
        text: "calendar",
        icon: "date_range",
        indent: "indent",
        className: `dark ${this.state.isDisplayingCalendar &&
        this.state.isDisplaying ===
        TAB.LIST ? "active" : ""} ${this.state.isDisplaying ===
        TAB.LIST ? "" : "disabled"}`,
        onClick: this.toggleIsDisplayingCalendar,
      }, {
        text: "map view",
        icon: "map",
        indent: "indent",
        className: `dark ${this.state.isDisplayingMapView &&
        this.state.isDisplaying ===
        TAB.LIST ? "active" : ""} ${this.state.isDisplaying ===
        TAB.LIST ? "" : "disabled"}`,
        onClick: this.toggleIsDisplayingMapView,
      }, {
        text: "EDITOR",
        icon: "edit",
        // }, {
        //   text: "HISTORY",
        //   icon: "restore"
      }, {
        text: "INSIGHT",
        icon: "lightbulb_outline",
      }, {
        text: "STATS",
        icon: "show_chart",
      }, {
        text: "OPTIONS",
        icon: "settings",
        className: `list-tab dark ${this.state.isDisplaying ===
        TAB.OPTIONS ? "active" : ""}`,
      },
    ];

    // <Button onClick={() => OneDriveManager.test()}>code</Button>

    return (
      <div className="MainContent">
        <NotificationSystem ref="notificationSystem"
                            style={notificationStyle}/>
        <BulbEditor
          notificationSystem={this.notificationSystem}
          bulbAttachLocation={this.state.settings.bulbAttachLocation}
          hidden={!this.state.isShowingBulbEditor}
          onClose={() => this.setState({isShowingBulbEditor: false})}
          onEdit={this.handleBulbEditorEdit}
          onSend={this.handleBulbEditorSend}
        />
        <aside className="sidebar">
          <div className="create-btn">
            <Button className="accent" text="create"
                    onClick={() => {
                      this.setState({isShowingBulbEditor: true});
                    }}>add</Button>
          </div>
          <div className="other-btn">
            {BUTTONS.map(b =>
              <Button key={b.text}
                      className={`${(
                        this.state.enabledTabs & TAB[b.text]
                      ) || b.indent ? "" : "disabled"} ${b.className !=
                      null ? b.className :
                        `dark ${this.state.isDisplaying ===
                        TAB[b.text] ? "active" : ""}`} ${b.indent || ""}`}
                      text={b.text}
                      onClick={b.onClick ||
                      (
                        () => this.handleViewChange(
                          TAB[b.text])
                      )}
              >{b.icon}</Button>,
            )}
          </div>
        </aside>
        <main>
          <div
            className={`flex-extend-inner-wrapper inner-main ${this.state.isDisplaying ===
            TAB.LIST ? "" : "hidden"}`}>
            <header className="main-header flex-center">
              <SearchBar tagPrediction={this.tagPrediction}
                         onChange={this.handleChangeCriteria}
                         mapBound={this.mapBound}
                         isBoundSearch={this.state.isDisplayingMapView}
              />
              <Button className="dark"
                      tooltip="Re-download data"
                      loading={this.state.loadingPrompt}
                      onClick={this.loadData}>
                refresh
              </Button>
              <Button className="dark"
                      onClick={this.toPreviousYear}
                      disabled={this.state.isLoadingNextYear}
                      loading={this.state.isLoadingPreviousYear}
              >navigate_before</Button>
              <span className="year">{this.year}</span>
              <Button
                className="dark"
                onClick={this.toNextYear}
                loading={this.state.isLoadingNextYear}
                disabled={this.year ===
                new Date().getFullYear() ||
                this.state.isLoadingPreviousYear}>
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
                        contentStyle={this.contentStyle}
                        data={this.state.data}
                        onBlockClick={this.handleCalendarClick}
                        version={this.state.version}
                        year={this.year}
                      />
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
                  onArticleRemove={this.handleArticleRemove}
                  onBulbRemove={this.handleBulbRemove}
                  onLocationClick={this.handleBulbLocationClick}
                />
                <div
                  className={`bulb-map-view ${this.state.isDisplayingMapView ? "" : "hidden"}`}>
                  <BulbMap
                    hidden={!this.state.isDisplayingMapView}
                    data={this.bulbList}
                    contentStyle={this.contentStyle}
                    onBulbClick={this.handleBulbClick}
                    center={this.state.bulbMapCenter ||
                    this.state.settings.bulbMapCenter}
                    version={this.state.mapVersion}
                    onBoundChange={this.handleBoundChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`flex-extend-inner-wrapper editor-view ${this.state.isDisplaying ===
            TAB.EDITOR ? "" : "hidden"}`}>
            <Editor {...(
              R.copy(this.articleList[this.state.editArticleIndex]) ||
              {newData: this.bulbEditorContent}
            )}
                    hidden={this.state.isDisplaying !== TAB.EDITOR}
                    imageMap={this.imageMap}
                    newData={this.state.editArticleIndex ===
                    -1 ? this.bulbEditorContent : undefined}
                    onChange={this.handleArticleChange}
                    oneDriveManager={OneDriveManager}
                    onPromptCancel={this.handlePromptCancel}
                    onRefreshQueue={this.handleEditorRefreshQueue}
                    tagPrediction={this.tagPrediction}
                    version={this.editorVersion}
                    year={this.year}
            />
          </div>
          <div
            className={`flex-extend-inner-wrapper insight-view ${this.state.isDisplaying ===
            TAB.INSIGHT ? "" : "hidden"}`}>
            <Stats
              hidden={this.state.isDisplaying !== TAB.INSIGHT}
              data={this.state.data}
              version={this.state.version}
              year={this.year}
            />
          </div>
          <div
            className={`flex-extend-inner-wrapper stats-view ${this.state.isDisplaying ===
            TAB.STATS ? "" : "hidden"}`}>
            <Chart
              hidden={this.state.isDisplaying !== TAB.STATS}
              data={this.state.data}
              version={this.state.version}
            />
          </div>
          <div
            className={`flex-extend-inner-wrapper options-view ${this.state.isDisplaying ===
            TAB.OPTIONS ? "" : "hidden"}`}>
            <Settings hidden={this.state.isDisplaying !== TAB.OPTIONS}
                      notificationSystem={this.notificationSystem}
                      handleMissingImages={this.handleMissingImages}
                      data={this.state.settings || DEFAULT_SETTINGS}
                      onSave={this.handleSettingsSave}
                      version={this.state.settingsVersion}
            />
          </div>
        </main>
        <LoadingScreen title={this.state.loadingPrompt}
                       requirePassword={this.state.loadingPromptRequiringPassword}
                       handlePassword={this.redeemPassword}
                       progress={this.state.loadingProgress}/>
      </div>
    );
  }
}