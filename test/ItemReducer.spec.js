import expect from 'expect';

import { ActionTypes, ItemReducer } from '../src/reduxRest';

describe('Reducer', () => {
    describe('reducer', () => {

        let actionTypes = new ActionTypes('endpoint');
        
        it('should set state to items on list action success', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.list_success,
                payload: [{id: 1}],
            }
            let newState = reducer(undefined, action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({id: 1});
        });

        it('should append item to state on create action', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create,
                payload: {some: 'thing'},
                pendingID: 1
            }
            let newState = reducer(undefined, action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                some: 'thing',
                pendingID: 1,
                status: 'pending'
            });
        });

        it('should replace item on create action success', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create_success,
                payload: {id: 1, some: 'thing'},
                pendingID: 1
            }
            let newState = reducer([{some: 'thing', pendingID: 1}], action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                id: 1,
                some: 'thing',
                status: 'saved'
            });
        });

        it('should set item status to failed on create action failure', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.create_failure,
                pendingID: 1
            }
            let newState = reducer([{some: 'thing', pendingID: 1}], action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                pendingID: 1,
                some: 'thing',
                status: 'failed'
            });
        });
        
        it('should update item and mark pending on update action', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.update,
                payload: {id: 1, some: 'other'},
            }
            let newState = reducer([{id: 1, some: 'thing'}], action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                id: 1,
                some: 'other',
                status: 'pending'
            });
        });

        it('should mark item saved on update action success', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.update_success,
                payload: {id: 1, some: 'other'},
            }
            let newState = reducer([{id: 1, some: 'thing'}], action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                id: 1,
                some: 'other',
                status: 'saved'
            });
        });

        it('should mark item failed on update action failure', () => {
            let reducer = new ItemReducer(actionTypes).getReducer();
            let action = {
                type: actionTypes.update_failure,
                payload: {id: 1, some: 'other'},
            }
            let newState = reducer([{id: 1, some: 'thing'}], action);
            expect(newState.length).toEqual(1);
            expect(newState[0]).toEqual({
                // TODO split these into separate tests
                id: 1,
                some: 'other',
                status: 'failed'
            });
        });
        
    });
});
