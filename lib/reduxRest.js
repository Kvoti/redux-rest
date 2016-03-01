/**
 * Utility class to automatically create Redux reducers for REST API endpoints.
 */
// TODO make ajax library pluggable
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _itemStatus = require('./itemStatus');

var _itemStatus2 = _interopRequireDefault(_itemStatus);

exports.itemStatus = _itemStatus2['default'];
var asyncDispatch = function asyncDispatch(store) {
  return function (next) {
    return function (action) {
      return typeof action === 'function' ? action(store.dispatch, store.getState) : next(action);
    };
  };
};

exports.asyncDispatch = asyncDispatch;

var Endpoint = (function () {
  function Endpoint(url) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$withCSRF = _ref.withCSRF;
    var withCSRF = _ref$withCSRF === undefined ? false : _ref$withCSRF;
    var _ref$CSRFHeaderName = _ref.CSRFHeaderName;
    var CSRFHeaderName = _ref$CSRFHeaderName === undefined ? 'X-CSRFToken' : _ref$CSRFHeaderName;
    var _ref$CSRFCookieName = _ref.CSRFCookieName;
    var CSRFCookieName = _ref$CSRFCookieName === undefined ? 'csrftoken' : _ref$CSRFCookieName;
    var setCSRF = _ref.setCSRF;

    _classCallCheck(this, Endpoint);

    this.withCSRF = withCSRF;
    this.CSRFHeaderName = CSRFHeaderName;
    this.CSRFCookieName = CSRFCookieName;
    this.setCSRF = setCSRF;
    this.url = url;
  }

  _createClass(Endpoint, [{
    key: 'list',
    value: function list(params) {
      return _superagent2['default'].get(this.url).query(params);
    }
  }, {
    key: 'retrieve',
    value: function retrieve(id) {
      return _superagent2['default'].get(this._getObjectURL(id));
    }
  }, {
    key: 'create',
    value: function create(conf) {
      return this._setCSRFHeader(_superagent2['default'].post(this.url)).send(conf);
    }
  }, {
    key: 'update',
    value: function update(conf, id) {
      return this._setCSRFHeader(_superagent2['default'].put(this._getObjectURL(id))).send(conf);
    }
  }, {
    key: '_getObjectURL',
    value: function _getObjectURL(id) {
      var slash = '';
      if (!this.url.endsWith('/')) {
        slash = '/';
      }
      return '' + this.url + slash + id;
    }
  }, {
    key: '_setCSRFHeader',
    value: function _setCSRFHeader(request) {
      if (this.setCSRF) {
        return this.setCSRF(request);
      }
      if (!this.withCSRF) {
        return request;
      }
      if (!this._csrfSafeMethod(request.method)) {
        // && !this.crossDomain) {
        request.set(this.CSRFHeaderName, this._getCookie(this.CSRFCookieName));
      }
      return request;
    }

    // Set csrf token for ajax requests
    // See https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
  }, {
    key: '_getCookie',
    value: function _getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
  }, {
    key: '_csrfSafeMethod',
    value: function _csrfSafeMethod(method) {
      // these HTTP methods do not require CSRF protection
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
      );
    }
  }]);

  return Endpoint;
})();

exports.Endpoint = Endpoint;

var ActionTypes = (function () {
  function ActionTypes(endpointName) {
    var _this = this;

    _classCallCheck(this, ActionTypes);

    this.endpointName = endpointName;
    ['list', 'retrieve', 'create', 'update'].forEach(function (action) {
      _this['' + action] = _this.getConstant(action);
      ['success', 'failure'].forEach(function (result) {
        _this[action + '_' + result] = _this.getConstant(action, result);
      });
    });
  }

  _createClass(ActionTypes, [{
    key: 'getConstant',
    value: function getConstant(action, result) {
      var constant = this.endpointName + '_' + action;
      if (result) {
        constant = constant + '_' + result;
      }
      return constant;
    }
  }]);

  return ActionTypes;
})();

exports.ActionTypes = ActionTypes;

var ActionCreators = (function () {
  function ActionCreators(endpointName, API, actionTypes) {
    var _this2 = this;

    _classCallCheck(this, ActionCreators);

    this.actionTypes = actionTypes;
    this._pendingID = 0;
    ['list', 'retrieve', 'create', 'update'].forEach(function (action) {
      _this2[action] = _this2._createAction.bind(_this2, action, API[action].bind(API));
    });
  }

  _createClass(ActionCreators, [{
    key: '_createAction',
    value: function _createAction(action, apiRequest, payload, objectID) {
      var _this3 = this;

      return function (dispatch) {
        var pendingID = _this3._getPendingID();
        var call = apiRequest(payload, objectID).end(function (err, res) {
          if (err) {
            dispatch(_this3._failure(action, 'error', pendingID));
          } else {
            dispatch(_this3._success(action, res.body, pendingID));
          }
        });
        dispatch(_this3._pending(action, payload, pendingID));
        return call;
      };
    }
  }, {
    key: '_success',
    value: function _success() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this._makeActionObject.apply(this, args.concat(['success']));
    }
  }, {
    key: '_failure',
    value: function _failure() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return this._makeActionObject.apply(this, args.concat(['failure']));
    }
  }, {
    key: '_pending',
    value: function _pending() {
      return this._makeActionObject.apply(this, arguments);
    }
  }, {
    key: '_makeActionObject',
    value: function _makeActionObject(action, payload, pendingID, result) {
      var actionType = this.actionTypes.getConstant(action, result);
      return {
        type: actionType,
        payload: payload,
        pendingID: pendingID
      };
    }
  }, {
    key: '_getPendingID',
    value: function _getPendingID() {
      this._pendingID += 1;
      return this._pendingID;
    }
  }]);

  return ActionCreators;
})();

exports.ActionCreators = ActionCreators;

var BaseReducer = (function () {
  function BaseReducer(actionTypes) {
    _classCallCheck(this, BaseReducer);

    this.actionTypes = actionTypes;
  }

  _createClass(BaseReducer, [{
    key: 'getReducer',
    value: function getReducer() {
      return this._reducer.bind(this);
    }
  }, {
    key: '_getItem',
    value: function _getItem(state, key, value) {
      return state.find(function (item) {
        return item[key] === value;
      });
    }
  }, {
    key: '_replaceItem',
    value: function _replaceItem(state, key, value, newItem) {
      var index = state.findIndex(function (item) {
        return item[key] === value;
      });
      var newState = [].concat(_toConsumableArray(state));
      newState.splice(index, 1, newItem);
      return newState;
    }
  }]);

  return BaseReducer;
})();

var ItemReducer = (function (_BaseReducer) {
  _inherits(ItemReducer, _BaseReducer);

  function ItemReducer() {
    _classCallCheck(this, ItemReducer);

    _get(Object.getPrototypeOf(ItemReducer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ItemReducer, [{
    key: '_reducer',
    value: function _reducer(state, action) {
      if (state === undefined) state = [];

      var item = undefined;
      if (action.type === this.actionTypes.create) {
        item = _extends({}, action.payload, { status: _itemStatus2['default'].pending, pendingID: action.pendingID });
        return [].concat(_toConsumableArray(state), [item]);
      } else if (action.type === this.actionTypes.create_success) {
        item = _extends({}, action.payload, { status: _itemStatus2['default'].saved });
        return this._replaceItem(state, 'pendingID', action.pendingID, item);
      } else if (action.type === this.actionTypes.create_failure) {
        item = this._getItem(state, 'pendingID', action.pendingID);
        item.status = _itemStatus2['default'].failed;
        return this._replaceItem(state, 'pendingID', action.pendingID, item);
      } else if (action.type === this.actionTypes.update) {
        item = _extends({}, action.payload, { status: _itemStatus2['default'].pending });
        // TODO shouldn't hardcode 'id' field
        return this._replaceItem(state, 'id', item.id, item);
      } else if (action.type === this.actionTypes.update_success) {
        item = _extends({}, action.payload, { status: _itemStatus2['default'].saved });
        // TODO shouldn't hardcode 'id' field
        return this._replaceItem(state, 'id', item.id, item);
      } else if (action.type === this.actionTypes.update_failure) {
        item = _extends({}, action.payload, { status: _itemStatus2['default'].failed });
        // TODO shouldn't hardcode 'id' field
        return this._replaceItem(state, 'id', item.id, item);
      } else if (action.type === this.actionTypes.list_success) {
        return [].concat(_toConsumableArray(action.payload));
      }
      return state;
    }
  }]);

  return ItemReducer;
})(BaseReducer);

exports.ItemReducer = ItemReducer;

var CollectionReducer = (function (_BaseReducer2) {
  _inherits(CollectionReducer, _BaseReducer2);

  function CollectionReducer() {
    _classCallCheck(this, CollectionReducer);

    _get(Object.getPrototypeOf(CollectionReducer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CollectionReducer, [{
    key: '_reducer',
    value: function _reducer(state, action) {
      if (state === undefined) state = [];

      var item = undefined;
      if (action.type === this.actionTypes.list) {
        item = {
          action: 'list',
          status: _itemStatus2['default'].pending,
          pendingID: action.pendingID
        };
        return [].concat(_toConsumableArray(state), [item]);
      } else if (action.type === this.actionTypes.list_success) {
        item = { action: 'list', status: _itemStatus2['default'].saved };
        return this._replaceItem(state, 'pendingID', action.pendingID, item);
      } else if (action.type === this.actionTypes.list_failure) {
        item = { action: 'list', status: _itemStatus2['default'].failed };
        return this._replaceItem(state, 'pendingID', action.pendingID, item);
      }

      return state;
    }
  }]);

  return CollectionReducer;
})(BaseReducer);

exports.CollectionReducer = CollectionReducer;

var Flux = function Flux(APIConf, CSRFOptions) {
  _classCallCheck(this, Flux);

  this.API = {};
  this.actionTypes = {};
  this.actionCreators = {};
  this.reducers = {};
  for (var endpointName in APIConf) {
    if (APIConf.hasOwnProperty(endpointName)) {
      var url = APIConf[endpointName];
      this.API[endpointName] = new Endpoint(url, CSRFOptions);
      this.actionTypes[endpointName] = new ActionTypes(endpointName);
      this.actionCreators[endpointName] = new ActionCreators(endpointName, this.API[endpointName], this.actionTypes[endpointName]);
      this.reducers[endpointName + '_items'] = new ItemReducer(this.actionTypes[endpointName]).getReducer();
      this.reducers[endpointName + '_collection'] = new CollectionReducer(this.actionTypes[endpointName]).getReducer();
    }
  }
};

exports['default'] = Flux;