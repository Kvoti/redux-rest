import assert from 'assert';
import nock from 'nock';

import { Endpoint } from '../src/reduxRest';

describe('Endpoint', () => {
  describe('#_getObjectURL()', () => {
    it('should append the object id the the url', () => {
      let endpoint = new Endpoint('');
      let objectURL = endpoint._getObjectURL('obj');
      assert.equal(objectURL, '/obj');
    });
  });

  describe('list', () => {
    it('should make a GET request to the endpoint url', (done) => {
      // Note only giving full url to work with nock
      // TODO run these tests in browser?
      let endpoint = new Endpoint('http://example.com/endpoint');
      // TODO if nock gets support for path regexps we don't need to specify the path here
      let scope = nock('http://example.com').get('/endpoint').reply(200);
      endpoint.list().end(() => {
        scope.done();
        done();
      });
    });

    it('should append params object as the query string', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com')
          .get('/endpoint')
          .query({key: 'value'})
          .reply(200);
      endpoint.list({key: 'value'}).end(() => {
        scope.done();
        done();
      });

    });
  });

  describe('retrieve', () => {
    it('should make a GET request to the object url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com').get('/endpoint/obj').reply(200);
      endpoint.retrieve('obj').end(() => {
        scope.done();
        done();
      });
    });
  });

  describe('create', () => {
    it('should make a POST request to the endpoint url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com').post('/endpoint').reply(200);
      endpoint.create().end(() => {
        scope.done();
        done();
      });
    });

    it('should send the object conf in the request body', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com')
          .post('/endpoint', {id: 1})
          .reply(200);
      endpoint.create({id: 1}).end(() => {
        scope.done();
        done();
      });
    });

  });

  describe('update', () => {
    it('should make a PUT request to the object url', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com').put('/endpoint/obj').reply(200);
      endpoint.update({}, 'obj').end(() => {
        scope.done();
        done();
      });
    });

    it('should send the object conf in the request body', (done) => {
      let endpoint = new Endpoint('http://example.com/endpoint');
      let scope = nock('http://example.com')
          .put('/endpoint/obj', {id: 1})
          .reply(200);
      endpoint.update({id: 1}, 'obj').end(() => {
        scope.done();
        done();
      });
    });

  });
});
