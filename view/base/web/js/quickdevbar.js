
/* */
define(["jquery",
        "jquery/ui",
         "filtertable",
         "metadata",
         "tablesorter"
], function($){
    
    /**
     * 
     * Events attached
     * 
     * All tabs
     * - quickdevbartabscreate
     * - quickdevbartabsbeforeactivate
     * - quickdevbartabsactivate
     * 
     * Ajax tabs
     * - quickdevbartabsbeforeload
     * - quickdevbartabsload
     * 
     */
    
    $.widget('mage.quickDevBarTabs', $.ui.tabs, {
        _create: function() {
            
            var qdbOption = this.element.attr('data-qdbtabs-option');
            if (qdbOption) {
                $.extend( this.options, JSON.parse(qdbOption) );
            }
            
            this._super();
        },
        
        load: function( index, event ) {
            index = this._getIndex( index );
            var that = this,
                tab = this.tabs.eq( index ),
                anchor = tab.find( ".ui-tabs-anchor" ),
                panel = this._getPanelForTab( tab ),
                eventData = {
                    tab: tab,
                    panel: panel
                };
            
            var anchorUrl = $( anchor ).attr( "data-ajax" );
            var rhash = /#.*$/;

            // not remote
            if ( typeof anchorUrl =='undefined' || anchorUrl.length < 1 ||  anchorUrl.replace( rhash, "" ).length<1) {
                return;
            }
            
            this.xhr = $.ajax( this._ajaxSettings( anchorUrl, event, eventData ) );

            // support: jQuery <1.8
            // jQuery <1.8 returns false if the request is canceled in beforeSend,
            // but as of 1.8, $.ajax() always returns a jqXHR object.
            if ( this.xhr && this.xhr.statusText !== "canceled" ) {
                tab.addClass( "ui-tabs-loading" );
                panel.attr( "aria-busy", "true" );

                this.xhr
                    .success(function( response ) {
                        // support: jQuery <1.8
                        // http://bugs.jquery.com/ticket/11778
                        setTimeout(function() {
                            panel.html( response );
                            that._trigger( "load", event, eventData );
                            
                            // Prevent tab to be load several times
                            $( anchor ).removeAttr( "data-ajax" );
                        }, 1 );
                    })
                    .complete(function( jqXHR, status ) {
                        // support: jQuery <1.8
                        // http://bugs.jquery.com/ticket/11778
                        setTimeout(function() {
                            if ( status === "abort" ) {
                                that.panels.stop( false, true );
                            }

                            tab.removeClass( "ui-tabs-loading" );
                            panel.removeAttr( "aria-busy" );

                            if ( jqXHR === that.xhr ) {
                                delete that.xhr;
                            }
                        }, 1 );
                    });
            }
        },
        
        _ajaxSettings: function( anchorUrl, event, eventData ) {
            var that = this;
            return {
                url: anchorUrl,
                beforeSend: function( jqXHR, settings ) {
                    return that._trigger( "beforeLoad", event,
                        $.extend( { jqXHR : jqXHR, ajaxSettings: settings }, eventData ) );
                }
            };
        },
    });
    
      
    $.widget('mage.quickDevBar', {
        options: {
            toggleEffect: "drop",
            stripedClassname: "striped",
            classToStrip: "qdn_table.striped",
            classToFilter: "qdn_table.filterable",
            classToSort: "qdn_table.sortable"
        },

        _create: function() {
            /* Manage toggling toolbar */
            this.element.toggle(this.options.toggleEffect);
            $('#qdb-bar-anchor').on('click', $.proxy(function(event) {
                event.preventDefault();
                this.element.toggle(this.options.toggleEffect);
            }, this));
            
            /* Apply ui.tabs widget */ 
            $('div.qdb-container').quickDevBarTabs({load:$.proxy(function(event, data){
                if(data.panel) {
                    console.log(data);
                    this.applyTabPlugin('#' + data.panel.attr( "id" ));
                }
                }, this)}
            );

            this.applyTabPlugin('div.qdb-container');
            
            /* Manage ajax tabs */
            $('div.qdb-container').addClass('qdb-container-collapsed');
        },
        
        applyTabPlugin: function(selector) {
            
            /* Apply enhancement on table */
            
            /* classToStrip: Set odd even class on tr */
            $(selector + ' table.' + this.options.classToStrip + ' tr:even').addClass(this.options.stripedClassname);
            
            /* classToFilter: Set filter input */
            $(selector + ' table.' + this.options.classToFilter).filterTable({
                label: 'Search filter:',
                minRows: 10,
                visibleClass: '', 
                callback: $.proxy(function(term, table) {
                    table.find('tr').removeClass(this.options.stripedClassname).filter(':visible:even').addClass(this.options.stripedClassname);
                }, this)
            });
            
            /* classToSort: Set sort on thead */
            $(selector + ' table.' + this.options.classToSort).tablesorter(); 
            
            /* Set special class to last element of the tree in layout tab */
            $(selector + ' ul.tree li:last-child').addClass('last');
        },
        
        /**
         * https://wiki.eclipse.org/Eclipse_Web_Interface
         */
        callJsEclipseSocEWI: function(file, line)
        {
            var url= 'http://localhost:34567/?command=org.eclipse.soc.ewi.examples.commands.openfile&path='+file+'&line='+line;
            try
            {
              var xhr_object = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
              xhr_object.open("post", url, false);
              xhr_object.send();
            }
            catch(e)
            {
              //uncaught exception: Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIXMLHttpRequest.send]
              //console.log(e);
              if( e.name!='NS_ERROR_FAILURE' && e.result!=2147500037)
                window.location = url;
            }
        }        
    });
});