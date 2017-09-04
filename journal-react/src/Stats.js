/**
 * Created by Anoxic on 9/3/2017.
 *
 * The page for displaying nerdy stats regarding the data
 */

import React, {Component} from "react";
import Form from "./lib/Form";
import * as R from "./R";

export default class Stats extends Component {

  version = 0;
  data = {};

  shouldComponentUpdate(nextProps) {
    return !nextProps.hidden || nextProps.version !== this.version;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.version <= this.version) {
      return;
    }

    this.version = nextProps.version;
    this.updateData();
  }

  resetData() {
    this.totalEntries = 0;
    this.totalEntryChar = 0;
    this.averageEntryChar = 0;
    this.minEntryChar = Number.MAX_SAFE_INTEGER;
    this.maxEntryChar = 0;

    this.totalArticles = 0;
    this.totalArticleChar = 0;
    this.averageArticleChar = 0;
    this.minArticleChar = Number.MAX_SAFE_INTEGER;
    this.minArticleCharOn = 0;
    this.minArticleCharTitle = "";
    this.maxArticleChar = 0;
    this.maxArticleCharOn = 0;
    this.maxArticleCharTitle = "";

    this.totalBulbs = 0;
    this.totalBulbChar = 0;
    this.averageBulbChar = 0;
    this.minBulbChar = Number.MAX_SAFE_INTEGER;
    this.minBulbCharOn = 0;
    this.maxBulbChar = 0;
    this.maxBulbCharOn = 0;

    this.totalEntriesWithTime = 0;
    this.totalEntryCharWithTime = 0;
    this.totalTimeSpent = 0;
    this.minTimeSpent = Number.MAX_SAFE_INTEGER;
    this.maxTimeSpent = 0;
    this.averageTimeSpent = 0;
    this.averageCharPerMinute = 0;

    this.totalEntryImages = 0;
    this.totalArticleImages = 0;
    this.averageArticleImages = 0;
    this.maxArticleImages = 0;
    this.totalBulbImages = 0;
    this.averageBulbImages = 0;

    this.totalBulbLocations = 0;

    this.longestEntryStreak = 0;
    this.longestBulbStreak = 0;
    this.longestBulbStreakFrom = 0;
    this.longestBulbStreakTo = 0;
    this.longestArticleStreak = 0;
    this.longestArticleStreakFrom = 0;
    this.longestArticleStreakTo = 0;

    this.mostBulbsInOneDay = 0;
    this.mostBulbsInOneDayOn = 0;
  }

  /**
   * Processes the data from `this.props.data`
   */
  processData() {
    this.processCharData();

    this.processAverageData();

    this.processStreakData();
  }

  processCharData() {
    for (let entry of this.props.data) {
      ++this.totalEntries;

      // Char
      let char = R.count(entry.body);
      this.totalEntryChar += char;
      this.minEntryChar = Math.min(this.minEntryChar, char);
      this.maxEntryChar = Math.max(this.maxEntryChar, char);

      // Time duration
      this.processEntryTimeData(entry, char);

      // Images
      let imageNumber = entry.images ? 0 : entry.images.length;
      this.totalEntryImages += imageNumber;

      if (entry.type === R.TYPE_ARTICLE) {
        ++this.totalArticles;
        this.totalArticleChar += char;
        this.totalArticleImages += imageNumber;

        this.maxArticleImages = Math.max(this.maxArticleImages, imageNumber);

        if (char < this.minArticleChar) {
          this.minArticleChar = char;
          this.minArticleCharOn = entry.time.created;
          this.minArticleCharTitle = entry.title;
        } else if (char > this.maxArticleChar) {
          this.maxArticleChar = char;
          this.maxArticleCharOn = entry.time.created;
          this.maxArticleCharTitle = entry.title;
        }
      } else if (entry.type === R.TYPE_BULB) {
        ++this.totalBulbs;
        this.totalBulbChar += char;
        this.totalBulbImages += imageNumber;

        if (char < this.minBulbChar) {
          this.minBulbChar = char;
          this.minBulbCharOn = entry.time.created;
        } else if (char > this.maxBulbChar) {
          this.maxBulbChar = char;
          this.maxBulbCharOn = entry.time.created;
        }

        if (entry.place) {
          ++this.totalBulbLocations;
        }
      }
    }

    this.totalTimeSpent /= 1000;
  }

  processEntryTimeData(entry, char) {
    if (entry.time.begin && entry.time.end) {
      let duration = entry.time.end - entry.time.begin;
      if (duration > 0) {
        ++this.totalEntriesWithTime;
        this.totalEntryCharWithTime += char;

        this.totalTimeSpent += duration; // in milliseconds
        this.minTimeSpent = Math.min(this.minTimeSpent, duration);
        this.maxTimeSpent = Math.max(this.maxTimeSpent, duration);
      }
    }
  }

  processAverageData() {
    this.averageEntryChar = this.totalEntryChar / this.totalEntries;
    this.averageArticleChar = this.totalArticleChar / this.totalArticles;
    this.averageBulbChar = this.totalBulbChar / this.totalBulbs;
    this.averageTimeSpent = this.totalTimeSpent / this.totalEntriesWithTime;
    this.averageCharPerMinute = this.totalEntryCharWithTime / this.totalTimeSpent * 60000;
    this.averageArticleImages = this.totalArticleImages / this.totalArticles;
    this.averageBulbImages = this.totalBulbImages / this.totalBulbs;
  }

  processStreakData() {
    let bulbs = [[], [], [], [], [], [], [], [], [], [], [], []],
      articles = [[], [], [], [], [], [], [], [], [], [], [], []];

    for (let entry of this.props.data) {
      let time = new Date(entry.time.created),
        month = time.getMonth(),
        day = time.getDate() - 1;

      if (entry.type !== R.TYPE_ARTICLE) {
        articles[month][day] = (articles[month][day] + 1) || 1;
      } else if (entry.type === R.TYPE_BULB) {
        bulbs[month][day] = (bulbs[month][day] + 1) || 1;
      }
    }

    let totalDay = (this.props.year % 4) || ((this.props.year % 100 === 0) && (this.props.year % 400)) ? 365 : 366,
      currentYear = new Date().getFullYear(),
      currentEntryStreak = 0,
      currentArticleStreak = 0,
      currentBulbStreak = 0;

    for (let dayOfYear = 0; dayOfYear < totalDay; ++dayOfYear) {
      let date = new Date(currentYear, 0, dayOfYear),
        month = date.getMonth(),
        day = date.getDate();

      let nextDate = new Date(currentYear, 0, dayOfYear + 1),
        nextMonth = nextDate.getMonth(),
        nextDay = nextDate.getDate();

      if (!bulbs[nextMonth][nextDay]) {
        // Reset current streak
        if (currentBulbStreak > this.longestBulbStreak) {
          this.longestBulbStreak = currentBulbStreak;
          this.longestBulbStreakTo = nextDate.getTime();
        }

        currentBulbStreak = 0;
      } else {
        if (bulbs[nextMonth][nextDay] > this.mostBulbsInOneDay) {
          this.mostBulbsInOneDay = bulb[nextMonth][nextDay];
          this.mostBulbsInOneDayOn = nextDate;
        }

        ++currentBulbStreak;
      }

      if (!articles[nextMonth][nextDay]) {
        // Reset current streak
        if (currentArticleStreak > this.longestArticleStreak) {
          this.longestArticleStreak = currentArticleStreak;
          this.longestArticleStreakTo = nextDate.getTime();
        }

        currentArticleStreak = 0;
      } else {
        ++currentArticleStreak;
      }

      if (currentBulbStreak != 0 && currentArticleStreak != 0) {
        // If both streaks are not reset to 0, that means we still have either
        // going on
        ++currentEntryStreak;
      } else {
        // Reset current streak
        if (currentEntryStreak > this.longestEntryStreak) {
          this.longestEntryStreak = currentEntryStreak;
          this.longestArticleStreakTo = nextDate.getTime();
        }

        currentEntryStreak = 0;
      }
    }

    if (this.longestBulbStreak > 1) {
      this.longestBulbStreakFrom = this.longestBulbStreakTo - this.longestBulbStreak * 86400000;
      ++this.longestBulbStreak;
    } else {
      this.longestBulbStreak = 0;
    }

    if (this.longestArticleStreak > 1) {
      this.longestArticleStreakFrom = this.longestArticleStreakTo - this.longestArticleStreak * 86400000;
      ++this.longestArticleStreak;
    } else {
      this.longestArticleStreak = 0;
    }
  }

  /**
   * Compile the current data to `this.data` to display it
   */
  writeData() {

  }

  /**
   * The master function to update all the data
   */
  updateData() {
    this.resetData();
    this.processData();
    this.writeData();
  }

  render() {
    return (
      <div className="flex-center stats bg-grey">
        <NoScrollArea
          backgroundColor="#eeeced">
          <div className="content flex-center">
            <div className="settings-wrapper">
              <Form className="settings-wrapper" data={this.data}/>
            </div>
          </div>
        </NoScrollArea>
      </div>
    );
  }
}
