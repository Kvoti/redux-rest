import assert from 'assert';
import expect from 'expect';
import sinon from 'sinon';
import nock from 'nock';

import { Endpoint, ActionTypes, ActionCreators } from '../src/reduxRest';

const VERBS = {
    list: 'get',
    create: 'post',
}

describe('ActionCreators', () => {
    describe('constructor', () => {
        ['list', 'retrieve', 'create', 'update'].forEach(action => {

            it(`should create a '${action}' method`, () => {
                let endpoint = new Endpoint('');
                let creators = new ActionCreators('endpoint', endpoint);
                assert.doesNotThrow(
                    () => creators[action]
                );
            });
            
        });
    });

    ['list', 'create'].forEach(actionType => {  // TODO is copy/paste clearer than forEach here?
        describe(`${actionType}()`, () => {
            let actionCreators;
            let dispatch;
            
            beforeEach(() => {
                // We provide a host here so we can use nock
                // TODO run these test in browser?
                let endpoint = new Endpoint('http://example.com/endpoint');
                let types = new ActionTypes('endpoint');
                actionCreators = new ActionCreators('endpoint', endpoint, types);
                dispatch = sinon.stub();
            });

            it(`should return a function that calls the ${actionType} API endpoint`, () => {
                let scope = nock('http://example.com')
                [VERBS[actionType]]('/endpoint')
                    .reply(200);
                actionCreators[actionType]()(dispatch);
                scope.done();
            });

            it(`should return a function that dispatches a pending ${actionType} action`, () => {
                let scope = nock('http://example.com')
                [VERBS[actionType]]('/endpoint')
                    .reply(200);
                actionCreators[actionType]()(dispatch);
                scope.done();
                sinon.assert.calledWith(
                    dispatch,
                    {
                        type: `endpoint_${actionType}`,
                        payload: undefined,
                        pendingID: 1
                    }
                );
            });

            it(`should return a function that dispatches a ${actionType}_success action on success`, (done) => {
                let scope = nock('http://example.com')
                [VERBS[actionType]]('/endpoint')
                    .reply(200, [{id: 1}]);
                let dispatch = (action) => {
                    if (action.type === `endpoint_${actionType}_success`) {
                        expect(action.payload).toEqual([{id: 1}]);
                        done();
                    }
                };
                actionCreators[actionType]()(dispatch);
                scope.done();
            });

            it(`should return a function that dispatches a ${actionType}_failure action on failure`, (done) => {
                let scope = nock('http://example.com')
                [VERBS[actionType]]('/endpoint')
                    .reply(400);
                let dispatch = (action) => {
                    if (action.type === `endpoint_${actionType}_failure`) {
                        done();
                    }
                };
                actionCreators[actionType]()(dispatch);
                scope.done();
            });
            
        });
    });
    
    describe('_createAction()', () => {
        let actionCreators;
        let server;
        
        beforeEach(() => {
            let endpoint = new Endpoint('endpoint');
            let types = new ActionTypes('endpoint');
            actionCreators = new ActionCreators('endpoint', endpoint, types);
        });

        it('should return a function', () => {
            expect(actionCreators._createAction()).toBeA(Function);
        });

        it('should return a function that calls API request', () => {
            let APIRequest = sinon.stub();
            let promise = {end: function () {}};
            APIRequest.returns(promise);
            
            let actionFunc = actionCreators._createAction('list', APIRequest, 'payload');
            actionFunc(() => {});
            
            assert(APIRequest.calledOnce);
            assert(APIRequest.calledWith('payload'));
        });

        it('should return a function that dispatches the given action', () => {
            let APIRequest = sinon.stub();
            let promise = {end: function () {}};
            APIRequest.returns(promise);
            let dispatch = sinon.stub();

            let actionFunc = actionCreators._createAction('list', APIRequest, 'payload');
            actionFunc(dispatch);

            assert(dispatch.calledOnce);
            sinon.assert.calledWith(dispatch, {
                type: 'endpoint_list',
                payload: 'payload',
                pendingID: 1
            });

        });

        it('should dispatch a success action if the API request succeeds', () => {
            let APIRequest = sinon.stub();
            let promise = {end: function (callback) { this.callback = callback }};
            APIRequest.returns(promise);
            let dispatch = sinon.stub();

            let actionFunc = actionCreators._createAction('list', APIRequest, 'payload');
            actionFunc(dispatch);
            promise.callback.bind(null)(null, {body: {id: 1}});
            
            sinon.assert.calledWith(dispatch, {
                type: 'endpoint_list_success',
                payload: {id: 1},
                pendingID: 1
            });
        });
        
        it('should dispatch a failure action if the API request fails');
        
    });

    describe('_getPendingID()', () => {
        it('should start at 1', () => {
            let endpoint = new Endpoint('');
            let creators = new ActionCreators('endpoint', endpoint);
            assert.equal(creators._getPendingID(), 1);
        });

        it('should increment the ID', () => {
            let endpoint = new Endpoint('');
            let creators = new ActionCreators('endpoint', endpoint);
            creators._getPendingID();
            assert.equal(creators._getPendingID(), 2);
        });
    });

    describe('_makeActionObject()', () => {
        it('should return an action', () => {
            let endpoint = new Endpoint('endpoint');
            let types = new ActionTypes('endpoint');
            let creators = new ActionCreators('endpoint', endpoint, types);
            assert.deepEqual(
                creators._makeActionObject('list', 'payload', 1),
                {
                    type: 'endpoint_list',
                    payload: 'payload',
                    pendingID: 1
                }
            );
        });

        it('should return a result action when called with a result', () => {
            let endpoint = new Endpoint('endpoint');
            let types = new ActionTypes('endpoint');
            let creators = new ActionCreators('endpoint', endpoint, types);
            assert.deepEqual(
                creators._makeActionObject('list', 'payload', 1, 'success'),
                {
                    type: 'endpoint_list_success',
                    payload: 'payload',
                    pendingID: 1
                }
            );
        });

    });
    
});
