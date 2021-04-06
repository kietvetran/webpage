/******************************************************************************
=== GLOBAL ATTRIBUTE ===
******************************************************************************/
try { CONFIG; } catch( error ){ CONFIG = {};   }
try { HOMEGALLERY; } catch( error ){ HOMEGALLERY = null;   }
try { MENUGALLERY; } catch( error ){ MENUGALLERY = null;   }
try { TAKEAWAY; } catch( error ){ ALACARTE = [];   }
try { INFORMATION; } catch( error ){ INFORMATION = [];   }

var ATTR = {
  'timeout'  : 0,
  'interval' : 0,
  'now'      : new Date()
};

/******************************************************************************
=== MAIN GLOBAL FUCNTION ===
******************************************************************************/
function startup() {
  initHomeGallary();
  initHome();
  initMenu( TAKEAWAY, 'take-away');

  ATTR.tab   = $('.tab-btn.-main');
  ATTR.panel = $('.tab-panel.-main');
  ATTR.tabMenu = $('.tab-btn.-menu');
  ATTR.panelMenu = $('.tab-panel.-menu');
  ATTR.body = $('body');

  $( document ).on('click', clickHandler);
  $( window ).on('hashchange', hashChangeHandler);
  $( window ).on('scroll', scroll);

  hashChangeHandler();
}

function initHomeGallary() {
  var homeGallery = $('#home-gallary');
  if ( homeGallery.length ) {
    if ( HOMEGALLERY ) {
      homeGallery.Carousel( HOMEGALLERY );
    } else {
      homeGallery.remove();
      $('body').addClass('no-home-gallery');
    }
  }  
}

function initHome() {
  var list = [];
  for ( var i=0; i<INFORMATION.length; i++ ) {
    var data = INFORMATION[i], id = "information-pin"+ i;
    list.push(
      '<div class="information">' +
        '<h2 aria-describedby="'+id+'">' + data.title +'</h2>'+
        '<div id="'+id+'" class="description">' + data.description +'</div>'+
      '</div>'
    );
  }

  if ( list.length ) {
    $('#information-holder').html(
      '<ul class="information-list"><li>'+list.join('</li><li>') + '</li>'
    );
  }
}

function initMenu( menu, name ) {
  var list = [], index = 0, i = 0;
  for ( i=0; i<menu.length; i++ ) {
    var data = menu[i];
    if ( data.category ) {
      list[index++] = { 'name': data.category, 'content': [] };
    } else if ( list[index-1] ) {
      list[index-1].content.push( _createFoodMenu(data) );
    }
  }

  var output = [], category = [];
  for ( i=0; i<list.length; i++ ) { 
    var id = 'm-'+name+'-'+list[i].name.substring(0,3) + i; 
    var type = '-menu' + (i ? '' : ' -show') +  ' -'+name;
    category.push( 
      '<a href="#'+id+'" role="tab" id="tab-menu-'+id+'" aria-selected="false" aria-controls="panel-menu'+id+'" class="tab-btn '+type+'">'+
        list[i].name +
      '</a>'
    );
    output.push(
      '<div id="panel-menu-'+id+'" aria-hidden="false" aria-labelledby="tab-menu-'+id+'" class="tab-panel '+type+'">'+
        list[i].content.join('') +
      '</div>'
    );
  }

  $('#'+name+'-headline').html( 
    '<ul class="tablist" role="tablist">'+
      '<li role="presentation">'+
        category.join('</li><li role="presentation">')+
      '</li>'+
    '</ul>'
  );
  $('#'+name+'-content').html( output.join('') );
}

/******************************************************************************
=== EVENT FUCNTION ===
******************************************************************************/
/**
* The function 
* @return {Void}
*/
function scroll( e ) {
  clearTimeout( ATTR.timeout );
  ATTR.timeout = setTimeout( function() {
    var position = getScrollPosition();
    position[1] > 20 ? ATTR.body.addClass('scrolled-passed') : 
      ATTR.body.removeClass('scrolled-passed');
  }, 100 );
}
/**
* The function 
* @return {Void}
*/
function hashChangeHandler( e ) {
  var opt = getURLoption();
  changeTab( opt.tab || 'home' );
  changeMenu( opt.menu || 'a-la-carte' );
}

/**
 * @param e {Window.Event}
 * @return {Void}
 */
function clickHandler( e ) {
  var target = $(e.target), parent = target.parent(), order = [
    {'type':'class', 'what':'menu-image',        'handler':clickOnMenuImage     },
    {'type':'class', 'what':'tab-btn',           'handler':clickOnTabBtn        },
    {'type':'class', 'what':'gallery-image',     'handler':clickOnGalleryImage  },
    {'type':'class', 'what':'close-modal',       'handler':clickOnCloseModal    },
    {'type':'class', 'what':'scroll-to-top-btn', 'handler':scrollToTop          },
    {'type':'id',    'what':'btnLogo',           'handler':clickOnBtnLogo       }
  ]; 

  var i = 0, loop = order.length, current = null; 
  for ( i; i < loop; i++ ) {
    if ( order[i].type === 'class' ) {
      if ( target.hasClass(order[i].what) ) {
        current = target;
      } else if ( parent.hasClass(order[i].what) ) {
        current = parent;
      }
    } else if ( order[i].type === 'id' ) {
      if ( target.is(order[i].what) ) {
        current = target;
      } else if ( parent.is(order[i].what) ) {
        current = parent;
      }
    }

    if ( current ) {
      e.preventDefault();
      order[i].handler({'e':e, 'current': current});
      i = loop;
    }
  }
}

function clickOnMenuImage (data) {
  var parent = data.current.parent();
  showModal( '<div class="food -modal-view">'+parent.html()+'</div>');
}

function clickOnBtnLogo( data ) {  
}

function scrollToTop( data ) {
  $('html, body').animate({ scrollTop: 0 }, 200);
}

function clickOnCloseModal( data ) {
  hideModal();
}

function clickOnTabBtn( data ) {
  var href = data.current.attr('href');
  if ( ! href ) { return; }

  if ( data.current.hasClass('-menu-headline') ) {
    var parent = data.current.hasClass('-cloned') ? 
      $('#setmenu-head-link').parent() : data.current.parent();
    href = parent.find('.tablist .tab-btn').eq(0).attr('href');
    if ( href ) {
      updateLocationHash({'menu': href.replace( /\#/g, '' )});
    } 
  } else if ( data.current.hasClass('-menu') ) {
    updateLocationHash({'menu': href.replace( /\#/g, '' )});
  } else {
    updateLocationHash({'tab': href.replace( /\#/g, '' )});
  }
}

function clickOnGalleryImage( data ) {
  showModal( '<div class="image-cnt">'+data.current.html()+'</div>' );
}

function changeTab( name ) {
  if ( ! name ) { return; }

  ATTR.tab.removeClass('-show').each( function(i,d) {
    $(d).attr('aria-selected', 'false');
  });
  ATTR.panel.removeClass('-show').each( function(i,d) {
    $(d).attr('aria-hidden', 'true');
  });

  ATTR.tab.filter('#tab-'+name).addClass('-show').attr('aria-selected', 'true');
  ATTR.panel.filter('#panel-'+name).addClass('-show').attr('aria-hidden', 'false');

  if ( name === 'menu' && ! ATTR.tabMenu.filter('.-show').length ) {
    ATTR.tabMenu.eq(0).click();
  } else {
    $( window ).resize();
  }
}

function changeMenu( name ) {
  if ( ! name ) { return; }

  ATTR.tabMenu.removeClass('-show').each( function(i,d) {
    $(d).attr('aria-selected', 'false');
  });
  ATTR.panelMenu.removeClass('-show').each( function(i,d) {
    $(d).attr('aria-hidden', 'true');
  });

  ATTR.panelMenu.filter('#panel-menu-'+name).addClass('-show')
    .attr('aria-hidden', 'false');
  var btn = ATTR.tabMenu.filter('#tab-menu-'+name).addClass('-show')
    .attr('aria-selected', 'false');
    
  var panel = btn.closest('.tab-panel');
  if ( panel && panel.length ) {
    panel.closest('.tablist').find('> li > .tab-panel, > li > a').removeClass('-show')
      .each( function(i,d) {
        $(d).attr('aria-selected', 'false');
      });

    var category = panel.addClass('-show').attr('aria-hidden', 'false')
      .parent().find('> a').eq(0).addClass('-show').attr('aria-selected', 'true');

    if ( category.hasClass('-original') ) {
      var cloned = $('#setmenu-head-link-exstra');
      category.hasClass('-show') ? 
        cloned.addClass('-show').attr('aria-selected', 'true') : 
        cloned.removeClass('-show').attr('aria-selected', 'false');
    }
  }
}

function showModal( html ) {
  var close = '<a href="#" class="close-modal" title="Lukk modal vindu">' +
    '<span aria-hidden="true">&#x2716;</span>'+
    '<span class="aria-visible">Lukk modal vindu</span>'+
  '</a>';

  $('#modal').html('<div class="content">' + close + html +'</div>')
    .attr('aria-hidden', 'false').addClass('-open');
  $('body').addClass('display-modal');
}

function hideModal() {
  $('#modal').html('').attr('aria-hidden', 'true').removeClass('-open');
  $('body').removeClass('display-modal');
}

/******************************************************************************
=== GENERAL FUCNTION ===
******************************************************************************/
function updateLocationHash( data ) {
  if ( ! data ) { data = {}; }

  var opt = getURLoption(), key = '', param = [];
  for ( key in data ) {
    opt[key] = data[key];
  }

  for ( key in opt ) {
    if ( opt[key] ) {
      param.push( key+'='+opt[key] );
    }
  }
  window.location.hash = param.length ? ('?'+param.join('&')) : '';
}
 
function getURLoption() {
  var opt = {}, url = window.location.href;
  var matched = url.replace(/\#+/g, '#').match( /^([\w\.\-\s\_\%\/\:]+)\#(.*)/ )
    || url.replace(/\?+/g, '?').match( /^([\w\.\-\s\_\#\%\/\:]+)\?(.*)/ );

  if ( matched ) {
    let splited = (decodeURIComponent(matched[2]) || '')
      .replace( /\#\?/g, '&' ).split( '&' );
    for ( let i = 0; i < splited.length; i++ ) {
      let m = splited[i].match( /(\w+)\=(.*)/ );
      if ( m ) { opt[m[1]] = m[2].replace( /\#$/, '' ); }
    }
  }
  return opt;
}

function getAutoId() {
  var random = Math.floor((Math.random() * 10) + 1);
  var time   = (new Date()).getTime();
  return 'auto_' + time + '_' + random;
}

function getScrollPosition() {
  if (typeof window.pageYOffset !== 'undefined') {
    return [ window.pageXOffset, window.pageYOffset ];
  }

  if (
    typeof document.documentElement.scrollTop !== 'undefined' &&
    document.documentElement.scrollTop > 0
  ) {
    return [
      document.documentElement.scrollLeft,
      document.documentElement.scrollTop
    ];
  }

  return typeof document.body.scrollTop !== 'undefined' ? [
    document.body.scrollLeft, document.body.scrollTop
  ] : [0, 0];
}

/******************************************************************************
=== INTERNAL FUCNTION ===
******************************************************************************/
function _createFoodMenu( data ) {
  var html = '', note = data.notification ? 
    '<div class="notification">'+data.notification+'</div>' : '';
    
  if ( data.headline ) {
    var id = getAutoId(); 
    html = '<h2 id="'+id+'">'+data.headline+'</h2>'+note;
  } else if ( data.subline ) {
    html = '<h3>'+data.subline+'</h3>'+note;
  } else if ( data.type === 'setmenu-price' ) {
    html = '<div class="setmenu-price price">'+data.price+'</div>'+note;
  } else {
    var labelList = data.label instanceof Array ? data.label : [data.label];
    var label = [];
    for ( var i=0; i<labelList.length; i++) {
      if ( ! labelList[i] ) { continue; }
      label.push('<span class="label">'+labelList[i]+'</span>');
    }

    var labelText = label.length ? '<div class="lable-wrapper">'+label.join(' ')+'</div>' : '';
    var name   = data.name ? '<div class="name" data-number="'+data.number+'">'+data.name+'</div>' : '';
    var price  = data.price ? '<div class="price">'+data.price+'</div>' : '';
    var image  = data.image ? (
      '<div class="image-wrapper">'+
        '<img src="'+data.image+'" alt="'+data.name+'"/>'+
      '</div>'+
      '<a href="#" id="food'+data.number+'" class="menu-image">'+
        '<img src="'+data.image+'" alt="'+data.name+'"/>'+
      '</a>' 
    ): '';

    var description = data.description ? 
      '<div class="description">'+data.description+'</div>' : '';
    var type = 'food' + (data.type ? (' -'+data.type) : '');

    html = '<div class="food-wrapper"><div class="'+type+'">' +
      image + labelText + name + description + note + price +
    '</div></div>';   
  }
  return html;
}