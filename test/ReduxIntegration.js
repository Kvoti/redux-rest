import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import expect from 'expect';
import nock from 'nock';

import API from '../src/reduxRest';

describe('API', () => {
  it('should integrate with redux', () => {
    const myAPI = {
      users: 'http://example.com/api/users/'
    };
    const api = new API(myAPI);
    const reducers = combineReducers(api.reducers);

    let createStoreWithMiddleware = applyMiddleware(
      thunkMiddleware
    )(createStore);
    const store = createStoreWithMiddleware(reducers);
    let scope = nock('http://example.com')
        .get('/api/users/')
        .reply(200, [{
          username: 'mark'
        }]);
    store.dispatch(
      d => {
        api.actionCreators.users.list()(d).end(() => {
          expect(store.getState()).toBe([{username: 'mark'}]);
          scope.done();
        });
      });
  });
});
