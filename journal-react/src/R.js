/**
 * Created by Anoxic on 042217.
 * A resource file to hold constant data. The name is inspired by Android
 */

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

module.exports = {
  month  : MONTH,
  weekday: WEEKDAY,
  MONTH  : MONTH,
  WEEKDAY: WEEKDAY,

  PROP_PHOTO: "images",
  PROP_MUSIC: "music",
  PROP_MOVIE: "movie",
  PROP_LINK : "links",
  PROP_OTHER: "others",

  TYPE_ARTICLE: "article",
  TYPE_BULB   : "bulb",

  ARTICLE_MARGIN_LEFT    : 30,
  ARTICLE_MARGIN         : 30,
  //300 + this.ARTICLE_MARGIN;
  ARTICLE_IMAGE_HEIGHT   : 330,
  //300 + this.ARTICLE_MARGIN;
  ARTICLE_NO_IMAGE_HEIGHT: 330,
  BULB_HEIGHT_ORIGINAL   : 33,
  BULB_MARGIN_TOP        : 1,
  //this.BULB_HEIGHT_ORIGINAL + this.BULB_MARGIN_TOP;
  BULB_HEIGHT            : 34,

  TAG_PREDICTION_DICTIONARY: "journal friendship thoughts code 和和和",

  DATA_VERSION: 3,

  // Utility functions to add notifications
  copy: obj => obj ? JSON.parse(JSON.stringify(obj)) : obj,

  notify       : (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title      : title || null,
      level      : "info",
      message    : message,
      position   : "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifyError  : (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title      : title || null,
      level      : "error",
      message    : message,
      position   : "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifyWarning: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title      : title || null,
      level      : "warning",
      message    : message,
      position   : "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifySuccess: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title      : title || null,
      level      : "success",
      message    : message,
      position   : "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
}
;
