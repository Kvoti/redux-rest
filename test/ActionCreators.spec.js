import assert from 'assert';
import expect from 'expect';
import sinon from 'sinon';
import nock from 'nock';

import { Endpoint, ActionTypes, ActionCreators } from '../src/reduxRest';

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

  let tests = [
    {
      actionType: 'list',
      actionArgs: [],
      expectedHTTPMethod: 'get',
      expectedURL: '/endpoint',
      expectedRequestBody: '',
      response: [{id: 1}],
      expectedPayload: {
        pending: undefined,
        success: [{id: 1}],
        failure: 'error'
      }
    },
    {
      actionType: 'create',
      actionArgs: [{id: 1}],
      expectedHTTPMethod: 'post',
      expectedURL: '/endpoint',
      expectedRequestBody: {id: 1},
      response: {id: 1},
      expectedPayload: {
        pending: {id: 1},
        success: {id: 1},
        failure: 'error'
      }
    },
    {
      actionType: 'retrieve',
      actionArgs: [1],
      expectedHTTPMethod: 'get',
      expectedURL: '/endpoint/1',
      expectedRequestBody: '',
      response: {id: 1},
      expectedPayload: {
        pending: 1,
        success: {id: 1},
        failure: 'error'
      }
    },
    {
      actionType: 'update',
      actionArgs: [{id: 1, key: 'value'}, 1],
      expectedHTTPMethod: 'put',
      expectedURL: '/endpoint/1',
      expectedRequestBody: {id: 1, key: 'value'},
      response: {id: 1, key: 'value'},
      expectedPayload: {
        pending: {id: 1, key: 'value'},
        success: {id: 1, key: 'value'},
        failure: 'error'
      }
    }
  ];

  tests.forEach(test => {
    describe(`${test.actionType}()`, () => {
      let actionCreators;

      beforeEach(() => {
        // We provide a host here so we can use nock
        // TODO run these test in browser?
        let endpoint = new Endpoint('http://example.com/endpoint');
        let types = new ActionTypes('endpoint');
        actionCreators = new ActionCreators('endpoint', endpoint, types);
      });

      it(`should return a function that calls the ${test.actionType} API endpoint`, () => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(200);
        let dispatch = sinon.stub();

        actionCreators[test.actionType](...test.actionArgs)(dispatch);

        scope.done();
      });

      it(`should return a function that dispatches a pending ${test.actionType} action`, () => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(200);
        let dispatch = sinon.stub();

        actionCreators[test.actionType](...test.actionArgs)(dispatch);

        scope.done();
        sinon.assert.calledWith(
          dispatch,
          sinon.match({type: `endpoint_${test.actionType}`})
        );
      });

      it(`should return a function that dispatches a pending ${test.actionType} action with correct payload`, () => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(200);
        let dispatch = sinon.stub();

        actionCreators[test.actionType](...test.actionArgs)(dispatch);

        scope.done();
        sinon.assert.calledWith(
          dispatch,
          sinon.match({payload: test.expectedPayload.pending})
        );
      });

      it(`should return a function that dispatches a ${test.actionType}_success action on success`, (done) => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(200, test.response);
        let dispatch = (action) => {
          if (action.type === `endpoint_${test.actionType}_success`) {
            done();
          }
        };
        actionCreators[test.actionType](...test.actionArgs)(dispatch);
        scope.done();
      });

      it(`should return a function that dispatches a ${test.actionType}_success action on success with correct payload`, (done) => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(200, test.response);
        let dispatch = (action) => {
          if (action.type === `endpoint_${test.actionType}_success`) {
            expect(action.payload).toEqual(test.expectedPayload.success);
            done();
          }
        };
        actionCreators[test.actionType](...test.actionArgs)(dispatch);
        scope.done();
      });

      it(`should return a function that dispatches a ${test.actionType}_failure action on failure`, (done) => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(400);
        let dispatch = (action) => {
          if (action.type === `endpoint_${test.actionType}_failure`) {
            done();
          }
        };
        actionCreators[test.actionType](...test.actionArgs)(dispatch);
        scope.done();
      });

      it(`should return a function that dispatches a ${test.actionType}_failure action on failure with correct payload`, (done) => {
        let scope = nock('http://example.com')
        [test.expectedHTTPMethod](test.expectedURL, test.expectedRequestBody)
          .reply(400);
        let dispatch = (action) => {
          if (action.type === `endpoint_${test.actionType}_failure`) {
            expect(action.payload).toEqual(test.expectedPayload.failure);
            done();
          }
        };
        actionCreators[test.actionType](...test.actionArgs)(dispatch);
        scope.done();
      });

    });
  });

  describe('_createAction()', () => {
    let actionCreators;

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
      let promise = {end: function() {}};
      APIRequest.returns(promise);

      let actionFunc = actionCreators._createAction('list', APIRequest, 'payload');
      actionFunc(() => {});

      assert(APIRequest.calledOnce);
      assert(APIRequest.calledWith('payload'));
    });

    it('should return a function that dispatches the given action', () => {
      let APIRequest = sinon.stub();
      let promise = {end: function() {}};
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
      let promise = {end: function(callback) { this.callback = callback; }};
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

    it('should dispatch a failure action if the API request fails', () => {
      let APIRequest = sinon.stub();
      let promise = {end: function(callback) { this.callback = callback; }};
      APIRequest.returns(promise);
      let dispatch = sinon.stub();

      let actionFunc = actionCreators._createAction('list', APIRequest, 'payload');
      actionFunc(dispatch);
      promise.callback.bind(null)('error');

      sinon.assert.calledWith(dispatch, {
        type: 'endpoint_list_failure',
        payload: 'error',
        pendingID: 1
      });
    });

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
