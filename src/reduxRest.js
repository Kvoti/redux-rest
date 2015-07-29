/**
* Utility class to automatically create Redux reducers for REST API endpoints.
*/
import request from 'superagent';
import itemStatus from './itemStatus';

export default class Flux {
    constructor (APIConf) {
        this.API = {};
        this.actionTypes = {};
        this.actionCreators = {};
        this.reducers = {};
        for (let endpointName in APIConf) {
            let url = APIConf[endpointName];
            this.API[endpointName] = new Endpoint(url);
            this.actionTypes[endpointName] = new ActionTypes(endpointName);
            this.actionCreators[endpointName] = new ActionCreators(
                endpointName,
                this.API[endpointName],
                this.actionTypes[endpointName]
            );
            this.reducers[endpointName] = new Reducer(
                this.actionTypes[endpointName]).getReducer();
        }
    }
}

export class Endpoint {
    constructor (url) {
        this.url = url;
    }

    list (params) {
        return request.get(this.url).query(params);
    }
    
    retrieve (id) {
        return request.get(this._getObjectURL(id));
    }
    
    create (conf) {
        return request.post(this.url).send(conf);
    }
    
    update (conf, id) {
        return request.put(this._getObjectURL(id)).send(conf);
    }

    _getObjectURL (id) {
        let slash;
        if (!this.url.endsWith('/')) {
            slash = '/';
        }
        return `${this.url}${slash}${id}`;
    }
        
}

export class ActionTypes {
    constructor (endpointName) {
        this.endpointName = endpointName;
        ['list', 'retrieve', 'create', 'update'].forEach(action => {
            this[`${action}`] = this.getConstant(action);
            ['success', 'failure'].forEach(result => {
                this[`${action}_${result}`] = this.getConstant(action, result);
            });
        });
    }

    getConstant (action, result) {
        let constant = `${this.endpointName}_${action}`;
        if (result) {
            constant = `${constant}_${result}`;
        }
        return constant;
    }
}

export class ActionCreators {
    constructor (endpointName, API, actionTypes) {
        this.actionTypes = actionTypes;
        this._pendingID = 0;
        ['list', 'retrieve', 'create', 'update'].forEach(action => {
            this[action] = this._createAction.bind(this, action, API[action].bind(API));
        });
    }

    _createAction (action, APIRequest, payload, objectID) {
        return (dispatch) => {
            let pendingID = this._getPendingID();
            let call = APIRequest(payload, objectID)
                .end((err, res) => {
                    if (err) {
                        dispatch(this._failure(action, "error", pendingID));
                    } else {
                        dispatch(this._success(action, res.body, pendingID));
                    }
                })
            dispatch(this._pending(action, payload, pendingID));
            return call;
        }
    }

    _success (...args) {
        return this._makeActionObject(...args, 'success');
    }

    _failure (...args) {
        return this._makeActionObject(...args, 'failure');
    }
    
    _pending (...args) {
        return this._makeActionObject(...args);
    }
    
    _makeActionObject (action, payload, pendingID, result) {
        let actionType = this.actionTypes.getConstant(action, result);
        return {
            type: actionType,
            payload: payload,
            pendingID: pendingID,
        };
    }
    
    _getPendingID() {
        this._pendingID += 1;
        return this._pendingID;
    }
}

export class Reducer {
    constructor (actionTypes) {
        this.actionTypes = actionTypes;
    }

    getReducer () {
        return this._reducer.bind(this);
    }

    // TODO easier to split into separate reducers to handle the collection and the items?
    // TODO use ImmutableJS for easier state munging
    // TODO throw error on overlapping pending actions?
    _reducer (state = {collection: [], items: []}, action) {
        let item;
        if (action.type === this.actionTypes.create) {
            item = {...action.payload, status: itemStatus.pending, pendingID: action.pendingID};
            return {
                collection: state.collection,
                items: [...state.items, item]
            };
            
        } else if (action.type === this.actionTypes.create_success) {
            let item = {...action.payload, status: itemStatus.saved};
            return this._replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === this.actionTypes.create_failure) {
            item = this._getItem(state, 'pendingID', action.pendingID);
            item.status = itemStatus.failed;
            return this._replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === this.actionTypes.list) {
            let newState = {
                items: state.items
            }
            let metaItem = {
                action: 'list',
                pendingID: action.pendingID,
                status: itemStatus.pending
            }
            newState.collection = [...state.collection, metaItem];
            return newState;
            
        } else if (action.type === this.actionTypes.list_success) {
            let newItems = [...action.payload];
            
            
            return 
        }

    }

    _getItem (state, key, value) {
        return state.items.find(item => item[key] === value);
    }

    _replaceItem (state, key, value, item) {
        let index = state.items.findIndex(item => item[key] === value);
        let newItems = [...state.items];
        newItems.splice(index, 1, item);
        let newState = {
            collection: state.collection,
            items: newItems
        };
        return newState;
    }
}
