import assert from 'assert';

import { ActionTypes } from '../src/reduxRest';

describe('ActionTypes', () => {
    describe('constructor', () => {
        ['list', 'retrieve', 'create', 'update'].forEach(action => {
            
            it(`adds a ${action} action type`, () => {
                let types = new ActionTypes('endpoint');
                assert.doesNotThrow(
                    () => types[action]);
            });
            
            it(`sets the ${action} action type value to <endpoint>_${action}`, () => {
                let types = new ActionTypes('endpoint');
                assert.equal(types[action], `endpoint_${action}`);
            });
            
            ['success', 'failure'].forEach(result => {
                
                it(`adds a related ${result} action type for ${action}`, () => {
                    let types = new ActionTypes('endpoint');
                    assert.doesNotThrow(
                        () => types[`${action}_${result}`]);
                });
                
                it(`sets the related ${result} action type for ${action} to <endpoint>_${action}_${result}`,
                   () => {
                       let types = new ActionTypes('endpoint');
                       assert.equal(types[`${action}_${result}`], `endpoint_${action}_${result}`);
                   });
            });
        });
    });
    
    describe('getConstant', () => {
        
        it('returns <endpointname>_<action> when called with an action only', () => {
            let types = new ActionTypes('endpoint');
            assert.equal('endpoint_list', types.getConstant('list'));
        });

        it('returns <endpointname>_<action>_<result> when called with action and result',
           () => {
               let types = new ActionTypes('endpoint');
               assert.equal('endpoint_list_success', types.getConstant('list', 'success'));
           });

    });
});
