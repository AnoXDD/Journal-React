// @flow strict-local

/**
 * Created by Anoxic on 9/3/2017.
 *
 * The page for displaying nerdy stats regarding the data
 */

import Form from "./lib/Form";
import NoScrollArea from "./lib/NoScrollArea";

import * as R from "./R";
import * as FormConstants from "./lib/FormConstants";

import * as React from "react";

type Props = {|
  +data: Data,
  +hidden: boolean,
  +version: number,
  +year: number,
|}

export default class Stats extends React.Component<Props> {

  version: number = 0;
  data: Array<{|
    +title: string,
    +rows: Array<{|
      +title: string,
      +content: Array<{|
        +title: string,
        +elements: [
          {|
            +type: $Values<FormConstants>,
            props: string | number,
          |}
          ]
      |}>
    |}>
  |}> = [];

  totalEntries: number = 0;
  totalEntryChar: number = 0;
  averageEntryChar: number = 0;
  minEntryChar: number = Number.MAX_SAFE_INTEGER;
  maxEntryChar: number = 0;

  totalArticles: number = 0;
  totalArticleChar: number = 0;
  averageArticleChar: number = 0;
  minArticleChar: number = Number.MAX_SAFE_INTEGER;
  minArticleCharOn: number = 0;
  minArticleCharTitle: string = "";
  maxArticleChar: number = 0;
  maxArticleCharOn: number = 0;
  maxArticleCharTitle: string = "";

  totalBulbs: number = 0;
  totalBulbChar: number = 0;
  averageBulbChar: number = 0;
  minBulbChar: number = Number.MAX_SAFE_INTEGER;
  minBulbCharOn: number = 0;
  maxBulbChar: number = 0;
  maxBulbCharOn: number = 0;

  totalEntriesWithTime: number = 0;
  totalEntryCharWithTime: number = 0;
  totalTimeSpent: number = 0;
  minTimeSpent: number = Number.MAX_SAFE_INTEGER;
  maxTimeSpent: number = 0;
  averageTimeSpent: number = 0;
  averageCharPerMinute: number = 0;

  totalEntryImages: number = 0;
  totalArticleImages: number = 0;
  averageArticleImages: number = 0;
  maxArticleImages: number = 0;
  totalBulbImages: number = 0;
  averageBulbImages: number = 0;

  totalBulbLocations: number = 0;
  averageBulbLocations: number = 0;

  longestEntryStreak: number = 0;
  longestBulbStreak: number = 0;
  longestBulbStreakFrom: number = 0;
  longestBulbStreakTo: number = 0;
  longestArticleStreak: number = 0;
  longestArticleStreakFrom: number = 0;
  longestArticleStreakTo: number = 0;

  mostBulbsInOneDay: number = 0;
  mostBulbsInOneDayOn: number = 0;

  shouldComponentUpdate(nextProps: Props): boolean {
    return !nextProps.hidden || nextProps.version !== this.version;
  }

  componentWillUpdate(nextProps: Props): void {
    if (nextProps.version <= this.version) {
      return;
    }

    this.version = nextProps.version;
    this.updateData();
  }

  resetData(): void {
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
    this.averageBulbLocations = 0;

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
  processData(): void {
    this.processCharData();
    this.processAverageData();
    this.processStreakData();
  }

  processCharData(): void {
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
      let imageNumber = entry.images ? entry.images.length : 0;
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
  }

  processEntryTimeData(
    entry: ArticleEntry | BulbEntry,
    char: number,
  ): void {
    if (entry.time.begin != null && entry.time.end != null) {
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

  processAverageData(): void {
    this.averageEntryChar = this.totalEntries ? this.totalEntryChar /
      this.totalEntries : 0;
    this.averageArticleChar = this.totalArticles ? this.totalArticleChar /
      this.totalArticles : 0;
    this.averageBulbChar = this.totalBulbs ? this.totalBulbChar /
      this.totalBulbs : 0;
    this.averageTimeSpent = this.totalEntriesWithTime ? this.totalTimeSpent /
      this.totalEntriesWithTime : 0;
    this.averageCharPerMinute = this.totalTimeSpent ? this.totalEntryCharWithTime /
      this.totalTimeSpent *
      60000 : 0;
    this.averageArticleImages = this.totalArticles ? this.totalArticleImages /
      this.totalArticles : 0;
    this.averageBulbImages = this.totalBulbs ? this.totalBulbImages /
      this.totalBulbs : 0;
    this.averageBulbLocations = this.totalBulbs ? this.totalBulbLocations /
      this.totalBulbs : 0;
  }

  processStreakData(): void {
    let bulbs = [[], [], [], [], [], [], [], [], [], [], [], []],
      articles = [[], [], [], [], [], [], [], [], [], [], [], []];

    for (let entry of this.props.data) {
      let time = new Date(entry.time.created),
        month = time.getMonth(),
        day = time.getDate() - 1;

      if (entry.type !== R.TYPE_ARTICLE) {
        articles[month][day] = (
          articles[month][day] + 1
        ) || 1;
      } else if (entry.type === R.TYPE_BULB) {
        bulbs[month][day] = (
          bulbs[month][day] + 1
        ) || 1;
      }
    }

    let totalDay = (
        this.props.year % 4
      ) ||
      (
        (
          this.props.year % 100 === 0
        ) &&
        (
          this.props.year % 400
        )
      ) ? 365 : 366,
      currentYear = new Date().getFullYear(),
      currentEntryStreak = 0,
      currentArticleStreak = 0,
      currentBulbStreak = 0;

    for (let dayOfYear = 1; dayOfYear <= totalDay; ++dayOfYear) {
      let date = new Date(currentYear, 0, dayOfYear),
        month = date.getMonth(),
        day = date.getDate();

      if (!bulbs[month][day]) {
        // Reset current streak
        if (currentBulbStreak > this.longestBulbStreak) {
          this.longestBulbStreak = currentBulbStreak;
          this.longestBulbStreakTo = date.getTime();
        }

        currentBulbStreak = 0;
      } else {
        if (bulbs[month][day] > this.mostBulbsInOneDay) {
          this.mostBulbsInOneDay = bulbs[month][day];
          this.mostBulbsInOneDayOn = date;
        }

        ++currentBulbStreak;
      }

      if (!articles[month][day]) {
        // Reset current streak
        if (currentArticleStreak > this.longestArticleStreak) {
          this.longestArticleStreak = currentArticleStreak;
          this.longestArticleStreakTo = date.getTime();
        }

        currentArticleStreak = 0;
      } else {
        ++currentArticleStreak;
      }

      if (currentBulbStreak && currentArticleStreak) {
        // If both streaks are not reset to 0, that means we still have either
        // going on
        ++currentEntryStreak;
      } else {
        // Reset current streak
        if (currentEntryStreak > this.longestEntryStreak) {
          this.longestEntryStreak = currentEntryStreak;
          this.longestArticleStreakTo = date.getTime();
        }

        currentEntryStreak = 0;
      }
    }

    if (this.longestBulbStreak > 1) {
      this.longestBulbStreakFrom = this.longestBulbStreakTo -
        this.longestBulbStreak *
        86400000;
      ++this.longestBulbStreak;
    } else {
      this.longestBulbStreak = 0;
    }

    if (this.longestArticleStreak > 1) {
      this.longestArticleStreakFrom = this.longestArticleStreakTo -
        this.longestArticleStreak *
        86400000;
      ++this.longestArticleStreak;
    } else {
      this.longestArticleStreak = 0;
    }
  }

  /**
   * Compile the current data to `this.data` to display it
   */
  writeData(): void {
    this.data = [];

    let template = this.generateFormTemplate();
    for (const form of template) {
      if (form == null) {
        continue;
      }

      let formData = {
          title: form[0],
          rows: [],
        },
        rowsData = [];

      for (let row of form[1]) {
        if (row == null) {
          continue;
        }

        let rowData = {
            title: row[0],
            content: [],
          },
          contentData = [];

        for (let content of row[1]) {
          if (content == null) {
            continue;
          }

          contentData.push({
            title: content[0],
            elements: [
              {
                type: FormConstants.PLAIN_TEXT,
                props: content[1],
              },
            ],
          });
        }

        rowData.content = contentData;
        rowsData.push(rowData);
      }

      formData.rows = rowsData;
      this.data.push(formData);
    }
  }

  generateFormTemplate(): Array<[string, Array<[string, Array<[string, string | number]>]>]> {
    return [
      [
        "Summary",
        [
          [
            "All",
            [
              ["Total", this.totalEntries],
              ["Total characters", this.totalEntryChar],
              ["Average character per entry", this.averageEntryChar.toFixed(3)],
              ["Lowest character", this.minEntryChar],
              ["Highest character", this.maxEntryChar],
            ],
          ],
          [
            "Articles",
            [
              ["Total", this.totalArticles],
              ["Total characters", this.totalArticleChar],
              [
                "Average character per article",
                this.averageArticleChar.toFixed(
                  3),
              ],
              ["Lowest character ", this.minArticleChar],
              ["... which happened on", R.dateToString(this.minArticleCharOn)],
              ["... whose title is", this.minArticleCharTitle],
              ["Highest character", this.maxArticleChar],
              ["... which happened on", R.dateToString(this.maxArticleCharOn)],
              ["... whose title is", this.maxArticleCharTitle],
            ],
          ],
          [
            "Bulbs",
            [
              ["Total", this.totalBulbs],
              ["Total characters", this.totalBulbChar],
              ["Average character per bulb", this.averageBulbChar.toFixed(3)],
              ["Lowest character", this.minBulbChar],
              ["... which happened on", R.dateToString(this.minBulbCharOn)],
              ["Highest character", this.maxBulbChar],
              ["... which happened on", R.dateToString(this.maxBulbCharOn)],
            ],
          ],
        ],
      ],
      [
        "Devotion",
        [
          [
            "Time spent",
            [
              [
                "Total time spent",
                R.millisecondsToReadable(this.totalTimeSpent),
              ],
              [
                "Average time spent",
                R.millisecondsToReadable(this.averageTimeSpent),
              ],
              [
                "Shortest time spent",
                R.millisecondsToReadable(this.minTimeSpent),
              ],
              [
                "Longest time spent",
                R.millisecondsToReadable(this.maxTimeSpent),
              ],
              [
                "Average character per minute",
                R.millisecondsToReadable(this.averageCharPerMinute),
              ],
            ],
          ],
        ],
      ],
      [
        "Attachments",
        [
          [
            "Images",
            [
              ["Total images", this.totalEntryImages],
              ["Total article images", this.totalArticleImages],
              ["Average article images", this.averageArticleImages.toFixed(3)],
              ["Most article images", this.maxArticleImages],
              ["Total bulb images", this.totalBulbImages],
              [
                "Bulb image percent",
                R.numToPercentage(this.averageBulbImages.toFixed(3)),
              ],
            ],
          ],
          [
            "Location",
            [
              ["Total bulb locations", this.totalBulbLocations],
              [
                "Bulb location percent",
                R.numToPercentage(this.averageBulbLocations.toFixed(3)),
              ],
            ],
          ],
        ],
      ],
      [
        "Engagement",
        R.filterNulls([
          [
            "Streak",
            R.filterNulls([
              ["Longest streak", Stats.appendDays(this.longestEntryStreak)],
              [
                "Longest article streak",
                Stats.appendDays(this.longestArticleStreak),
              ],
              this.longestArticleStreak ?
                [
                  "Longest article streak from",
                  R.dateToString(this.longestArticleStreakFrom),
                ] : null,
              this.longestArticleStreak ?
                [
                  "Longest article streak to",
                  R.dateToString(this.longestArticleStreakTo),
                ] : null,
              ["Longest bulb streak", Stats.appendDays(this.longestBulbStreak)],
              this.longestBulbStreak ?
                [
                  "Longest bulb streak from",
                  R.dateToString(this.longestBulbStreakFrom),
                ] : null,
              this.longestBulbStreak ?
                [
                  "Longest bulb streak to",
                  R.dateToString(this.longestBulbStreakTo),
                ] : null,
            ]),
          ],
          this.mostBulbsInOneDay ?
            [
              "Bulb",
              [
                ["Most bulbs in a day", this.mostBulbsInOneDay],
                ["Most bulbs on", R.dateToString(this.mostBulbsInOneDayOn)],
              ],
            ] : null,
        ]),
      ],
    ];
  }

  /**
   * Append "days" or "day" to the end of the number
   */
  static appendDays(number: number): string {
    if (!number) {
      return "-";
    }

    return number === 1 ? `${number} day` : `${number} days`;
  }

  /**
   * The master function to update all the data
   */
  updateData(): void {
    this.resetData();
    this.processData();
    this.writeData();
  }

  render(): React.Node {
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
