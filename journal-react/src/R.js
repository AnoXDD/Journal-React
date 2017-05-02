/**
 * Created by Anoxic on 042217.
 * A resource file to hold constant data. The name is inspired by Android
 */

let MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

module.exports = {
  month  : MONTH,
  weekday: WEEKDAY,

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
  //105 + this.ARTICLE_MARGIN;
  ARTICLE_NO_IMAGE_HEIGHT: 135,
  BULB_HEIGHT_ORIGINAL   : 27,
  BULB_MARGIN_TOP        : 5,
  //this.BULB_HEIGHT_ORIGINAL + this.BULB_MARGIN_TOP;
  BULB_HEIGHT            : 32,

  TAG_PREDICTION_DICTIONARY: "journal friendship thoughts code 和和和",
};
