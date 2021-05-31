import createHistory from 'history/createBrowserHistory';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { Redirect, Route, Router, Switch, Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

/* function */
import {readCookie, createCookie, eraseCookie, addEvent, getURLquery, scrollBodyTop} from '../components/common/General';

/* action */
import { appInit } from './../actions/appActions';
import * as DialogActions from './../actions/dialogActions';

/* component */
import Signin from '../components/signIn/SignIn';
import Home from '../components/home/home';
import Demo from '../components/demo/Demo';
import Gym from '../components/gym/Gym';
import Profile from '../components/profile/Profile';
import ProfileWizard from '../components/profile/ProfileWizard';

import {DialogBox} from '../components/common/dialogBox/DialogBox';
import './App.scss';

const PrivateRoute = ({ component: Component, user, ...rest }) => (
  <Route exact path={rest.path} render={(e) => (
    user && (rest.path !== 'contract' || user.company === 'ruter') ?
      <Component {...e} {...rest.common} /> : <Redirect to={{ 'pathname': '/signin' }} />
  )} />
);

class App extends Component {
  static defaultProps = {
    'collection': { 'timer': {} }
  }

  constructor(props) {
    super(props);
    this.state = {
      'query'  : getURLquery(),
      'browser': createHistory(),
      'urlInfo': this._getURLinfo(),
      'rootPath': window.location.origin, 
      'menus': [
        {'id': 'home', 'path': '/home', 'name': 'Home'},
        //{'id': 'profile', 'path': '/profile', 'name': 'Profile'},
        {'id': 'demo', 'path': '/demo', 'name': 'Demo' },
        //{'id': 'gym', 'path': '/gym', 'name': 'Gym' }
      ]
    };

    //this.props.actions.appInit();
    this._changeRoute = this._changeRoute.bind(this);
    this._click       = this._click.bind(this);
    this.state.browser.listen(this._changeRoute);
  }

  render() {
    const { browser, query, menus, urlInfo, rootPath, localUrl } = this.state;
    const { appInitialized, dialog} = this.props;

    const common = ['actions','collection','appInitialized'].reduce((prev, key) => {
      prev[key] = this.state[key] || this.props[key];
      return prev;
    }, {});

    return <Router history={browser}>
      <div className="app-wrapper flex">
        <header className="app-header flex-header">
          <div className="app-cnt layout-outer">
            <a href={rootPath} className="logo-holder">
              <h1>KietTran</h1>
            </a>
            <nav id="main-nav" className="navigation" aria-label="hovedmenu" role="navigation">
              <ul className="navigation-list">
                {menus.map( (menu, i) => {
                  return <li key={'menu-'+i} className={'item -'+menu.id + (i === 0 ? ' -first': '') + (i === (menu.length-1) ? ' -last' : '')}>
                    <Link className={'nav-link -'+menu.id + (urlInfo.pattern[menu.path] ? ' -active' : '')} to={menu.path}>
                      <span>{menu.name}</span>
                    </Link>
                  </li>;
                }) }
              </ul>
            </nav>    
          </div>
        </header>
        <main className="app-body flex-body">
          <div className="app-cnt layout-outer">
            <Switch>
              <Route exact path='/home' render={(e) => { return <Home {...e} {...common} /> }} />
              <Route exact path='/demo' render={(e) => { return <Demo {...e} {...common} /> }} />
              <Route exact path='/gym' render={(e) => { return <Gym {...e} {...common} /> }} />
              <Route exact path='/profile' render={(e) => { return <Profile {...e} {...common} /> }} />
              <Route exact path='/profileWizard' render={(e) => { return <ProfileWizard {...e} {...common} /> }} />
              <Route exact path='/signin' render={(e) => { return <Signin {...e} {...common} /> }} />              
              <Route exact path='/' render={(e) => { return <Home {...e} {...common} /> }} />
            </Switch>
          </div>
        </main>
        {dialog && <DialogBox ref="dialogbox" {...dialog} {...common} />}
      </div>
    </Router>
  }

  /****************************************************************************
  ****************************************************************************/
  _changeRoute() {
    scrollBodyTop(0);
    let info = this._getURLinfo();
    this.setState({ 'urlInfo': info, 'expanded': info.id });
  }

  _click( e, key ) {
    if ( e ) { e.preventDefault(); }
  }

  /****************************************************************************
  ****************************************************************************/
  _getURLinfo() {
    let info = { 'root': '', 'pin': '', 'pattern': {} };
    info.splited = (window.location.pathname || '').replace(/^\//, '').split('/');
    for (let i = 0; i < info.splited.length; i++) {
      if (i === 0) { info.root = info.splited[i] || ''; }
      info.pin += '/' + info.splited[i];
      info.pattern[info.pin] = 1;
    }
    return info;
  }
}

App.propTypes = {
  'actions' : PropTypes.shape({}).isRequired
};

App = hot(App);

export default connect((state) => {//(state, props) => {
  return {
    //'environment'   : state.environment,
    //'appInitialized': state.appInitialized,
    'dialog'        : state.dialog
  };
}, (dispatch) => {
  return {
    'actions': {
      'dispatch'   : dispatch,
      'appInit'    : () => dispatch(appInit()),
      ...bindActionCreators(DialogActions, dispatch)
    },
    'dispatch': dispatch
  };
})(App);