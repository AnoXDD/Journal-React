/**
 * Created by Anoxic on 042717.
 * A class for displaying the number cards. The number will animate to change
 * itself when a new value is given
 */

import React, {Component} from "react";
import PropTypes from 'prop-types';

export default class NumberCard extends Component {

  render() {
    return (
        <span className="NumberCard">
          {this.props.value.toString().split("").reverse().map((digit, i) =>
              <span key={`num-card-${i}`}
                    className={`number-card number-card-${digit}`}>0123456789</span>
          )}
        </span>
    );
  }
}

NumberCard.propTypes = {
  value: PropTypes.number.isRequired
};

NumberCard.defaultProps = {
  value: 0
};