import expect from 'expect';

import { ActionTypes, CollectionReducer } from '../src/reduxRest';

describe('CollectionReducer', () => {
    describe('reducer', () => {
        
        let actionTypes = new ActionTypes('endpoint');

        it('should create pending list state on list action', () => {
            let reducer = new CollectionReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list,
                pendingID: 1
            }
            
            let newState = reducer(undefined, action);

            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                action: 'list',
                pendingID: 1,
                status: 'pending'
            });
        });

        it('should set list state to success on list action success', () => {
            let reducer = new CollectionReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list_success,
                pendingID: 1,
            }

            let newState = reducer([{
                    action: 'list',
                    pendingID: 1,
                    status: 'pending'
            }], action);

            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                action: 'list',
                status: 'saved'
            });
        });
        
        it('should set list state to failed on list action failure', () => {
            let reducer = new CollectionReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list_failure,
                pendingID: 1,
            }

            let newState = reducer([{
                    action: 'list',
                    pendingID: 1,
                    status: 'pending'
            }], action);

            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                action: 'list',
                status: 'failed'
            });
        });

    });

});
