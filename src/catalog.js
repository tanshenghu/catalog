/**
* Desc: 类目联动组件
* Date: 2016年05月25日 09:00
* Creator: TanShenghu
* Email: tanshenghu@163.com
*/
define(function(require,exports,module){
    var Widget = require( 'widget' );
    
    return Widget.extend({
        attrs: {
            trigger: null,
            tier: 3, // 层级 目前规则最多三级
            needField: [], // 数据提交保存时所需要的一些字段
            catalogName: 'name', // 用于显示的类目文本字段
            response: null, // 后端返回的数据，如果有response的情况下，url这个就会禁用掉
            url: null, // 请求的接口地址
            param: {}, // 请求的参数
            method: 'get', // 请求的方式
            dataList: '', // 数据中哪一部分是类目list
            childrenField: 'children', // 子类目是用哪个字段存放的
            
            model: {}, // 用户所选择的model数据存储
            curTrigger: null // 当前处于激活状态的trigger
        },
        events: {
            'click ol li': 'select'
        },
        // 请求数据
        getData: function( options ){
            var This  = this,
                Url   = this.get('url'),
                param = this.get('param'),
                dealData = function( res ){
                    var olist = [];
                    if( Array.isArray( res ) ){
                        
                        olist = res;
                        
                    }else if( res.success==true ){
                        
                        if( This.get('dataList') ){
                            olist = eval( '(res.' + This.get('dataList') + ')' );
                        }
                        
                    }
                    
                    if( olist.length==0 ){
                        window.console&&console.log('list data is empty!!!');
                    }
                    
                    Array.isArray( This.get('url') ) ? This.createStepCatalog( olist ) : This.createCatalog( olist, null, 1 );
                    
                };
            
            // 已经有response数据了的一种情况,不需要再做下面的ajax请求了
            if( This.get('response') ){
                dealData( This.get('response') );
                return;
            }
            
            // 分步请求类目数据的情况，就是一步一个请求。
            if( options ){
                Url = this.get('url')[ step-1 ];
                $.extend( param, {id: options.id} );
            }
            
            $[this.get('method')]( Url, param, function( res ){
                dealData( res );
            }, 'JSON');
        },
        // 创建后端入库时所需要的字段
        createhide: function( o ){
            var resultHtml = '';
            this.get('needField').forEach(function( cur ){
                resultHtml += '<input type="hidden" value="'+ (o[cur]||'') +'" name="'+cur+'">';
            })
            return resultHtml;
        },
        // 创建“同步”类目列表
        createCatalog: function( olist, fobj, index ){
            
            var This = this, _ele = '<ol data-fid="'+ ((fobj&&fobj.id)||'0') +'" '+(fobj ? 'style="display:none"': '')+'>';
            Array.isArray( olist ) && olist.forEach(function(item, i){
                _ele += '<li title="'+ (item[ This.get('catalogName') ]||'') +'" '+ (item[ This.get('childrenField') ]?'':'leaf="true"') +' data-id="'+(item.id||'')+'"><span>'+ (item[ This.get('catalogName') ]||'') +'</span>'+ This.createhide(item) +'</li>';
                if( item[ This.get('childrenField') ] ){
                    This.createCatalog( item[ This.get('childrenField') ], item, index+1 );
                }
            })
            _ele += '</ol>';
            
            this.$('.tier-' + index ).append( _ele );
            
        },
        // 创建“异步”类目列表
        createStepCatalog: function( olist, fId, index ){
            
            var This = this, _ele = '<ol data-fid="'+(fId||'0')+'">';
            Array.isArray( olist ) && olist.forEach(function(item, i){
                _ele += '<li title="'+ (item[ This.get('catalogName') ]||'') +'" '+ (item.leaf ? 'leaf="true"' : '') +' data-id="'+(item.id||'')+'"><span>'+ (item[ This.get('catalogName') ]||'') +'</span>'+ This.createhide(item) +'</li>';
            })
            _ele += '</ol>';
            this.$('.tier-' + index ).append( _ele );
            
        },
        // 选择叶子节点事件
        select: function( ele ){
            
            ele     = $( ele.currentTarget );
            
            var ol     = ele.parents('ol'),
                id     = ele.attr('data-id'),
                fid    = ol.attr('data-fid'),
                clsbox = ol.parent('.catalog-tier'),
                isleaf = ele.attr('leaf')=='true';
            
            ele.addClass('current').siblings().removeClass('current');
            clsbox.nextAll('.catalog-tier').find('ol').hide().find('li').removeClass('current');
            
            // 如果是叶子节点就不用下一步操作项了，直接取值
            if( isleaf ){
                // 清空model重新再去取一次数据
                this.set('model', {}, {override:true});
                this.checkValue( ele, id, fid );
                
                // 显示结构
                var oli = '<li>', oinput = $('<input type="hidden" name="catalogFlow">').val( JSON.stringify(this.get('model')) ), ochildren = this.get('model');
                do{
                    
                    oli += '<var>'+ochildren[ this.get('catalogName') ]+'</var><label>&gt;</label>';
                    ochildren = ochildren.children;
                    
                }while( ochildren&&ochildren[ this.get('catalogName') ] );
                
                oli += '</li>';
                
                oli = $( oli ).append( oinput );
                
                oli.find('label:last').remove();
                
                this.get('curTrigger').html( oli );
                
                this.element.hide();
                
                // 为了一些验证插件的工作
                this.get('curTrigger').nextAll('.verifyCatalog').val( JSON.stringify(this.get('model')).length>3?'yes':'' );
                
                return;
            }
            
            if( Array.isArray( this.get('url') ) ){
                
                this.getData({
                    step: clsbox.index()+1,
                    id: id
                });
                
            }else{
                
                clsbox.next().find('ol[data-fid="'+id+'"]').show().siblings().hide();
                
            }
            
        },
        // 根据叶子结节自动去查找父级，以及祖父级关系
        checkValue: function( curEle, curNodeId, fId ){
            
            var catalogbox   = curEle.parents('.catalog-tier'),
                catalogIndex = catalogbox.index(),
               _catalogbox   = curEle.parents('.catalog-tier').prev('.catalog-tier');
            
            if( catalogIndex > 0 ){
                
                var curLi = _catalogbox.find('li[data-id="'+fId+'"]'),
                //oitem     = arguments.callee( curLi, fId, curLi.parents('ol').attr('data-fid') );
                oitem     = this.checkValue( curLi, fId, curLi.parents('ol').attr('data-fid') );
                
                var     O = $.tsh.formRequest( curEle );
                
                if( JSON.stringify( this.get('model') )==='{}' ){
                    
                    oitem.children = O;
                    this.set('model', oitem, {override:true});
                    
                }else{
                    
                    var oitem2 = $.extend({}, this.get('model')),
                    ochildren;
                    for( var i=1; i<catalogIndex; i++ ){
                        ochildren = (ochildren ? ochildren : oitem2)['children'];
                    }
                    ochildren.children = O;
                    
                    this.set('model', oitem2, {override:true});
                    
                    oitem2 = null;
                    ochildren = null;
                }
                oitem = null;
                
            }else{
                
                return $.tsh.formRequest( curEle );
                
            }
            
        },
        showCatalog: function(){
            
            var This = this;
            this.get('trigger').on('click', function( e ){
                
                var $this = $(this);
                This.set( 'curTrigger', $this );
                This.element.css({width: $this.outerWidth(true),left: $this.offset().left, top: $this.offset().top+$this.outerHeight(true)+5}).show();
                e.stopPropagation();
                
            })
            $('body').on('click', function(){
                This.element.hide();
            })
            This.element.on('click', function(e){
                e.stopPropagation();
            })
            
        },
        setup: function(){
            
            if( !($.tsh && $.tsh.formRequest) ){
                alert('未检测到$.tsh.formRequest方法,请引入common.js文件!');
                return;
            }
            
            if( !(this.get('trigger') instanceof jQuery) ){
                this.set('trigger', $(this.get('trigger')));
            }
            this.set('tier', Math.max(1, Math.min(3, +this.get('tier'))) );
            
            if( this.get('response') ){
                this.get('url', null);
            }
            
            this.element.attr('id', 'catalog-pop').hide();
            if( !$('#catalog-pop').length ){
                
                for( var i=1; i<=this.get('tier'); i++ ){
                    this.element.append( '<div class="catalog-tier tier-'+i+'" style="width:'+ (100/this.get('tier')).toFixed( 6 ) +'%"></div>' );
                }
                
                $('body').append( this.element );
            }
            
            this.getData();
            
            this.showCatalog();
            
        }
        
    })
    
    
})