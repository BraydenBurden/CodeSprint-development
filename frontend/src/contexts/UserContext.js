import React, { createContext, useReducer, useContext, useEffect } from "react";

// Load initial state from localStorage or use default
const loadInitialState = () => {
  try {
    const savedState = localStorage.getItem("userState");
    return savedState
      ? JSON.parse(savedState)
      : {
          user: null,
          devMode: false,
        };
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    return {
      user: null,
      devMode: false,
    };
  }
};

// Action types
const SET_USER = "SET_USER";
const LOGOUT_USER = "LOGOUT_USER";
const INCREMENT_USER = "INCREMENT_USER";
const TOGGLE_DEV_MODE = "TOGGLE_DEV_MODE";

// Reducer function
const userReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case SET_USER:
      newState = { ...state, user: action.payload };
      break;
    case LOGOUT_USER:
      newState = { ...state, user: null, devMode: false };
      localStorage.removeItem("userState"); // Clear localStorage on logout
      break;
    case INCREMENT_USER:
      if (state.user) {
        newState = {
          ...state,
          user: {
            ...state.user,
            messagesSent: state.user.messagesSent + 1,
            messagesLeft: state.user.messagesLeft - 1,
          },
        };
      } else {
        newState = state;
      }
      break;
    case TOGGLE_DEV_MODE:
      newState = { ...state, devMode: action.payload };
      break;
    default:
      return state;
  }

  // Save to localStorage after state changes (except for logout which clears it)
  if (action.type !== LOGOUT_USER) {
    localStorage.setItem("userState", JSON.stringify(newState));
  }
  return newState;
};

// Context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, loadInitialState());

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("userState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.user) {
        dispatch({ type: SET_USER, payload: parsedState.user });
        if (parsedState.devMode) {
          dispatch({ type: TOGGLE_DEV_MODE, payload: true });
        }
      }
    }
  }, []);

  const setUser = (user) => {
    dispatch({ type: SET_USER, payload: user });
  };

  const logoutUser = () => {
    dispatch({ type: LOGOUT_USER });
  };

  const incrementMessages = () => {
    dispatch({ type: INCREMENT_USER });
  };

  const toggleDevMode = (showModal) => {
    if (!state.user) return;

    if (state.user.developer === 1) {
      // Toggle the mode
      dispatch({ type: TOGGLE_DEV_MODE, payload: !state.devMode });
    } else if (showModal) {
      // User is not a developer, show modal to become one
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        devMode: state.devMode,
        setUser,
        logoutUser,
        incrementMessages,
        toggleDevMode,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to consume the context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
