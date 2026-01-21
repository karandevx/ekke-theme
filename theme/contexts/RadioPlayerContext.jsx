import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Create the context
export const RadioPlayerContext = createContext();

// Action types
const RADIO_ACTIONS = {
  TOGGLE_RADIO_PLAYER: "TOGGLE_RADIO_PLAYER",
  OPEN_RADIO_PLAYER: "OPEN_RADIO_PLAYER",
  CLOSE_RADIO_PLAYER: "CLOSE_RADIO_PLAYER",
  TOGGLE_PLAYLIST_VIEW: "TOGGLE_PLAYLIST_VIEW",
  OPEN_PLAYLIST_VIEW: "OPEN_PLAYLIST_VIEW",
  CLOSE_PLAYLIST_VIEW: "CLOSE_PLAYLIST_VIEW",
  TOGGLE_MUSIC_PLAY: "TOGGLE_MUSIC_PLAY",
  PLAY_MUSIC: "PLAY_MUSIC",
  PAUSE_MUSIC: "PAUSE_MUSIC",
  SET_CURRENT_TRACK: "SET_CURRENT_TRACK",
  CHANGE_TRACK: "CHANGE_TRACK",
};

// Initial state
const initialState = {
  isRadioPlayerOpen: false,
  showPlaylistView: false,
  isMusicPlaying: false,
  currentPlayingTrack: null, // Let RadioPlayer component set the first song from playlist
};

// Helper function to check if current page is checkout
const isCheckoutPage = (pathname) => {
  return pathname && pathname.toLowerCase().includes("/checkout");
};

// Reducer function
const radioPlayerReducer = (state, action) => {
  switch (action.type) {
    case RADIO_ACTIONS.TOGGLE_RADIO_PLAYER:
      return {
        ...state,
        isRadioPlayerOpen: !state.isRadioPlayerOpen,
        // Close playlist view and pause music when closing radio
        showPlaylistView: !state.isRadioPlayerOpen
          ? state.showPlaylistView
          : false,
        isMusicPlaying: !state.isRadioPlayerOpen ? state.isMusicPlaying : false,
      };

    case RADIO_ACTIONS.OPEN_RADIO_PLAYER:
      return {
        ...state,
        isRadioPlayerOpen: true,
      };

    case RADIO_ACTIONS.CLOSE_RADIO_PLAYER:
      return {
        ...state,
        isRadioPlayerOpen: false,
        showPlaylistView: false,
        isMusicPlaying: false,
      };

    case RADIO_ACTIONS.TOGGLE_PLAYLIST_VIEW:
      return {
        ...state,
        showPlaylistView: !state.showPlaylistView,
      };

    case RADIO_ACTIONS.OPEN_PLAYLIST_VIEW:
      return {
        ...state,
        showPlaylistView: true,
      };

    case RADIO_ACTIONS.CLOSE_PLAYLIST_VIEW:
      return {
        ...state,
        showPlaylistView: false,
        isMusicPlaying: false,
      };

    case RADIO_ACTIONS.TOGGLE_MUSIC_PLAY:
      return {
        ...state,
        isMusicPlaying: !state.isMusicPlaying,
      };

    case RADIO_ACTIONS.PLAY_MUSIC:
      return {
        ...state,
        isMusicPlaying: true,
      };

    case RADIO_ACTIONS.PAUSE_MUSIC:
      return {
        ...state,
        isMusicPlaying: false,
      };

    case RADIO_ACTIONS.SET_CURRENT_TRACK:
      return {
        ...state,
        currentPlayingTrack: action.track,
      };

    case RADIO_ACTIONS.CHANGE_TRACK:
      // Only change track if it's different from current playing track
      if (
        state.currentPlayingTrack &&
        state.currentPlayingTrack.src === action.track.src
      ) {
        return state; // Don't change if same track is already playing
      }
      return {
        ...state,
        currentPlayingTrack: action.track,
        isMusicPlaying: true, // Auto-play new track
      };

    default:
      return state;
  }
};

// Provider component
export const RadioPlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(radioPlayerReducer, initialState);
  const location = useLocation();

  // Auto-close radio player on checkout pages
  useEffect(() => {
    if (
      isCheckoutPage(location.pathname) &&
      (state.isRadioPlayerOpen || state.isMusicPlaying)
    ) {
      dispatch({ type: RADIO_ACTIONS.CLOSE_RADIO_PLAYER });
    }
  }, [location.pathname, state.isRadioPlayerOpen, state.isMusicPlaying]);

  // Action creators
  const actions = {
    toggleRadioPlayer: () => {
      // Prevent opening radio on checkout pages
      if (isCheckoutPage(location.pathname) && !state.isRadioPlayerOpen) {
        return;
      }
      dispatch({ type: RADIO_ACTIONS.TOGGLE_RADIO_PLAYER });
    },
    openRadioPlayer: () => {
      if (isCheckoutPage(location.pathname)) {
        return;
      }
      dispatch({ type: RADIO_ACTIONS.OPEN_RADIO_PLAYER });
    },
    closeRadioPlayer: () =>
      dispatch({ type: RADIO_ACTIONS.CLOSE_RADIO_PLAYER }),

    togglePlaylistView: () =>
      dispatch({ type: RADIO_ACTIONS.TOGGLE_PLAYLIST_VIEW }),
    openPlaylistView: () =>
      dispatch({ type: RADIO_ACTIONS.OPEN_PLAYLIST_VIEW }),
    closePlaylistView: () =>
      dispatch({ type: RADIO_ACTIONS.CLOSE_PLAYLIST_VIEW }),

    toggleMusicPlay: () => dispatch({ type: RADIO_ACTIONS.TOGGLE_MUSIC_PLAY }),
    playMusic: () => dispatch({ type: RADIO_ACTIONS.PLAY_MUSIC }),
    pauseMusic: () => dispatch({ type: RADIO_ACTIONS.PAUSE_MUSIC }),

    setCurrentTrack: (track) =>
      dispatch({ type: RADIO_ACTIONS.SET_CURRENT_TRACK, track }),
    changeTrack: (track) =>
      dispatch({ type: RADIO_ACTIONS.CHANGE_TRACK, track }),
  };

  const value = {
    // State
    ...state,

    // Helper functions
    isCheckoutPage: isCheckoutPage(location.pathname),

    // Actions
    ...actions,
  };

  return (
    <RadioPlayerContext.Provider value={value}>
      {children}
    </RadioPlayerContext.Provider>
  );
};

// Custom hook to use the radio player context
export const useRadioPlayer = () => {
  const context = useContext(RadioPlayerContext);
  if (!context) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }
  return context;
};
