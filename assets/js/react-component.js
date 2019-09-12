

var reactDemo = {
    canvas: null,
    
    init: function() {
        this.canvas = new fabric.Canvas('artifiCanvas');
        this.canvas.setBackgroundImage('./assets/img/product/red-tshirt.jpg', this.canvas.renderAll.bind(this.canvas));
        this.textComponent._this = this;
        this.textComponent.init();
        this.storeSubscribe();

        this.initFabricEvents();
    },
    textComponent: {
        _this: null,
        textComponentContainer: '',
        init: function() {
        
            ReactDOM.render(React.createElement(window.Artifi.TextComponent.TextComponent), document.getElementById(this.textComponentContainer));
            
            var textInitData = {
                config: {
                  debug: true,
                  allowAdd: true
                }
              }
              
              window._Artifi.Store.dispatch({ type: window.Artifi.TextComponent.TextActions.INIT, payload: textInitData });
        },
        addWidget: function(data){
            var _this = this._this;
            var oText = new fabric.Text('Enter Text', { 
                left: 225, 
                top: 200,
                fontFamily: 'Arial',
                fontSize: 8,
                cache:false,
                id: _Artifi.Store.getState().textComponent.selctedWidget
            });
           
            _this.canvas.on("text:editing:entered", clearText);
           
            function clearText(e){
               if(e.target.type === "i-text"){
                   if(e.target.text === "Tap and Type"){
                       e.target.text = "";
                       _this.canvas.renderAll();
                    };
                }
             }
             console.log(oText);
             _this.canvas.add(oText);
             _this.canvas.setActiveObject(oText);
        },
        updateWidget: function(data){
            var _this = this._this;
            var activeObject = _this.canvas.getActiveObject();
            switch(data.type){
                case "fontSize":
                    activeObject.set('fontSize',data.value);
                    break;
                case "bold":
                    activeObject.set('fontWeight',data.value ? 'bold': '');
                    break;
                case "italic":
                    activeObject.set('fontStyle',data.value ? 'italic': '');
                    break;
                case "value":
                    activeObject.set('text',data.value);
                    break;
                case "color":
                    activeObject.set('fill',data.value);
                    break;
                case "strokeColor":
                    activeObject.set('stroke',data.value.strokeColor.value);
                    activeObject.set('strokeWidth',data.value.strokeColor.value);
                    break;
                case 'fontFamily':
                    activeObject.set('fontFamily',data.value);
                    break;                    
                    // strokeWidth
                default:
                    if(typeof data.shadow != 'undefined'){
                        var shadowData = data.shadow;
                        if(shadowData.isApplied){
                            activeObject.set('shadow',{
                                color: shadowData.color,
                                blur: shadowData.blur,    
                                offsetX: shadowData.offsetX,
                                offsetY: shadowData.offsetY,
                                opacity: shadowData.opacity
                            });
                        }else {
                            activeObject.set('shadow',{});
                        }
                    }
                    break;
            }
            _this.canvas.renderAll();
        },
        removeSelection: function(){
            window._Artifi.Store.dispatch({ type: window.Artifi.TextComponent.TextActions.REMOVE_SELECTED_WIDGET, payload: {} });
        },
        selectWidget: function(id){
            var _this = this._this;
            _this.canvas.getObjects().forEach(function(o) {
                if(o.id == id) {
                    _this.canvas.setActiveObject(o);
                    _this.canvas.renderAll();
                }
            })
        },
        selectWidgetFromCanvas: function(id){
            if(window._Artifi.Store.getState().textComponent.selctedWidget != id){
                window._Artifi.Store.dispatch({ type: window.Artifi.TextComponent.TextActions.SELECT_TEXT_WIDGET, payload: id });
            }            
        }
    },
    storeSubscribe: function () {
        var _this = this;

        window._Artifi.Store.subscribe(function(){
            var lastAction = window._Artifi.Store.getState().lastAction;
            
            switch(lastAction.type) {
                case Artifi.TextComponent.TextActions.ADD_TEXT_WIDGET:
                    _this.textComponent.addWidget(lastAction.payload);
                    break;
                case Artifi.TextComponent.TextActions.EFFECT_UPDATE: 
                    _this.textComponent.updateWidget(lastAction.payload);
                    break;
                case Artifi.TextComponent.TextActions.UPDATE_WIDGET: 
                    _this.textComponent.updateWidget(lastAction.payload);
                    break;
                case Artifi.TextComponent.TextActions.SELECT_TEXT_WIDGET: 
                    _this.textComponent.selectWidget(lastAction.payload);
                    break;
                default:
                    console.log(lastAction)
                    break;
            }
        })

    },

    initFabricEvents: function() {
        var _this = this;
        this.canvas.on('selection:cleared', function (options) {
            if(options.deselected[0].get('type') == 'text'){
                _this.textComponent.removeSelection();
            }
       });

        this.canvas.on('selection:created', function (options) {
            if(options.selected[0].get('type') == 'text'){
                _this.textComponent.selectWidgetFromCanvas(_this.canvas.getActiveObject().id);
            }
        })

        this.canvas.on('selection:updated', function (options) {
            if(options.selected[0].get('type') == 'text'){
                _this.textComponent.selectWidgetFromCanvas(_this.canvas.getActiveObject().id);
            }
        })
    }
}