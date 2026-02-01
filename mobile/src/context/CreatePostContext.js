import React, { createContext, useContext, useMemo, useReducer } from 'react';

const initialState = {
  roomId: null,
  type: '',
  title: '',
  description: '',
  price: '',
  area: '',
  address: '',
  contactPhone: '',
  images: [],
  location: null,
  locationAddress: '',
  mode: 'create',
  postingPaid: false,
};

const actionTypes = {
  SET_BASIC_INFO: 'SET_BASIC_INFO',
  SET_ROOM_ID: 'SET_ROOM_ID',
  SET_IMAGES: 'SET_IMAGES',
  SET_LOCATION: 'SET_LOCATION',
  SET_MODE: 'SET_MODE',
  SET_POSTING_PAID: 'SET_POSTING_PAID',
  RESET: 'RESET',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_BASIC_INFO:
      return {
        ...state,
        ...action.payload,
      };
    case actionTypes.SET_ROOM_ID:
      return {
        ...state,
        roomId: action.payload || null,
      };
    case actionTypes.SET_IMAGES:
      return {
        ...state,
        images: Array.isArray(action.payload) ? action.payload : [],
      };
    case actionTypes.SET_LOCATION:
      return {
        ...state,
        location: action.payload?.location || null,
        locationAddress: action.payload?.address ?? state.locationAddress,
      };
    case actionTypes.SET_MODE:
      return {
        ...state,
        mode: action.payload === 'edit' ? 'edit' : 'create',
      };
    case actionTypes.SET_POSTING_PAID:
      return {
        ...state,
        postingPaid: Boolean(action.payload),
      };
    case actionTypes.RESET:
      return { ...initialState };
    default:
      return state;
  }
};

const CreatePostContext = createContext(null);

export function CreatePostProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      data: state,
      setBasicInfo: (payload) => dispatch({ type: actionTypes.SET_BASIC_INFO, payload }),
      setRoomId: (roomId) => dispatch({ type: actionTypes.SET_ROOM_ID, payload: roomId }),
      setImages: (images) => dispatch({ type: actionTypes.SET_IMAGES, payload: images }),
      setLocation: (payload) => dispatch({ type: actionTypes.SET_LOCATION, payload }),
      setMode: (mode) => dispatch({ type: actionTypes.SET_MODE, payload: mode }),
      setPostingPaid: (paid) => dispatch({ type: actionTypes.SET_POSTING_PAID, payload: paid }),
      reset: () => dispatch({ type: actionTypes.RESET }),
    }),
    [state]
  );

  return <CreatePostContext.Provider value={value}>{children}</CreatePostContext.Provider>;
}

export function useCreatePost() {
  const context = useContext(CreatePostContext);
  if (!context) {
    throw new Error('useCreatePost must be used within a CreatePostProvider');
  }
  return context;
}
