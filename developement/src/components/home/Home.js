import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {Speech} from '../common/speech/Speech';
import {Recognition} from '../common/recognition/Recognition';
import {Chart} from '../common/chart/Chart';

import Wizard from '../common/wizard/Wizard';

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
           <Chart data={[
              {'value': 10, 'reverse': true, 'stroke': 30 },
              //{'value': 80, 'step': false},
              //{'value': 80, 'reverse': true, 'strole': 40},
              {'value': 65, 'step': false, 'track': false}
            ]} type="engine" fill={true} concatnation={true}
            xAxis={{'grid': 10, 'text': ['1.jan','2.jan', '3.jan']}}
            yAxis={{'grid': 10, 'separation': 4, 'unit': 'Kr' }}
            legend={[
              {'text': 'top'},
              {'text': 'middle', 'size': '4em', 'dy': '1em', 'color': '#e60000'},
              {'text': 'bottom', 'dy': '3em'},
              {'text': 'En'},
            ]}
          />
        </li>
        <li className="application-item">
          <Speech {...this.props} />
        </li>
        <li className="application-item">
          <Recognition {...this.props} />
        </li>
      </ul>

      {
        /*
          https://www.eika.no/smartspar/?action=settInnPenger&isin=NO0010003999
          - har ikke med query param
          - får ikke sjekke om bruker har eller ikke har installer app
        */
      }

      <div className="test-content">
        <h1>Smartspar - test</h1>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'open-smartspar','smartspar://home');}}>Smartspar</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'open-smartspar','smartspar://home?action=settInnPenger');}}>Smartspar - sett inn penger</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'open-smartspar','smartspar://home?action=settInnPenger&portfolioBaseCode=23180ASK000003');}}>Smartspar - Jørgen - sett inn penger - Martine Aksjesparkonto</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'open-smartspar','smartspar://home?action=settInnPenger&isin=NO0008001880&portfolioBaseCode=23180ASK000003');}}>Smartspar - Jørgen - sett inn penger - Martine Aksjesparkonto - Eika Norden</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'open-smartspar','smartspar://home?action=opprettNyttSparemaal');}}>Smartspar - ny sparemål - bare spare</a>

        <hr/>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-1');}}>Kiet test - 1</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-2');}}>Kiet test - 2 - 4</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-3');}}>Kiet test - 3 - 1</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-4');}}>Kiet test - 4 - 1</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-5');}}>Kiet test - 5 - 1</a>
        <a href="#" role="button" onClick={(e)=>{this._click(e,'kiet-test-6');}}>Kiet test - 6 - 1</a>
       </div>
    </div>
  }

  /****************************************************************************
           <Chart data={[[90,20],[40, 60],[50, 10]]} highest={120} type="bar" fill={true}
            xAxis={{'grid': 10, 'text': ['1.jan','2.jan','3.jan','4.jan']}}
            yAxis={{'grid': 10, 'separation': 4, 'unit': 'Kr' }}
          />
           <Chart data={[20,50,90,40]} highest={120} type="bar" fill={true}
            xAxis={{'grid': 10, 'text': ['1.jan','2.jan','3.jan','4.jan']}}
            yAxis={{'grid': 10, 'separation': 4, 'unit': 'Kr' }}
          />
       <Chart data={40} highest={120} type="progress" fill={true}
            xAxis={{'grid': 10, 'text': ['1.jan','2.jan','3.jan','4.jan']}}
            yAxis={{'grid': 10, 'separation': 4, 'unit': 'Kr' }}
          />
             <Chart data={[{'value':20,'text':'ab'},{'value':50,'text':'abac'},{'value':90,'text':'tran'},{'value':40,'text':'kiret'}]} highest={120} type="pie" fill={true}
            xAxis={{'grid': 10, 'text': ['1.jan','2.jan','3.jan','4.jan']}}
            yAxis={{'grid': 10, 'separation': 4, 'unit': 'Kr' }}
          />
          <Chart data={[[20,50,90,40],[10,80,20,90]]} highest={120} type="line"/>
  ****************************************************************************/
  _click = ( e, key, data) => {
    if ( e && typeof(e.preventDefault) === 'function') {
      e.preventDefault();
    }

    if ( key === 'open-smartspar' ) {
      this.openSmartspar( data );
    } else if ( key === 'kiet-test-1' ) {
      alert( key );
      window.location.replace("https://itunes.apple.com/app/id1450266656");
    } else if ( key === 'kiet-test-2' ) {
      alert( key );
      try {
        //const url = 'smartspar://home';
        const url = 'https://www.eika.no/smartspar';
        const iframe = document.createElement('iframe');
        iframe.src = url;
        //iframe.style.display = 'none';
        document.body.appendChild(iframe);

        alert('done...');
      } catch ( error ) {
        alert('catche....');
      }
    } else if ( key === 'kiet-test-3' ) {
      this.openSmartspar( 'smartspar://home', 1 );      
    } else if ( key === 'kiet-test-4' ) {
      this.openSmartspar( 'smartspar://home', 2 );      
    } else if ( key === 'kiet-test-5' ) {
      this.openSmartspar( 'smartspar://home', 3 );      
    } else if ( key === 'kiet-test-6' ) {
      this.openSmartspar( 'smartspar://home', 4 );      
    } 
  }

  openSmartspar = ( url, test ) => {
    const iOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod');
    const android = navigator.userAgent.match('Android');
    if ( !iOS && !android ) { return; }

    const isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
       navigator.userAgent &&
       navigator.userAgent.indexOf('CriOS') == -1 &&
       navigator.userAgent.indexOf('FxiOS') == -1;

    const appstore = iOS ? ( 
        isSafari ?  
          'https://itunes.apple.com/app/id1450266656' :
          'https://apps.apple.com/no/app/smartspar/id1450266656' 
    ) : 'https://play.google.com/store/apps/details?id=no.eika.smartspar';

    const state = { 'timer': 0, stop: false };
    const blur = () => {
      clearTimeout( state.timer );
      state.stop = true;
    };
    window.removeEventListener('blur', blur)
    window.addEventListener('blur', blur);

    if ( test ) {
      if ( test === 2 ) {
        window.location = url;
        setTimeout( () => {
          window.location.replace(appstore);
        }, 300);
      } else if ( test === 3 ) {
        window.location = url;
        setTimeout( () => {
          window.location.replace(appstore);
        }, 100);
      } else if ( test === 4 ) {
        setTimeout( () => {
          window.location.replace(appstore);
        }, 100);
        window.location = url;
      } else {
        window.location = url;
        window.location.replace(appstore);
      }
    } else {
      state.timer = setTimeout( () => {
        if (state.stop) { return; }
          window.location = appstore;
      }, 300);

      if ( isSafari ) {
        window.location.replace(appstore);
        setTimeout( () => {
          window.location = url;
        }, 1000);
        clearTimeout( state.timer );
      } else {
        window.location = url;
      }
    }
  }

  _openSmartspar = ( test ) => {
    const iOS = navigator.userAgent.match('iPad') || navigator.userAgent.match('iPhone') || navigator.userAgent.match('iPod');
    const android = navigator.userAgent.match('Android');
    if ( !iOS && !android ) { return; }

    const appstore = iOS ? 'https://apps.apple.com/no/app/smartspar/id1450266656' : 
      'https://play.google.com/store/apps/details?id=no.eika.smartspar';

    if ( test === 1 || test === 4 ) {
      const now = new Date().valueOf();
      setTimeout( () => {
          if ( (new Date().valueOf() - now) > 100) { return; }
          window.location = appstore;
      }, 25);
    } else if ( test === 2 || test === 5 ) {
      const time = (new Date()).getTime();
      setTimeout( () => {
        const v = (new Date()).getTime();
        if ( (v - time) > 200 ) { return; }
        window.location = appstore;
      }, 100);
    } else if ( test === 3 || test === 6 ) {
      const state = { 'timer': 0, stop: false };
      const blur = () => {
        clearTimeout( state.timer );
        state.stop = true;
      };
      window.removeEventListener('blur', blur)
      window.addEventListener('blur', blur);

      state.timer = setTimeout( () => {
        if (state.stop) { return; }
        window.location = appstore;
      }, 300);
    }

    //window.location = 'smartspar://home';
    window.location =  test < 4 ?
      'smartspar://home' : 'https://www.eika.no/smartspar/';
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