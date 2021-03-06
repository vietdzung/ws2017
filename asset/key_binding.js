Game.KeyBinding = {
  _availableBindings: ['numpad', 'waxd'],
  _curBindingKey: '',
  _currentBindingLookup: {},
  _bindingHelpText: '',

  setKeyBinding:function (bindingSetKey) {
    this._curBindingKey = bindingSetKey || 'waxd';
    this.calcBindingLookups();
  },

  getKeyBinding:function () {
    return this._curBindingKey;
  },

  swapToNextKeyBinding: function () {
    var nextBindingIndex = this._availableBindings.indexOf(this._curBindingKey);
    if (nextBindingIndex < 0) { return; } // can only swap to next if the current is in the 'available' list - prevents swapping away from special sets like 'persist'
    nextBindingIndex++;
    if (nextBindingIndex >= this._availableBindings.length) {
      nextBindingIndex = 0;
    }
    this.setKeyBinding(this._availableBindings[nextBindingIndex]);
    Game.Message.ageMessages();
    this.informPlayer();
  },

  informPlayer: function () {
    Game.Message.send('using ' + this._curBindingKey + ' key bindings');
    Game.renderMessage();
  },

  calcBindingLookups: function () {
    this._currentBindingLookup = {
      keydown: {
        nometa: {},
        ctrlshift: {},
        shift: {},
        ctrl: {}
      },
      keypress: {
        nometa: {},
        ctrlshift: {},
        shift: {},
        ctrl: {}
      }
    };

    var bindingHelpInfo = [];
    for (var actionLookupKey in this.Action) {
      if (this.Action.hasOwnProperty(actionLookupKey)) {
        var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
        if (bindingInfo) {
          var metaKey = 'nometa';
          if (bindingInfo.inputMetaCtrl && bindingInfo.inputMetaShift) {
            metaKey = 'ctrlshift';
          } else if (bindingInfo.inputMetaShift) {
            metaKey = 'shift';
          } else if (bindingInfo.inputMetaCtrl) {
            metaKey = 'ctrl';
          }

          this._currentBindingLookup[bindingInfo.inputType][metaKey][bindingInfo.inputMatch] = {
            actionKey: actionLookupKey,
            boundLabel: bindingInfo.label,
            binding: bindingInfo,
            action: Game.KeyBinding.Action[actionLookupKey]
          };

          bindingHelpInfo.push(actionLookupKey);
        }
      }
    }

    bindingHelpInfo.sort(function (a, b) {
      if (Game.KeyBinding.Action[a].ordering != Game.KeyBinding.Action[b].ordering) {
        return a - b;
      }
      return (Game.KeyBinding.Action[a].short < Game.KeyBinding.Action[b].short) ? -1 : ((Game.KeyBinding.Action[a].short > Game.KeyBinding.Action[b].short) ? 1 : 0);
    });

    this._bindingHelpText = '';
    var hasBaseMovements = false;
    var previousOrdering = 1;
    for (var i = 0; i < bindingHelpInfo.length; i++) {
      var curAction = Game.KeyBinding.Action[bindingHelpInfo[i]];

      if (curAction.action_group != 'base_movement') {
        if (Math.floor(previousOrdering) != Math.floor(curAction.ordering)) {
          this._bindingHelpText += "\n";
          }
        this._bindingHelpText += curAction[curAction.hasOwnProperty(this._curBindingKey) ? this._curBindingKey : 'all'].label + '  ' + curAction.long + "\n";
        previousOrdering = curAction.ordering;
      } else {
        hasBaseMovements = true;
        }
      }
    if (hasBaseMovements) {
      var movementHelpTemplate = "-------\n|  mU  |\n|  |  |\n|mL-mW-mR|\n|  |  |\n|  mD  |\n-------";
      movementHelpTemplate = movementHelpTemplate.replace('mU',Game.KeyBinding.Action.MOVE_U[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mL',Game.KeyBinding.Action.MOVE_L[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mW',Game.KeyBinding.Action.MOVE_WAIT[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mR',Game.KeyBinding.Action.MOVE_R[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mD',Game.KeyBinding.Action.MOVE_D[this._curBindingKey].label);
      this._bindingHelpText = "Movement\n"+movementHelpTemplate + "\n"+ this._bindingHelpText;
    }
  },

  getInputBinding: function (inputType,inputData) {
    var metaKey = 'nometa';
    if (inputData.ctrlKey && inputData.shiftKey) {
      metaKey = 'ctrlshift';
    } else if (inputData.shiftKey) {
      metaKey = 'shift';
    } else if (inputData.ctrlKey) {
      metaKey = 'ctrl';
    }
    var bindingKey = inputData.keyCode;
    if (inputType === 'keypress') {
        bindingKey = String.fromCharCode(inputData.charCode);
    }
    return this._currentBindingLookup[inputType][metaKey][bindingKey] || false;
  },

  getLabelForAction: function (actionLookupKey) {
    if (!this.Action[actionLookupKey]) {
      return '';
    }
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo.label;
    }
    return '';
  },

  getBindingForAction: function (actionLookupKey) {
    if (!this.Action[actionLookupKey]) {
      return '';
    }
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo;
    }
    return '';
  },

  getBindingHelpText: function() {
    return this._bindingHelpText;
  },

  Action: {
    HELP : {action_group:'meta' ,guid :Game.util.uniqueID() ,ordering:1.1 ,short:'help' ,long:'show which keys do which commands',
      all: {label:'?'     ,inputMatch:'/'      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    CHANGE_BINDINGS : {action_group:'meta' ,guid :Game.util.uniqueID() ,ordering:1.2 ,short:'controls' ,long:'change which keys do which commands',
      numpad: {label:'\\', inputMatch:ROT.VK_BACK_SLASH ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false},
      waxd: {label:'\\', inputMatch:ROT.VK_BACK_SLASH ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    CANCEL: {action_group:'meta' ,guid :Game.util.uniqueID() ,ordering:1.3 ,short:'cancel'   ,long:'cancel/close the current action/screen',
      all: {label:'Esc' ,inputMatch:ROT.VK_ESCAPE     ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    PERSISTENCE: {action_group: 'meta', guid: Game.util.uniqueID(), ordering: 2, short:'games', long: 'save, load or start a new game',
      numpad: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false},
      waxd: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PERSISTENCE_SAVE : {action_group:'persist' ,guid:Game.util.uniqueID() ,ordering:2.1 ,short:'save'     ,long :'save the current game',
      persist: {label:'s' ,inputMatch:ROT.VK_S ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PERSISTENCE_LOAD : {action_group:'persist' ,guid:Game.util.uniqueID() ,ordering:2.2 ,short:'load'  ,long :'load a saved game',
      persist: {label:'l' ,inputMatch:ROT.VK_L ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PERSISTENCE_NEW  : {action_group:'persist' ,guid:Game.util.uniqueID() ,ordering:2.3 ,short:'new game' ,long :'start a new game',
      persist: {label:'n' ,inputMatch:ROT.VK_N ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },

    MOVE_U    : {action_group:'base_movement' ,guid:Game.util.uniqueID() ,ordering:3 ,short:'move' ,long :'move straight up',
      numpad: {label:'8' ,inputMatch:ROT.VK_NUMPAD8 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'w' ,inputMatch:ROT.VK_W       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_L    : {action_group:'base_movement' ,guid:Game.util.uniqueID() ,ordering:3 ,short:'move' ,long :'move straight left',
      numpad: {label:'4' ,inputMatch:ROT.VK_NUMPAD4 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'a' ,inputMatch:ROT.VK_A       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_WAIT : {action_group:'base_movement' ,guid:Game.util.uniqueID() ,ordering:3 ,short:'move' ,long :'move nowhere - wait one turn',
      numpad: {label:'5' ,inputMatch:ROT.VK_NUMPAD5 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'s' ,inputMatch:ROT.VK_S       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_R    : {action_group:'base_movement' ,guid:Game.util.uniqueID() ,ordering:3 ,short:'move' ,long :'move straight right',
      numpad: {label:'6' ,inputMatch:ROT.VK_NUMPAD6 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'d' ,inputMatch:ROT.VK_D       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_D    : {action_group:'base_movement' ,guid:Game.util.uniqueID() ,ordering:3 ,short:'move' ,long :'move straight down',
      numpad: {label:'2' ,inputMatch:ROT.VK_NUMPAD2 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'x' ,inputMatch:ROT.VK_X       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    SHOOT   : {action_group:'attack', guid:Game.util.uniqueID(), ordering:4.1, short:'shoot' ,long: 'shoot chakra ball in current direction',
      numpad: {label:'0' ,inputMatch:ROT.VK_NUMPAD0 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'j' ,inputMatch:ROT.VK_J       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    NEXT_ELEM   : {action_group:'attack', guid:Game.util.uniqueID(), ordering:4.2, short:'next elem' ,long: 'switch to next element available',
      numpad: {label:'1' ,inputMatch:ROT.VK_NUMPAD1 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'l' ,inputMatch:ROT.VK_L       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PREV_ELEM   : {action_group:'attack', guid:Game.util.uniqueID(), ordering:4.3, short:'previous elem' ,long: 'switch to previous element available',
      numpad: {label:'7' ,inputMatch:ROT.VK_NUMPAD7 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'k' ,inputMatch:ROT.VK_K       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    INVENTORY : {action_group:'inventory' ,guid: Game.util.uniqueID() ,ordering:5.0, short:'inventory'  ,long :'open inventory' ,
      numpad: {label:'i' ,inputMatch:ROT.VK_I ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'i' ,inputMatch:ROT.VK_I ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PROCESS_SELECTIONS  : {action_group:'inventory' ,guid:Game.util.uniqueID() ,ordering:5.1 ,short:'act on' ,long :'take action with/on selected items'         ,
      LAYER_inventoryListing: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      LAYER_inventoryDrop: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      LAYER_inventoryPickup: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false},
      LAYER_inventoryExamine: {label:'[Enter]' ,inputMatch:ROT.VK_RETURN ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    PICKUP : {action_group:'inventory' ,guid:Game.util.uniqueID() ,ordering:5.2, short:'pickup'  ,long :'pick up one or more items in the current space' ,
      numpad: {label:'e' ,inputMatch:ROT.VK_E ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'e' ,inputMatch:ROT.VK_E ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    DROP   : {action_group:'inventory' ,guid:Game.util.uniqueID() ,ordering:5.3, short:'drop' ,long :'drop one or more items in the current space'         ,
      LAYER_inventoryListing: {label:'D' ,inputMatch:ROT.VK_D ,inputType:'keydown' ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    EXAMINE : {action_group:'inventory' ,guid:Game.util.uniqueID() ,ordering:5.4 ,short:'examine' ,long :'examine the position right in front of you',
      numpad: {label:'r' ,inputMatch:ROT.VK_R ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false} ,
      waxd  : {label:'r' ,inputMatch:ROT.VK_R ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    },

    DATA_NAV_UP : {action_group:'data_nav' ,guid:Game.util.uniqueID() ,ordering:8.1 ,short:'down' ,long :'scroll content down',
      all: {label:']'     ,inputMatch:']'      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    DATA_NAV_DOWN : {action_group:'data_nav' ,guid:Game.util.uniqueID() ,ordering:8.2 ,short:'up' ,long :'scroll content up',
      all: {label:'['     ,inputMatch:'['      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MISC : {action_group:'data_nav', guid:Game.util.uniqueID() ,ordering:8.3 ,short:'down' ,long :'scroll content down',
      LAYER_textReading: {label:'c'     ,inputMatch:'c'      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    CHEAT : {action_group:'data_nav', guid:Game.util.uniqueID() ,ordering:8.4 ,short:'down' ,long :'scroll content down',
    numpad: {label:'p' ,inputMatch:ROT.VK_P ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false} ,
    waxd  : {label:'p' ,inputMatch:ROT.VK_P ,inputType:'keydown' ,inputMetaShift:false  ,inputMetaCtrl:false}
    }
  }
};
