import React, { useReducer, useContext } from 'react';
import axios from 'axios';
import reducer from './reducer';
import { DISPLAY_ALERT, CLEAR_ALERT, SETUP_USER_BEGIN, SETUP_USER_SUCCESS, SETUP_USER_ERROR } from './action';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  user: user ? JSON.parse(user) : null,
  token: token,
  userLocation: user ? JSON.parse(user).location : '',
};
const AppContext = React.createContext();
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  };

  const clearAlert = () => {
    setTimeout(() => {
      dispatch({
        type: CLEAR_ALERT,
      });
    }, 3000);
  };

  const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const registerUser = async currentUser => {
    dispatch({ type: SETUP_USER_BEGIN });
    try {
      const { data } = await axios.post('/api/v1/auth/register', currentUser);
      const { user, token } = data;
      addUserToLocalStorage({ user, token });
      dispatch({ type: SETUP_USER_SUCCESS, payload: { user, token } });
    } catch ({ response }) {
      dispatch({ type: SETUP_USER_ERROR, payload: { message: response.data.message } });
      clearAlert();
    }
  };

  const loginUser = async currentUser => {
    dispatch({ type: SETUP_USER_BEGIN });
    try {
      const { data } = await axios.post('/api/v1/auth/login', currentUser);
      const { user, token } = data;

      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user, token },
      });

      addUserToLocalStorage({ user, token });
    } catch ({ response }) {
      dispatch({
        type: SETUP_USER_ERROR,
        payload: { message: response.data.message },
      });
    }
    clearAlert();
  };

  return (
    <AppContext.Provider value={{ ...state, displayAlert, registerUser, loginUser }}>
      {children}
    </AppContext.Provider>
  );
};

// make sure use
const useAppConsumer = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppConsumer };
