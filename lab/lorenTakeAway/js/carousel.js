/*
 */
;(function($) { $.fn.Carousel = function ( config ) {
  if ( ! config ) { config = {}; }

  /****************************************************************************
    === CONFIGURATION OPTION === 
    - bulletNavigator {Boolean}, default as true,
         The true appends bullet navigator to the current object. The bullet
         mode will be change when the imege is changed, and it'll change
         the image by clicking. Otherwise creating of bullet will be ignored.
    - ArrowNavigator {Boolean}, default as true,
         The true appends arrow navigators to the current object. The right
          arrow navigates to next image and the previous left arrow 
          navigates to the previous image by clicking. Otherwise creating 
          of arrows will be ignored. 
    - distance {Integer}, default as 20
        When the drag distance of the image is great than this value, the 
        current image will be replace by a next image.
    - duration {Integer}, default as 600 (millisecond)
        A number determining how long the animation will run.
    - startIndexImage {Integer}, default as 0
        A number determining which image will display in the beginning.
    - carousel {Boolean}, default as false
        The true makes the slider loop in both directions with no end.
    - reverse {Boolean}, default as false
        It'll effect the autoSwipe direction. The true refers to swipe the 
        images from left to right, otherwise it swipes from right to left. 
    - autoSwipe {Boolean|Integer}, default as 0
        The true (will be convert to 5000 milliseconds) or a number will enable 
        automatic cycling through slides. Otherwise automatic cycling is 
        disabled.    
    - incremental {Boolean|Integer}, default as 0
        The true (will be convert to 1) or a number will enable incremental 
        load. The number determining how many previous and next image will be
        loaded when the current image appears. Otherwise all images will be 
        load in the beginning
  ****************************************************************************/
  var opt = {
    'main'       : this,
    'slider'     : this.find('.carousel_slider'),
    'onSlide'    : false,
    'out'        : 0,
    'waiting'    : [],
    'distance'   : config.distance        || 10,
    'duration'   : config.duration        || 600,
    'atIndex'    : config.startIndexImage || 0,
    'carousel'   : config.carousel        || false,
    'reverse'    : config.reverse         || false,
    'scroll'     : config.scroll          || false,
    'aNavigator' : typeof(config.arrowNavigator) === 'undefined' ? 
      true : config.arrowNavigator,
    'bNavigator' : config.scroll ? false : (typeof(config.bulletNavigator) === 'undefined' ? 
      true : config.bulletNavigator),
    'autoTime'   : config.scroll || ! config.autoSwipe ? 0 : 
      (config.autoSwipe===true ? 5000 : config.autoSwipe),
    'incremental': config.scroll || ! config.incremental ? 0 :
      (config.incremental===true ? 1 : config.incremental),
    'completeCallback' : config.completeCallback,
    'startCallback'    : config.startCallback,
    'endCallback'      : config.endCallback,
    'scrollPulse'      : 20
  };

  var helper = {
    /*************************************************************************
      === Initialization ===
    **************************************************************************/
    init : function() {
      if ( ! opt.main.hasClass('carousel_screen') ) {
        opt.main = $('<div class="carousel_screen"></div>').appendTo( opt.main );
      }

      opt.ie = helper.isIE();
      opt.android = helper.isAndroid();
      
      if ( ! opt.slider.length ) { 
        opt.slider = $('<ul class="carousel_slider"></ul>').appendTo(opt.main);
      }

      if ( opt.scroll ) { opt.slider.addClass('scrolling'); }

      opt.mainId   = helper._generateId( opt.main );
      opt.ie       = helper.isIE();
      opt.isMobile = helper.isMobile();

      if ( helper._initImageOption() ) { // Images validation
        opt.left   = parseInt( opt.slider.css('left'), 10 ); 
        opt.second = parseFloat( opt.duration / 1000, 10 );

        helper._initArrowOption();      // Append arrows navigator
        helper._initBulletOption();     // Append bullets navigator        
        helper._initCarouselOption();   // Carousel initialization
        helper._initImageCloneOption(); // Check is there any img tag exist

        // Importen to render this function for correct size of image
        helper.verifyImagesLeft();

        // Bind window resizing.
        $( window ).on('resize', helper.verifyAtIndexLeft ).resize();

        $( document ).on('mousedown mousemove mouseup touchstart touchmove touchend', function(e) {
          helper.touchEventHandler( e, helper.verifySwipe );
        });
        if ( opt.autoTime ) { helper.renderTimeout(); }
        helper.updateBullet();
        helper.updateArrow();
      }
      opt.main.addClass('initialized');
    },
  
    _initImageOption : function() {
      var index    = opt.atIndex, data = config.data, atLeast = null;
      var delay    = data && data[index] && data[index].src ? {} : null;
      var interval = helper.getLoadingInterval();

      opt.images = data ? $( $.map( data, function( d, i ) {
        var s = d.src, t = d.text;
        if ( ! s && ! t ) { return; }

        var n = ! s ? '<div class="text">'+t+'</div>' : 
          '<img src="'+d.src+'" alt="'+(d.alt||'')+'">' + (!t ? '' : (
            '<div class="image_text">' + (
              (t instanceof Array) ? $.map( t, function(d,i) {
                return '<div class="text">' + 
                  typeof( d ) === 'string' ? d : ( d.n || '' )+
                '</div>';
              }).join('') : ('<div class="text">'+t+'</div>')
            ) + '</div>'
          ));

          // incremental load test
        var c = $.map(interval, function(v){return v===i ? i : '';}).join('');
        if ( opt.incremental && ! c ) {
          opt.waiting[i] = n; n = '';     
          if ( atLeast === null && s ) { atLeast = i; }
        }
        else if ( s ) { 
          atLeast = false;   
          if ( delay && i !== index ) { delay[i+''] = n; n = ''; }
        }
        return '<li class="carousel_item'+(d.mode ? ' '+d.mode:'')+'">'+ n + '</li>';       
      }).join('') ).appendTo( opt.slider ).filter('.carousel_item') : opt.slider.find('.carousel_item');

      opt.count = opt.images.not('.inactive').length;
      if ( typeof(atLeast) === 'number' ) { helper.renderLazyload( atLeast ); }

      if ( delay ) { 
        setTimeout( function() { $.each( delay, function(k,v) { 
          opt.images.eq( parseInt(k) ).append(v); 
        }); }, 500 );
      }

      opt.holder = opt.main.find('> .carousel_slider_holder');
      if ( ! opt.holder.length ) {
        opt.holder = $('<div class="carousel_slider_holder"></div>').append( opt.main.children() );
        opt.main.append( opt.holder );
      }

      return opt.count > 0;
    },

    _initBulletOption : function() {
      opt.bullets = ! opt.bNavigator ? null : $(
        '<div class="carousel_bullets">' + $.map( opt.images.toArray(), function(dom,i) {
          var c = 'bullet_item' + (i === opt.atIndex ? ' active' : '') + ' index_'+i;
          return '<a href="#" class="'+c+'"></a>';
        }).join('') + '</div>'
      ).appendTo( opt.main ).find( '.bullet_item' ).on( 'click', function(e){
        e.preventDefault();
      }); 
    },

    _initArrowOption : function() {
      opt.arrows = opt.aNavigator && opt.images.length > 1 ? 
        opt.main.append(
          '<a href="#" class="carousel_arrow carousel_left"></a>'+
          '<a href="#" class="carousel_arrow carousel_right"></a>'
        ).find( '.carousel_arrow' ).on( 'click', function( e ) {
          e.preventDefault();
        }) : null;
      if ( opt.arrows ) { opt.main.addClass('included_arrows'); }
    },

    _initCarouselOption : function() {
      if ( opt.carousel && opt.count > 1 ) {
        opt.copies = opt.slider.append(
          opt.images.eq( 0 ).clone().addClass('copy'), 
          opt.images.eq( opt.count-1 ).clone().addClass('copy')
        ).find('.carousel_item.copy');
      }
    },

    _initImageCloneOption : function() {
      if ( opt.scroll ) { return; }

      var cloned = null, img = opt.images.find('img');
      if ( img.length ) { 
        cloned = img.eq( 0 ).parent().clone();   
      } else { // only text, there 
        var height = 0, pin = 0;
        cloned = opt.images.each( function(i, dom) {
          var h = $( dom ).prop('offsetHeight');
          if ( height < h ) {  height = h; pin = i; }
        }).eq( pin ).clone();
      }
      opt.slider.append( cloned.addClass('cloned') );   
    },

    /*************************************************************************
      === Methode ===
    **************************************************************************/
    isAndroid : function() { 
      var ua = navigator.userAgent.toLowerCase();
      var m = ua.match( /android(\s+)?([1-9\.]+)/i );
      return m ? parseFloat( m[m.length -1] ) : 0;
    },

    /**
     *
     */
    verifySwipe : function( data, phase ) {
      var update = function( source ) {
        if ( ! opt.android ) { source.event.preventDefault(); }
        helper.stop();

        var t = source.target, a = 'carousel_arrow', b = 'bullet_item';
        if ( t.hasClass(a) || t.hasClass(b) ) {
          var what = t.hasClass( a ) ? a : b;

          if ( source.phase === 'start' ) { 
            opt.what = what;
          } else {
            if ( source.phase === 'end' && opt.what === what ) {
              if ( what === a ) { 
                helper.clickArrow( source.event, true );
              } else { 
                helper.clickBullet( source.event, true );
              }
            }
            opt.what = null;
          }
        }
        else {
          if ( source.phase === 'start' ) { 
            opt.left = parseInt( opt.slider.css('left') );
            if ( opt.scroll ) {
              opt.scrollData = helper.getScrollData();
              opt.scrollList = [];
              clearInterval( opt.scrollTimer || 0 );
              opt.scrollTimer = setInterval( function() {
                opt.scrollList.push( parseInt(opt.slider.css('left')) );
              }, opt.scrollPulse );
            }
          }

          if ( data.direction === 'left' || data.direction === 'right' ) { 
            helper.adjustSlider( source );
          }
        }
      };

      if ( phase === 'start' && opt.mainId ) {
        var parent = data.target.closest('#'+opt.mainId );
        if ( parent.length ) { 
          data.touchSource = parent;
          update( data );
        }
      }
      else if ( phase==='move' && data.touchSource ) {
        update( data );
      }
      else if ( phase==='end' && data.touchSource ) {
        update( data );
        data.touchSource = null;
      }
    },

    getScrollData : function() {
      var data = { 'width' : helper.getScreenSize(), 'size' : 0 };
      opt.images.each(function(i,dom){
        var node  = $(dom), w = node.prop('clientWidth');
        var left  = parseInt(node.css('margin-left'));
        var right = parseInt(node.css('margin-right'));
        if ( isNaN(left) )  { left = 0;  }
        if ( isNaN(right) ) { right = 0; }
        data.size += w + left + right + 5;
      });
      data.max = data.width - data.size;
      return data;
    },

    /**
     * The function 
     * @return {Void}
     */   
    slideComplete: function() {
      opt.left = parseFloat( opt.slider.css('left') );

      helper.updateBullet();
      helper.updateArrow();
      // Render configuration options
      if ( opt.autoTime    ) { helper.renderTimeout();  }
      if ( opt.incremental ) { helper.renderLazyload(); }

      if ( typeof(opt.completeCallback) === 'function' ) {
        opt.completeCallback(); 
      }
    },

    /**
     * The function .
     * @param index {Integer}
     * @return {Integer}
     */   
    renderLazyload : function( index ) {
      if ( ! opt.incremental || ! opt.waiting ) { return; }
      var interval = index === null ? helper.getLoadingInterval() : [index];
      $.map( interval, function( i ) {
        if ( opt.waiting[i] ) {
          opt.images.eq( i ).append( opt.waiting[i] );

          if ( opt.copies )  {
            if ( i===0 || i === (opt.count-1) ) { 
              opt.copies.eq( i ? 1 : 0 ).append( opt.waiting[i] );
            }
          }
          opt.waiting[i] = null;
        }
      });
      if ( ! opt.waiting.join('') ) { opt.waiting = null; }
    },    

    /**
     * The function .
     * @return {Integer}
     */   
    renderTimeout : function() {
      if ( ! opt.autoTime ) { return; }

      helper.stop( 'timeout' );
      opt.out = setTimeout( function() {
        var index = opt.atIndex, w = helper.getScreenSize(); 
        var desc  = ! opt.reverse, next = index + (desc ? 1 : -1);
        var pin   = w * next * (-1); 
        if ( ! opt.carousel ) {
          if ( desc ) {
            if ( next === opt.count ) { 
              desc = false; pin = 0;
            }
          }
          else {
            if ( next < 0 ) {
              desc = true; pin = w * (opt.count-1) * (-1);
            }
          }
        }
        helper.sliding( pin, desc );
      }, opt.autoTime );
    },

    /**
     * The function returns the width size of the main object.
     * @return {Integer}
     */   
    getScreenSize : function() { 
      return (opt.holder || opt.main).prop('offsetWidth'); },

    /**
     * The function returns the width size of the main object.
     * @return {Array}
     */   
    getLoadingInterval : function() {
      var s = opt.incremental, a = opt.atIndex; 
      if ( ! s ) { return [ a ]; }

      var c = opt.carousel || opt.autoTime, m = opt.count, o = [];
      $.each( new Array(s), function(i) {
        var j = a - s + i;
        o.push( c && j < 0 ? m + j : j );         
      });
      o.push( a );
      $.each( new Array(s), function(i) {
        var j = a + i + 1;
        o.push( c && j > (m-1) ? (j-m) : j );         
      });
      return o;
    },

    /**
     */
    getAtIndex : function() { return opt.atIndex || 0; },

    /**
     */
    getImages : function() { return opt.images; },

    /**
     * The function verifies all images position according to the screen size.
     * @param width {Integer} size of the main object.
     * @return {Void}
     */   
    verifyImagesLeft : function( width ) {
      if ( opt.scroll ) { return; }

      var w = width || helper.getScreenSize();
      opt.count = opt.images.not('.inactive').each( function( i, dom ) {
        $( dom ).css({ 
          'left'     : (w*i)+'px',
          'width'    :  w + 'px',
          'position' : 'absolute'
        });
      }).length;
      opt.images.filter('.inactive').css({'position':'absolute'});

      if ( opt.copies ){
        opt.copies.each(function(i, dom) {
          $( dom ).css({ 
            'left'     : (w * (i===0 ? opt.count : -1) )+'px',
            'width'    :  w + 'px',
            'position' : 'absolute'
          });
        });
      }
    },

    /**
     * The function adjust the current image's position.
     * @param ignor {Boolean}, the true refers to not call methode 
     *        verifyAtIndexLeft.
     * @return {Void}
     */   
    verifyAtIndexLeft : function( ignor ) {
      if ( opt.scroll ) {
        var scroll  = helper.getScrollData();
        if ( scroll.max > opt.left ) { 
          opt.slider.css({'left':scroll.max+'px'});
        }
      } 
      else {
        var w = helper.getScreenSize();
        opt.left = - (w * opt.atIndex);
        opt.slider.css('left', opt.left+'px');      
        if ( ignor !== true ) { helper.verifyImagesLeft( w ); }
      }
    },

    /**
     * The function interval updates pixel of slider's left until
     * the pixel is great/low then pin.
     * @param pin {Integer}.
     * @param desc {Boolean}, true refers to decrease slider's left pixel,
     *        Otherwise it'll increase slider's left pixel.
     * @return {Void}
     */
    sliding : function( pin, desc ) {
      helper.stop(); //opt.onSlide = true;

      if ( opt.ie && opt.ie < 10 ) {
        var w = desc ? (opt.left-pin) : (pin-opt.left);
        opt.move = { 'left' : (desc ? ('-='+w) : ('+='+w))+'px' };

        opt.slider.animate( opt.move, {
          'duration': opt.duration, 'complete':function() {
            helper.completeSliding( pin ); 
          }
        });
      }
      else {
        if ( ! opt.slider.hasClass('binddedTransitionend') ) {
          var handler = 'transitionend webkitTransitionEnd '+
            'oTransitionEnd otransitionend MSTransitionEnd';
          opt.slider.on( handler, function() {
            helper.completeSliding();
          }).addClass('binddedTransitionend');
        }

        opt.slider.css({
          '-ms-transition-duration'     : opt.second+'s',
          '-o-transition-duration'      : opt.second+'s',
          '-moz-transition-duration'    : opt.second+'s',
          '-webkit-transition-duration' : opt.second+'s',
          'left'                        : pin+'px'
        });
      }
    },

    /**
     * The function stops the move.
     * @param pin {Integer}.
     * @return {Void}
     */
    completeSliding : function( pin ) {
      if ( ! pin ) { pin = parseInt( opt.slider.css('left'), 10 ); }
      opt.slider.attr('style', 'left:'+pin+'px');
      opt.onSlide = false;
      if ( ! opt.scroll ) {
        opt.atIndex = parseInt( (pin / helper.getScreenSize()) * -1 ); 
        if ( opt.atIndex < 0  || opt.atIndex >= opt.count ) { 
          opt.atIndex = opt.atIndex < 0 ? opt.count-1 : 0;
        }
        helper.verifyAtIndexLeft( true ); 
      }
      helper.slideComplete();
    },

    /**
     * The function stops the move and waiting time for displaying of next image.
     * @param action {String}, as 'animate' refers to stop the move of image,
     *        as 'timeout' to stop the waiting time. The default as null stops
     *         the both actions.
     * @return {Void}
     */
    stop : function( action ) {
      if ( action === null || action === 'timeout' ) { clearTimeout( opt.out ); }
      if ( action === null || action === 'animate' ) { 
        if ( opt.ie && opt.ie < 10 ) {
          opt.slider.stop();
        } else {
          opt.slider.attr('style', 'left:'+opt.slider.css('left') );
        }
        opt.onSlide = false;
      }
    },

    scrollStopped : function( data ) {
      clearInterval( opt.scrollTimer || 0 );
      var list = opt.scrollList || [], loop = list.length, test = true;
      var last = loop > 2 ? (list[loop-1]-list[loop-2]) : 0;

      if ( last < 0 ) { last *= -1; }

      if ( last < 10 ) { test = false; }

      if ( test ) {
        for ( var i=loop-1; i>0; i-- ) {
          if ( list[i] === list[i-1] && list[i] !== list[0] ) {
            test = false; i = 0;
          }
        }
      }

      if ( test ) {
        var scroll  = opt.scrollData || helper.getScrollData();
        data.view   = scroll.width; 
        data.offset = parseFloat(data.distance / data.view);
        data.time   = (new Date()).getTime() - (data.moveTime || data.startTime)+100;
        data.speed  = (data.distance / data.time)*(data.type==="touch" ? 1 :data.offset);
        //debug( 'T:'+data.time +' S:'+data.speed, data );

        if ( opt.android ) { data.speed *= 10; }
        if ( data.speed >= 0.5 ) {
          if ( data.speed > 1 ) { data.speed = 1; }
             
          data.move = parseInt(data.distance * data.speed * (data.offset*10));
          if ( data.move >= 150 ) {
            var desc = data.direction==='left', pin = opt.left + (data.move * (desc?-1 : 1));
            if ( pin>0)                { pin = 0;          }
            else if ( pin<scroll.max ) { pin = scroll.max; }

            helper.sliding( pin, desc );
            //debug( 'L:'+opt.left + ' M:'+data.move + ' MX:'+scroll.max );
          }
        }
      }
      
      helper.slideComplete();
    },


    /**
     * The function calculates slider left according to data information.
     * @param data {hash}
     * @return {Void}
     */
    adjustSlider : function( data ) {
      var r = data.direction === 'right';
      var w = helper.getScreenSize(), m = [-(w*(opt.count-1)), 0], d = 50;
      var v = opt.left - (r ? -data.distance : data.distance), o = 0;
      
      var mp = parseInt( (data.distance * 100 ) / w); // Moved in percent
      if ( data.phase === 'end' || data.phase === 'cancel' ) {
        opt.left = parseInt( opt.slider.css('left') );

        var check = (opt.atIndex===0 && r ) ||
          (opt.atIndex===opt.count-1 && ! r);

        if ( opt.carousel && check ) {
          o = parseInt((v % w) * -1);
          if ( o < 0 ) { o *= -1; } // absolute value         
          //if ( ((o * 100 ) / w) > opt.distance ) {
          if ( mp > opt.distance ) {
            if ( r )  {
              helper.sliding( w, false );
            } else {
              helper.sliding(  (w*opt.count)*-1, true );  
            }
          }
          else { 
            if ( opt.left > m[1] )      { helper.sliding( m[1], true );  }
            else if ( opt.left < m[0] ) { helper.sliding( m[0], false ); }
          }
        }
        else {
          if ( opt.scroll ) { 
            var max = opt.scrollData.max;
            if ( opt.left > 0 )               { helper.sliding( 0, true );    }
            else if ( max<0 && opt.left<max ) { helper.sliding( max, false ); }
            else                              { helper.scrollStopped( data ); }
          }
          else if ( opt.left > m[1] ) { helper.sliding( m[1], true );  }
          else if ( opt.left < m[0] ) { helper.sliding( m[0], false ); }
          else { 
            o = parseInt((v % w) * -1);
            //debug('V: '+v +' W: '+w+ ' O: '+o + ' D:'+opt.distance);

            var g = [v + o, v - (w-o) ];
            //if ( ((o * 100 ) / w) > opt.distance ) {
            if ( mp > opt.distance ) {              
              if ( r ) { 
                helper.sliding( g[0], false );
              } else { 
                helper.sliding( g[1], true );
              }
            }
            else {
              if ( ! r ) { 
                helper.sliding( g[0], false );
              } else { 
                helper.sliding( g[1], true );
              }
              //helper.sliding( g[0], false ); 
            }
          }
        }

        opt.main.removeClass('carousel_moving');
        if ( typeof(opt.endCallback) === 'function' ) { opt.endCallback( data ); }
      }
      else if ( opt.scroll ) {
        if ( v<=d && v>(opt.scrollData.max-d) ) {
          opt.slider.css('left', v+'px'); 
        }
      }
      else if ( (v >= (m[0]-d) && v <= (m[1]+d)) || opt.carousel ) { 
        opt.slider.css('left', v+'px'); 
      }

      if ( data.phase === 'move' && data.distance > 5 ) {
        opt.main.addClass('carousel_moving');        
      }
    },

    /**
     * The function updates the bullets active mode.
     * @return {Void}
     */   
    updateBullet : function () {
      if ( ! opt.bullets || ! opt.bullets.length ) { return; }

      var mode = 'active', off = 'inactive';
      opt.images.each( function(i,dom) {
        if ( $(dom).hasClass(off) ) { 
          opt.bullets.eq( i ).addClass( off );
        } else { 
          opt.bullets.eq( i ).removeClass( off );
        }
      });

      opt.bullets.removeClass( mode ).not( '.'+off )
        .eq( opt.atIndex ).addClass( mode );
    },

    /**
     * @return {Void}
     */   
    updateArrow : function () {
      if ( ! opt.arrows || ! opt.arrows.length ) { return; }

      var mode = 'inactive';
      var left  = opt.arrows.filter('.carousel_left');
      var right = opt.arrows.filter('.carousel_right'); 

      if ( opt.scroll ) {
        if ( opt.left >= 0 ) { left.addClass( mode );    }
        else                 { left.removeClass( mode ); }

        var max = (opt.scrollData || helper.getScrollData()).max;
        if ( max>0 || opt.left<=max ) { right.addClass( mode );    }
        else                          { right.removeClass( mode ); }
      }
      else {
        opt.arrows.removeClass( mode );
        if ( opt.carousel ) { return; }

        if ( opt.atIndex === 0 ) { left.addClass( mode ); } 
          
        var count = opt.images.not('.inactive').length;
        if ( opt.atIndex >= (count-1) ) {  right.addClass( mode ); }
      }
    },    

    /**
     * The function as handler by clicking of the bullet to navigate the images.
     * @param e {window.Event}.
     * @return {Void}
     */   
    clickBullet : function( e, force ) {
      if ( (opt.onSlide || ! opt.bullets) && ! force ) { return; }
      //var t = $( e.target ), index = opt.bullets.index( t );
      var index = 0, loop = opt.bullets.length, j = 0, mode = 'clicked_bullet';
      $( e.target ).addClass(mode);
      for ( var i=0; i<loop; i++ ) {
        if ( opt.bullets.eq(i).hasClass('inactive') ) { continue; }
        if ( opt.bullets.eq(i).hasClass(mode) ) {
          opt.bullets.eq(i).removeClass(mode);
          index = j; 
          i = loop;
        }
        j++;
      }   
      var pin = (helper.getScreenSize() * index) * (-1);
      opt.left = parseInt( opt.slider.css('left') );
      helper.sliding( pin, pin<=opt.left );
    },

    /**
     * The function as handler by clicking of the arrow to navigate the images.
     * @param e {window.Event}.
     * @return {Void}
     */   
    clickArrow : function( e ) {
      helper.navigateImage( $( e.target ).hasClass('carousel_right') );
    },

    /**
     *
     */
    navigateImage : function( next, force ) {
      if ( opt.onSlide && ! force ) { return; }

      var pin = 0;
      if ( opt.scroll ) {
        var scroll = helper.getScrollData(), width = scroll.width, max = scroll.max;
        var left   = parseFloat( opt.slider.css('left'), 10 );
        if ( isNaN(left) ) { left = 0; }

        pin = left + (width * (next ? -1 : 1));
        if ( pin > 0 )        { pin = 0;   }
        else if ( pin < max ) { pin = max; } 
      } 
      else {
        var index = opt.atIndex;
        var check = (! next && ! index) || (next && index+1 === opt.count);
        if ( ! opt.carousel && check ) { return; }
    
        pin = (helper.getScreenSize() * (index+(next ? 1 : -1))) * (-1);
      }
      helper.sliding( pin, next );
    },   

    /**
     *
     */
    getEventPosition : function( e, touch ) {
      if ( ! e ) { e = window.event; }
      var target = (e.targetTouches || e.changedTouches || [])[0], pos = [
        e.clientX || e.pageX || (touch && target ? target.pageX : 0),  
        e.clientY || e.pageY || (touch && target ? target.pageY : 0)
      ];

      if ( pos[0]===0 && pos[1]===0 ) {
        try {
           pos =[e.originalEvent.touches[0].pageX,e.originalEvent.touches[0].pageY];
        } catch(error) { pos = [0,0]; } 
      }
      return pos;
    },

    /**
     *
     */
    touchEventHandler : function(e, callback) {
      var type = e.type, t = $(e.target), isMouse = type.match(/mouse/i);
      if ( opt.touchEvent && opt.touchEvent.type.match(/touch/i) && isMouse ) {
        return;
      }
      var position = helper.getEventPosition( e );
      if ( type.match(/(ms)?touchstart|mousedown/i) ) {
        if ( opt.touchEvent ) { clearTimeout(opt.touchEvent.timer); }

        opt.touchEvent = {
          'type'     : isMouse ? 'mouse' : 'touch',
          'phase'    : 'start',   
          'event'    : e,
          'target'   : t,
          'direction': '',
          'distance' : 0,
          'vertical' : '',
          'height'   : 0,
          'position' : position,
          'startTime': (new Date()).getTime(),
          'memory'   : [position],
          'timer'    : 0,
        };

        if ( typeof(callback)==='function') { 
          callback( opt.touchEvent , 'start' );
        }
      }
      else if ( opt.touchEvent ) {

        opt.touchEvent.event = e;
        if ( ! opt.touchEvent.moveTime ) {
          opt.touchEvent.moveTime = (new Date()).getTime();
        }

        var started = opt.touchEvent.position;
        var memory  = opt.touchEvent.memory;

        if ( ! position[0] && ! position[1] ) {
          position = memory[memory.length-1];
        }

        if ( started[0] < position[0] ) {
          opt.touchEvent.direction = 'right';
          opt.touchEvent.distance  = position[0]-started[0];
        }
        else {
          opt.touchEvent.direction = 'left';
          opt.touchEvent.distance  = started[0]-position[0];
        }
        
        if ( started[1] < position[1] ) {
          opt.touchEvent.vertical = 'down';
          opt.touchEvent.height   = position[1]-started[1];
        }
        else {
          opt.touchEvent.vertical = 'up';
          opt.touchEvent.height   = started[1]-position[1];
        }
     
        opt.touchEvent.memory.push( position );

        if ( type.match(/(ms)?touchmove|mousemove/i)  ) {
          opt.touchEvent.phase = 'move';
          if ( typeof(callback)==='function') { 
            callback( opt.touchEvent , 'move' );
          }
        }
        else if ( type.match(/(ms)?touchend|mouseup/i) ) {
          opt.touchEvent.phase = 'end';

          if ( typeof(callback)==='function') { 
            callback( opt.touchEvent , 'end' );
          }
      
          opt.touchEvent.timer = setTimeout( function() {
            opt.touchEvent = null;
          }, 200 );
        }
      }
    },

    /**
     *
     */
    isTouchDevice : function() {
      //var test =  !!('ontouchstart' in window) // works on most browsers 
      //  || !!('onmsgesturechange' in window); // works on ie10       
      var test = ! (!('ontouchstart' in window) ) || ! (!('onmsgesturechange' in window));

      if ( test && opt.ie > 10 ) { 
        test = !!(navigator.msMaxTouchPoints);
      }
      return test;
    },

    /**
     *
     */
    /*
    isMobile : function() {
      if ( ! (navigator.appVersion.indexOf('Mobile') > -1) ) { 
        return false;
      }
      return ! ( navigator.userAgent.match(/iPad/i) !== null );
    },
    */
    isMobile : function() {
      if ( navigator.appVersion.indexOf('Mobile') > -1 ) {
        if ( ! navigator.userAgent.match(/iPad/i) ) {          
          return true;
        }
      }
      return false;
    },

    /**
     *
     */
    isWindowsNT : function() {
      if ( ! (navigator.appName).match('Microsoft Internet Explorer') ) { 
        return 0;
      }
      var m = (navigator.appVersion).match( /Windows\s+NT\s([\d\.]+)/ );
      return m && m[1] ? parseFloat( m[1] ) : 0; 
    },

    /**
     *
     */
    isIE : function() {
      var m = null;
      if ( (navigator.appName).match('Microsoft Internet Explorer') ) {
        m = (navigator.appVersion).match(/MSIE\s([\d\.]+)/);
      } else if ( (navigator.appName).match('Netscape') ) { 
        m = (navigator.appVersion).match( /rv:([\d\.]+)/);
      }
      return m && m[1] ? parseFloat( m[1] ) : 0; 
    },

    /**
     *
     */
    _generateId : function( node ) {
      var id = node.attr('id');
      if ( ! id ) {
        id = 'auto_'+(new Date()).getTime()+'_'+Math.floor((Math.random()*1000)+1);
        node.attr('id',id);
      }
      return id;
    }
  };

  var method = {};
  for ( var k in helper ) {
    if ( ! k.match(/^(init|setup|_)/i) ) { method[k] = helper[k]; }
  }
  
  this.Carousel = method;
  setTimeout( helper.init, 100 );
  return this;
}; })( jQuery );