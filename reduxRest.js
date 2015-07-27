/**
* 
* Utility class to automatically create Flux stores for REST API endpoints.
* 
* Designed to be used with Redux.
* 
* E.g.
* 
*     let flux = new Flux({chatrooms: 'chat/rooms/'});
* 
* automatically creates a reducer that handles standard REST actions such as
* create, list, retrieve.
* 
* Initialising redux is as simple as
* 
*     let redux = createRedux(flux.reducers);
* 
* Calling actions is as simple as
* 
*     flux.actionCreators.chatrooms.create(roomConf);
* 
* New objects are added to the state with a status of 'pending' until the API
* request either succeeds or fails, at which point the status is updated.
* 
*/
import { get, post, put } from '../../../js/request';
import itemStatus from './itemStatus';

export default class Flux {
    constructor (tenant, APIConf) {
        this.API = {};
        this.actionTypes = {};
        this.actionCreators = {};
        this.reducers = {};
        for (let endpointName in APIConf) {
            let url = APIConf[endpointName];
            this.API[endpointName] = new Endpoint(tenant, url);
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

class Endpoint {
    constructor (tenant, url) {
        this.url = this._getFullUrl(tenant, url);
    }

    list (params) {
        return get(this.url, params);
    }
    
    retrieve (id, params) {
        return get(this._getObjectURL(id), params);
    }
    
    create (conf) {
        return post(this.url, conf);
    }
    
    update (id, conf) {
        return put(this._getObjectURL(id), conf);
    }

    partialUpdate (...args) {
        return this.update(...args);
    }

    _getFullUrl (tenant, url) {
        return `/${tenant}/api/${url}`;
    }

    _getObjectURL (id) {
        return `${this.url}${id}/`;
    }
        
}

class ActionTypes {
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

class ActionCreators {
    constructor (endpointName, API, actionTypes) {
        this.actionTypes = actionTypes;
        this._pendingID = 0;
        ['list', 'retrieve', 'create', 'update'].forEach(action => {
            this[action] = this._createAction.bind(this, action, API[action].bind(API));
        });
    }

    _createAction (action, APIRequest, payload) {
        return (dispatch) => {
            let pendingID = this._getPendingID();
            let call = APIRequest(payload)
                .done(res => {
                    dispatch(this._success(action, res, pendingID));
                })
                .fail((jqXHR, textStatus, error) => {
                    dispatch(this._failure(action, textStatus, pendingID));
                })
            return dispatch(this._pending(action, payload, pendingID));
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

class Reducer {
    constructor (actionTypes) {
        this.actionTypes = actionTypes;
    }

    getReducer () {
        return this._reducer.bind(this);
    }
    
    _reducer (state = [], action) {
        console.log('got action', action);
        let item;
        if (action.type === this.actionTypes.create) {
            item = {...action.payload, status: itemStatus.pending, pendingID: action.pendingID};
            return [...state, item];
            
        } else if (action.type === this.actionTypes.create_success) {
            let item = {...action.payload, status: itemStatus.saved};
            return this._replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === this.actionTypes.create_failure) {
            item = this._getItem(state, 'pendingID', action.pendingID);
            item.status = itemStatus.failed;
            return this._replaceItem(state, 'pendingID', action.pendingID, item);

        } else if (action.type === this.actionTypes.list_success) {
            console.log('adding items', action.payload);
            return [...action.payload];
        }
        // TODO handle rest of actionTypes!
    }

    _getItem (state, key, value) {
        return state.find(item => item[key] === value);
    }

    _replaceItem (state, key, value, item) {
        let index = state.findIndex(item => item[key] === value);
        let newState = [...state];
        newState.splice(index, 1, item);
        return newState;
    }
}
