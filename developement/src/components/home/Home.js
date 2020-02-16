import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {Speech} from '../common/speech/Speech';
import {Recognition} from '../common/recognition/Recognition';

import './Home.scss';

class Home extends Component {
  static defaultProps = {'mode': {} }

  constructor(props) {
    super(props);
    this.state = {
    };

    this._click  = this._click.bind(this);
  }

  render() {
    return <div className="home-wrapper">
      <h1>Home</h1>
      <ul className="application-list">
        <li className="application-item">
          <Speech {...this.props} />
        </li>
        <li className="application-item">
          <Recognition {...this.props} />
        </li>
        <li className="application-item">
          <div className="message-wrapper -info">Coming soon</div>
        </li>
      </ul>
    </div>
  }

  /****************************************************************************
  ****************************************************************************/
  _click( e, key, data) {
  }
}

Home.propTypes = {
  //'contract' : PropTypes.shape({}).isRequired,
  //'deviation': PropTypes.shape({}).isRequired,
  'actions'  : PropTypes.shape({}).isRequired
};

export default connect((state, props) => {
  return {
    //'deviation': state.deviation
  };
}, null)(Home);