import React from 'react';
import './Chart.scss';

const ChartGraph = ({data}) => {
  let graph = null;

  console.log( data );

  if ( data.type === 'bar' ) {
    graph = <rect id={data.id} x={data.x} y={data.y} fill={data.color} width={data.width} height={0}>
      <animate attributeName="height" from="0" to={data.height} dur={data.duration} fill="freeze" />
    </rect>;
  } else if ( data.type === 'pie' ) {
    graph = <path id={data.id} style={data.style} d={data.path}>
      <animate attributeName="stroke-dashoffset" dur={data.duration} from={data.dash} to={data.dash*2} fill="freeze"/>
    </path>
  }

  return graph;
};

/******************************************************************************
******************************************************************************/
export class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'id': 'chart-' + new Date().getTime() + '-' + Math.floor(Math.random() * 10000 + 1),
      ...this._initState( props )
    };
    this._click = this._click.bind(this);
  }

  render() {    
    const {id, viewBox, axis, graph, transform} = this.state;

    // <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox={viewBox} version="1.1"> 
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} version="1.1" style={{'backgroundColor':'#fff'}}>
      <g id="container" transform={transform}>
        { (axis.x.list.length > 0 || axis.y.list.length > 0) && <g id="axis-wrapper">
            {axis.x.list.map( (data, i) => (
              <path key={'axis-x-'+i} id={data.id} d={data.path} style={data.style}/>
            ) )}
            {axis.y.list.map( (data, i) => (
              <path key={'axis-y-'+i} id={data.id} d={data.path} style={data.style}/>
            ) )}
          </g>
        }

        { graph.list.length > 0 && <g id="graph-wrapper">
            { graph.list.map( (data,i) => (
                <ChartGraph key={'graph-'+i} data={data}/>
            )) }
          </g>
        }
      </g>
    </svg>
  }

  /****************************************************************************
  ****************************************************************************/
  _click( e, key, data ) {
    if ( e ) { e.preventDefault(); }
  }

  /****************************************************************************
  ****************************************************************************/
  _initState( props ) {
    let state = {
      'duration' : 500, 
      'view'     : [1040,1040],
      'padding'  : 20,
      'barSpace' : 20,
      'pieRadius': 300,
      'axis'     : {},
      'data'     : props.data    || [],
      'type'     : props.type    || 'pie',
      'max'      : props.max     || 0,
      'highest'  : props.highest || 0,
      'sum'      : props.sum     || 0,
      'transform': '',
      'color'    : {
        'default'   : '#999',
        'background': '#fff',  
        'list': [
          '#1cc99d', // green
          '#52b7f2', // blue
          '#f35072', // red
          '#f0c55c', // yellow
          '#8675f4', // purple
          '#d8903b', // orange
          '#e9a3bf', // pink
        ]
      }
    };

    state.axis.x = {'max': (state.view[0] - (state.padding*2))};
    state.axis.y = {'max': (state.view[1] - (state.padding*2))};

    state.axis.x.list = this._initAxisList('x', state, 10, true);
    state.axis.y.list = this._initAxisList('y', state, 10);

    state.viewBox = [0,0,state.view[0],state.view[1]].join(' ');

    state.graph = this._initGraph( state );
    if ( state.type === 'bar' ) {
      state.transform = 'translate(30) rotate(180 '+(state.view[0]/2)+' '+(state.view[1]/2)+')';
    }

    //console.log('=== LIST ==='); console.log( state.graph ); console.log( state.axis );
    return state;
  }

  _initGraph( state ) {
    let info = {'list': [], 'pin': {}, 'sum': 0, 'highest': 0, 'color': 0};
    if ( ! state || ! (state.data instanceof Array) ) { return info; }

    if ( typeof(state.highest) === 'number' ) { info.highest = state.highest; }

    state.data.forEach( (d,i) => {
      let data = typeof(d) === 'number' ? {'value': d} : (
        typeof(d.value) === 'number' ? d : null
      );
      if ( ! data  ) { return; }

      let cloned = {...data, 'id': 'graph-' + new Date().getTime() + '-' + i};
      info.sum += cloned.value;
      info.highest =  info.highest < cloned.value ? cloned.value : info.highest;
      info.pin[cloned.id] = cloned;
      info.list.push( cloned );    
    });

    if ( typeof(state.sum) === 'number' && state.sum > info.sum) {
      info.sum = state.sum;
    }

    if ( state.type === 'pie' ) {
      this._initGraphPieInfo( state, info );
    } else if ( state.type === 'bar' ) {
      this._initGraphBarInfo( state, info );
    }
    return info;
  }

  _initGraphPieInfo( state, info ) {
    let polarToCartesian = (centerX, centerY, radius, angleInDegrees) =>{
      let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
      return {
        'x': centerX + (radius * Math.cos(angleInRadians)),
        'y': centerY + (radius * Math.sin(angleInRadians))
      };
    };

    let getPath = (x, y, radius, startAngle, endAngle) =>{
      let start = polarToCartesian(x, y, radius, endAngle);
      let end   = polarToCartesian(x, y, radius, startAngle);
      let arcSweep = endAngle - startAngle <= 180 ? '0' : '1';
      return [
        'M', start.x, start.y, 
        'A', radius, radius, 0, arcSweep, 0, end.x, end.y
      ].join(' ');
    };

    let getDash = (radius, stroke, percent) => {
      let normalized = radius - (stroke * 2);
      let delta = normalized * 2 * Math.PI;
      return delta;
    };

    let sumDegree = 0;
    info.list.forEach( (data) => {
      data.duration = (state.duration / 1000)+'s';
      data.stroke   = 80;
      data.type     = 'pie';
      data.percent  = data.value / info.sum;
      data.degree   = 360 * data.percent;
      data.radius   = state.pieRadius || 100;
      data.cx       = (state.axis.x.max / 2) + state.padding;
      data.cy       = (state.axis.y.max / 2) + state.padding;
      data.path     = getPath(data.cx, data.cy, data.radius, sumDegree, (data.degree + sumDegree));
      data.dash     = getDash( data.radius, data.stroke, data.percent );
      data.style    = {
        'fill'       : 'none',
        'stroke'     : data.color || state.color.list[info.color++],
        'strokeWidth': data.stroke,
        'strokeDasharray' : data.dash,
      };
      sumDegree += data.degree;
    });

    /*
    let cloned = JSON.parse(JSON.stringify(info.list[0]));
    cloned.degree  = 360;
    cloned.percent = 1;
    cloned.path    = getPath(cloned.cx, cloned.cy, cloned.radius, 0, 359.9); 
    cloned.style.stroke = state.color.default;
    info.list.unshift( cloned );
    */
  };

  _initGraphBarInfo( state, info ){
    info.width  = state.axis.x.max / info.list.length;
    info.list.forEach( (data, i) => {
      data.type     = 'bar';
      data.percent  = data.value / info.highest;
      data.width    = info.width - (state.barSpace * 2);
      data.height   = state.axis.y.max * data.percent;
      data.x        = state.axis.x.max - (info.width * i) - state.barSpace - data.width + state.padding;
      data.y        = state.padding || 0;
      data.duration = (state.duration / 1000)+'s';

      if ( data.color ) { return; }
      data.color = state.color.list[info.color++]; 
    });
  }

  _initAxisList(axis, state, count, includeLast) {
    let list = [];
    if (! state || ! state.axis || ! state.axis[axis] ) { return list; }
    if (! count || isNaN(count)                       ) { return list; }

    let padding = state.padding, max = state.axis[axis].max;
    let path    = '', delta = 0, gap = parseInt((max / count));
    let length  = count + (includeLast ? 1 : 0);

    for ( let i=0; i<length; i++ ) {
      if ( axis === 'x' ) {
        delta = (gap*i) + padding;
        path  = 'M '+padding+','+delta+' '+ (max+padding)+','+delta;
      } else {
        delta = (max + padding) - (gap*i);
        path = 'M '+delta+','+padding+' '+ delta+','+(max+padding);
      }

      list.push({
        'id'   : 'axis-'+axis+'-'+i,
        'path' : path,
        'style': {
          'stroke'      : '#444',
          'strokeWidth': '2',
          'fill'        : 'none',
          'opacity'     : i ? '.2' : '1'
        }
      });
    }
    return list;
  }
}