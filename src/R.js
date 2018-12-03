/**
 * Created by Anoxic on 042217.
 * A resource file to hold constant data. The name is inspired by Android
 */

import React from "react";

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const prependZero = num => (
  "0" + num
).slice(-2);

module.exports = {
  month: MONTH,
  weekday: WEEKDAY,
  MONTH: MONTH,
  WEEKDAY: WEEKDAY,

  PROP_PHOTO: "images",
  PROP_MUSIC: "music",
  PROP_MOVIE: "movie",
  PROP_LINK: "links",
  PROP_OTHER: "others",

  TYPE_ARTICLE: "article",
  TYPE_BULB: "bulb",

  ARTICLE_MARGIN_LEFT: 30,
  ARTICLE_MARGIN: 30,
  //300 + this.ARTICLE_MARGIN;
  ARTICLE_IMAGE_HEIGHT: 330,
  //300 + this.ARTICLE_MARGIN;
  ARTICLE_NO_IMAGE_HEIGHT: 330,
  BULB_HEIGHT_ORIGINAL: 33,
  BULB_MARGIN_TOP: 1,
  //this.BULB_HEIGHT_ORIGINAL + this.BULB_MARGIN_TOP;
  BULB_HEIGHT: 34,

  TAG_PREDICTION_DICTIONARY: "journal thoughts ingress minecraft dream code letter handwriting wechat friendship snooker skateboard relationship star food leisure info baby fun travel health outfit shopping pets work sports cook makeup home car clear overcast raining snowing thundering windy happy notbad surprised sad angry".split(
    " "),

  DATA_VERSION: 3,

  // Utility functions to add notifications
  copy: obj => obj ? JSON.parse(JSON.stringify(obj)) : obj,

  /**
   * Counts the length of the character (for asian characters)
   * @param str
   */
  count: str => (
    str.match(/[\u00ff-\uffff]|\S+/g) || []
  ).length,

  /**
   * Prepends zero in front of a digit number to make it two digits
   * @param num
   */
  prependZero: num => prependZero(num),

  /**
   * Converts the timestamp to a human readable time
   * @param date {Number}
   */
  dateToString: date => {
    let d = new Date(date);
    return `${MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${prependZero(
      d.getHours())}:${prependZero(d.getMinutes())}`;
  },

  filterNulls<T>(arr: Array<?T>): Array<T> {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] != null) {
        result.push(arr[i]);
      }
    }
    return result;
  },

  /**
   * Converts a number of milliseconds in form of 342h 32' 43'' 213
   * @param ms
   */
  millisecondsToReadable: ms => {
    ms = parseInt(ms, 10);

    let milli = ms % 1000;
    ms = parseInt(ms / 1000, 10);
    let s = ms % 60;
    ms = parseInt(ms / 60, 10);
    let m = ms % 60;
    let h = parseInt(ms / 60, 10);

    s = Math.max(0, s);
    m = Math.max(0, m);
    h = Math.max(0, h);

    return `${h}h ${prependZero(m)}' ${prependZero(s)}'' ${milli}`;
  },

  numToPercentage: num => `${num * 100}%`,

  highlightArrayToJSX: body =>
    body.map ? body.map((d, i) =>
      typeof d === "string" ? d :
        <span key={i} className="highlight">{d.highlight}</span>,
    ) : body,

  highlightArrayToString: body =>
    typeof body === "string" ? body : body.map(b =>
      typeof b === "string" ? b : b.highlight,
    ).join(""),

  notify: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title: title || null,
      level: "info",
      message: message,
      position: "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifyError: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title: title || null,
      level: "error",
      message: message,
      position: "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifyWarning: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title: title || null,
      level: "warning",
      message: message,
      position: "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
  notifySuccess: (notificationSystem, message, title, autoDismiss) => {
    return notificationSystem.addNotification({
      title: title || null,
      level: "success",
      message: message,
      position: "bl",
      autoDismiss: autoDismiss || 5,
    });
  },
}
;
