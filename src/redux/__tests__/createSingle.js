import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as selectors from '../selectors';
import * as entityActions from '../actions';

import getStore from '..';

const initialValue = { id: 1, name: 'Jeff' };

const store = getStore({
  entities: {
    user: {
      byId: { 1: initialValue },
    },
    post: {
      readIds: {
        '{"user_id":1}': { items: [1] },
      },
    },
  },
});

const axiosMock = new MockAdapter(axios);

const response = { id: 15, text: 'Jeff' };

axiosMock.onAny().reply(200, response);

describe('Entity - Read Entity', () => {
  const entityName = 'post';
  const parentName = 'user';
  const parentId = 1;
  const uuid = 'uuid';

  it('valid', (done) => {
    const action = entityActions.createEntity(entityName, parentName, parentId, uuid, { text: 'Jeff' });
    store.dispatch(action);

    expect(
      selectors.selectCreateEntityStatus(
        store.getState(),
        entityName,
        uuid,
      ),
    ).toEqual({
      isFetching: true,
      error: null,
    });

    setTimeout(() => {
      expect(
        selectors.selectCreateEntityStatus(
          store.getState(),
          entityName,
          uuid,
        ),
      ).toEqual({
        isFetching: false,
        error: null,
      });
      expect(
        selectors.selectEntity(store.getState(), entityName, response.id),
      ).toEqual(response);

      expect(store.getState().entities.user.byId[1].posts).toEqual([15]);
      expect(store.getState().entities.post.readIds['{"user_id":1}'].items).toEqual([1, 15]);

      done();
    }, 0);
  });
});
