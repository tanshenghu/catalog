define("widget/catalog/1.0.0/catalog",["widget"],function(require,exports,module){var Widget=require("widget");return Widget.extend({attrs:{trigger:null,tier:3,needField:[],catalogName:"name",response:null,url:null,param:{},method:"get",dataList:"",childrenField:"children",model:{},curTrigger:null},events:{"click ol li":"select"},getData:function(options){var This=this,Url=this.get("url"),param=this.get("param"),dealData=function(res){var olist=[];Array.isArray(res)?olist=res:1==res.success&&This.get("dataList")&&(olist=eval("(res."+This.get("dataList")+")")),0==olist.length&&window.console&&console.log("list data is empty!!!"),Array.isArray(This.get("url"))?This.createStepCatalog(olist):This.createCatalog(olist,null,1)};return This.get("response")?(dealData(This.get("response")),void 0):(options&&(Url=this.get("url")[step-1],$.extend(param,{id:options.id})),$[this.get("method")](Url,param,function(a){dealData(a)},"JSON"),void 0)},createhide:function(a){var b="";return this.get("needField").forEach(function(c){b+='<input type="hidden" value="'+(a[c]||"")+'" name="'+c+'">'}),b},createCatalog:function(a,b,c){var d=this,e='<ol data-fid="'+(b&&b.id||"0")+'" '+(b?'style="display:none"':"")+">";Array.isArray(a)&&a.forEach(function(a){e+='<li title="'+(a[d.get("catalogName")]||"")+'" '+(a[d.get("childrenField")]?"":'leaf="true"')+' data-id="'+(a.id||"")+'"><span>'+(a[d.get("catalogName")]||"")+"</span>"+d.createhide(a)+"</li>",a[d.get("childrenField")]&&d.createCatalog(a[d.get("childrenField")],a,c+1)}),e+="</ol>",this.$(".tier-"+c).append(e)},createStepCatalog:function(a,b,c){var d=this,e='<ol data-fid="'+(b||"0")+'">';Array.isArray(a)&&a.forEach(function(a){e+='<li title="'+(a[d.get("catalogName")]||"")+'" '+(a.leaf?'leaf="true"':"")+' data-id="'+(a.id||"")+'"><span>'+(a[d.get("catalogName")]||"")+"</span>"+d.createhide(a)+"</li>"}),e+="</ol>",this.$(".tier-"+c).append(e)},select:function(a){a=$(a.currentTarget);var b=a.parents("ol"),c=a.attr("data-id"),d=b.attr("data-fid"),e=b.parent(".catalog-tier"),f="true"==a.attr("leaf");if(a.addClass("current").siblings().removeClass("current"),e.nextAll(".catalog-tier").find("ol").hide().find("li").removeClass("current"),f){this.set("model",{},{override:!0}),this.checkValue(a,c,d);var g="<li>",h=$('<input type="hidden" name="catalogFlow">').val(JSON.stringify(this.get("model"))),i=this.get("model");do g+="<var>"+i[this.get("catalogName")]+"</var><label>&gt;</label>",i=i.children;while(i&&i[this.get("catalogName")]);return g+="</li>",g=$(g).append(h),g.find("label:last").remove(),this.get("curTrigger").html(g),this.element.hide(),this.get("curTrigger").nextAll(".verifyCatalog").val(JSON.stringify(this.get("model")).length>3?"yes":""),void 0}Array.isArray(this.get("url"))?this.getData({step:e.index()+1,id:c}):e.next().find('ol[data-fid="'+c+'"]').show().siblings().hide()},checkValue:function(a,b,c){var d=a.parents(".catalog-tier"),e=d.index(),f=a.parents(".catalog-tier").prev(".catalog-tier");if(!(e>0))return $.tsh.formRequest(a);var g=f.find('li[data-id="'+c+'"]'),h=this.checkValue(g,c,g.parents("ol").attr("data-fid")),i=$.tsh.formRequest(a);if("{}"===JSON.stringify(this.get("model")))h.children=i,this.set("model",h,{override:!0});else{for(var j,k=$.extend({},this.get("model")),l=1;e>l;l++)j=(j?j:k).children;j.children=i,this.set("model",k,{override:!0}),k=null,j=null}h=null},showCatalog:function(){var a=this;this.get("trigger").on("click",function(b){var c=$(this);a.set("curTrigger",c),a.element.css({width:c.outerWidth(!0),left:c.offset().left,top:c.offset().top+c.outerHeight(!0)+5}).show(),b.stopPropagation()}),$("body").on("click",function(){a.element.hide()}),a.element.on("click",function(a){a.stopPropagation()})},setup:function(){if(!$.tsh||!$.tsh.formRequest)return alert("未检测到$.tsh.formRequest方法,请引入common.js文件!"),void 0;if(this.get("trigger")instanceof jQuery||this.set("trigger",$(this.get("trigger"))),this.set("tier",Math.max(1,Math.min(3,+this.get("tier")))),this.get("response")&&this.get("url",null),this.element.attr("id","catalog-pop").hide(),!$("#catalog-pop").length){for(var a=1;a<=this.get("tier");a++)this.element.append('<div class="catalog-tier tier-'+a+'" style="width:'+(100/this.get("tier")).toFixed(6)+'%"></div>');$("body").append(this.element)}this.getData(),this.showCatalog()}})});