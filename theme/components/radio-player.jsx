import React, { useState, useRef, useEffect } from "react";

import { useRadioPlayer } from "../contexts/RadioPlayerContext";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import SvgWrapper from "./core/svgWrapper/SvgWrapper";

// Simple SVG Icons
const PlayIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const MutedSoundIcon = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M7.33398 3.3335L4.00065 6.00016H1.33398V10.0002H4.00065L7.33398 12.6668V3.3335Z"
      stroke="#AAAAAA"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Diagonal line to indicate muted */}
    <path
      d="M2 2L14 14"
      stroke="#AAAAAA"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Reusable Track Info Component
const TrackInfo = ({ currentPlayingTrack, handleCloseRadioPlayer }) => (
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
      <img
        className="w-16 h-16 object-cover rounded"
        alt="Album Art"
        src={currentPlayingTrack.image}
      />
      <div>
        <div className="body-1">{currentPlayingTrack.title}</div>
        <div className="body-2 text-neutral-light pt-2 pl-2">
          {currentPlayingTrack.artist}
        </div>
      </div>
    </div>
    <button
      onClick={handleCloseRadioPlayer}
      className="body-1 hover:text-gray-700 transition-colors"
    >
      CLOSE
    </button>
  </div>
);

// Reusable Audio Player Controls Component
const AudioPlayerControls = ({
  isMusicPlaying,
  togglePlay,
  currentTime,
  formatTime,
  progressPercentage,
  getDisplayDuration,
  isMuted,
  setIsMuted,
  togglePlaylistView,
  showPlaylistButton = true,
}) => {
  const progressBarRef = useRef(null);
  const fpi = useFPI();
  const { isCartDrawerOpen } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  // Auto-pause music when cart drawer opens (only if radio is open and music is playing)
  useEffect(() => {
    if (isCartDrawerOpen && isMusicPlaying) {
      // Cart drawer opened while music is playing - pause the music
      togglePlay();
    }
    // Note: We don't do anything when cart closes or if music is already paused
  }, [isCartDrawerOpen]);

  // Handle progress bar click/seek
  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickPercentage = (clickX / progressBarWidth) * 100;

    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, clickPercentage));

    // Seek to the clicked position
    seekToPercentage(clampedPercentage);
  };

  // Seek to a specific percentage of the audio
  const seekToPercentage = (percentage) => {
    // Get audio element from the parent component's audioRef
    const audio = document.querySelector("audio");
    if (audio && audio.duration) {
      const seekTime = (percentage / 100) * audio.duration;
      audio.currentTime = seekTime;
    }
  };

  return (
    <div className="flex items-center gap-4 pt-3">
      <button
        onClick={togglePlay}
        className="text-black hover:text-gray-700 transition-colors"
      >
        {isMusicPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      <span className="body-2 text-ekke-black">{formatTime(currentTime)}</span>

      <div
        ref={progressBarRef}
        className="flex-1 h-1 bg-gray-300 mx-2 relative cursor-pointer"
        onClick={handleProgressBarClick}
      >
        <div
          className="h-1 bg-ekke-brown transition-all duration-300 relative"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Circular handle at the end of progress */}
          <div
            className="absolute -right-1 -top-1 w-3 h-3 bg-ekke-brown rounded-full shadow-sm hover:scale-110 transition-all duration-200"
            style={{
              transform: "translateX(50%)",
              opacity: progressPercentage > 0 ? 1 : 0,
            }}
          />
        </div>
      </div>

      <span className="body-2 text-ekke-black">{getDisplayDuration()}</span>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="text-black hover:text-gray-700 transition-colors"
      >
        {isMuted ? (
          <MutedSoundIcon className="w-4 h-4" />
        ) : (
          <SvgWrapper svgSrc="sound" className="w-4 h-4" />
        )}
      </button>

      {showPlaylistButton && (
        <button
          onClick={() => togglePlaylistView()}
          className="text-black hover:text-gray-700 transition-colors"
        >
          <SvgWrapper svgSrc="ham-burger" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const RadioPlayer = ({ globalConfig }) => {
  const [playlist, setPlaylist] = useState([]);
  const [playlistLoaded, setPlaylistLoaded] = useState(false);
  const isIOSDevice =
    typeof navigator !== "undefined"
      ? /iPad|iPhone|iPod/.test(navigator.userAgent)
      : false;
  const [isIOS, setIsIOS] = useState(isIOSDevice);

  const hasAvailableSongs = () => {
    for (let i = 1; i <= 5; i++) {
      const songUrl = globalConfig?.[`radio_song_${i}_url`];
      if (songUrl && songUrl.trim() !== "") {
        return true;
      }
    }
    return false;
  };

  const isPlaylistEmpty = !hasAvailableSongs();

  // Get global state and actions
  const {
    isRadioPlayerOpen,
    showPlaylistView,
    closeRadioPlayer,
    togglePlaylistView,
    isMusicPlaying,
    toggleMusicPlay,
    currentPlayingTrack,
    changeTrack,
    setCurrentTrack,
  } = useRadioPlayer();

  // Get songs from Fynd platform configuration using blocks
  const getPlaylist = async () => {
    const songs = [];

    // Access radio player songs from globalConfig using the new field names
    for (let i = 1; i <= 10; i++) {
      const songName = globalConfig?.[`radio_song_${i}_name`];
      const artistName = globalConfig?.[`radio_song_${i}_artist`];
      const songUrl = globalConfig?.[`radio_song_${i}_url`];
      const thumbnail = globalConfig?.[`radio_song_${i}_thumbnail`];

      if (songUrl && songUrl.trim() !== "") {
        // Use provided songName or default to "Song {number}"
        const title =
          songName && songName.trim() !== "" ? songName : `Song ${i}`;

        // setDebugStages((prev) => [...prev, `5.${i} Song valid: ${title}`]);
        let detectedDuration = duration || "0:00";

        // Try to detect duration automatically if not provided
        if (!duration || duration === "0:00") {
          if (!isIOS) {
            // Android: detect duration
            try {
              detectedDuration = await detectAudioDuration(songUrl);
            } catch (error) {
              detectedDuration = "0:00";
            }
          } else {
            // iOS: Try to get duration from globalConfig first
            const configDuration = globalConfig?.[`radio_song_${i}_duration`];
            if (configDuration && configDuration !== "0:00") {
              detectedDuration = configDuration;
            }
          }
        }

        songs.push({
          title: title,
          artist: artistName || "Unknown Artist",
          src: songUrl,
          duration: detectedDuration,
          image:
            thumbnail ||
            "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=80&h=80",
        });
      }
    }
    return songs;
  };

  // Add after getPlaylist function:
  const updatePlaylistDuration = (trackSrc, newDuration) => {
    setPlaylist((prevPlaylist) =>
      prevPlaylist.map((track) =>
        track.src === trackSrc ? { ...track, duration: newDuration } : track
      )
    );
  };

  // Function to detect audio duration from URL
  const detectAudioDuration = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const timeout = setTimeout(() => {
        audio.src = "";
        reject(new Error("Timeout detecting duration"));
      }, 10000); // 10 second timeout

      audio.addEventListener("loadedmetadata", () => {
        clearTimeout(timeout);
        const duration = Math.floor(audio.duration);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        const formattedDuration = `${mins}:${secs.toString().padStart(2, "0")}`;
        audio.src = ""; // Clean up
        resolve(formattedDuration);
      });

      audio.addEventListener("error", () => {
        clearTimeout(timeout);
        audio.src = ""; // Clean up
        reject(new Error("Error loading audio"));
      });

      audio.src = url;
    });
  };

  // Load playlist on component mount
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const songs = await getPlaylist();
        setPlaylist(songs);
        setPlaylistLoaded(true);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading playlist:", error);
        }
        setPlaylistLoaded(true);
      }
    };

    loadPlaylist();
  }, [globalConfig]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const handleCloseRadioPlayer = () => {
    // First, properly clean up the audio element
    if (audioRef.current) {
      const audio = audioRef.current;

      // Pause the audio
      audio.pause();

      // Remove all event listeners
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);

      // Clear the audio source to fully stop it
      audio.src = "";
      audio.load();
    }

    // Reset all local states
    setIsMuted(false);
    setCurrentTime(0);
    setDuration(0);

    // Stop the music playing state in global context
    if (isMusicPlaying) {
      toggleMusicPlay(); // This will set isMusicPlaying to false
    }

    // Reset to first song in playlist when closing
    if (playlist.length > 0) {
      setCurrentTrack(playlist[0]); // Always reset to first song
    }

    // Finally close the radio player
    closeRadioPlayer();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  // In handleLoadedMetadata function, add:
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const actualDuration = Math.floor(audioRef.current.duration);
      setDuration(actualDuration);
      // Update playlist duration for iOS
      if (isIOS && currentPlayingTrack) {
        const formattedDuration = formatDuration(actualDuration);
        updatePlaylistDuration(currentPlayingTrack.src, formattedDuration);
      }
    }
  };

  const handleEnded = () => {
    setCurrentTime(0);

    // Auto-play next song functionality
    if (playlist.length > 0 && currentPlayingTrack) {
      // Find current song index in playlist
      const currentIndex = playlist.findIndex(
        (track) => track.src === currentPlayingTrack.src
      );

      // Check if there's a next song
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        changeTrack(nextTrack);
      } else {
        // End of playlist - stop playing
        if (isMusicPlaying) {
          toggleMusicPlay(); // This will set isMusicPlaying to false
        }
      }
    }
  };

  useEffect(() => {
    if (playlistLoaded && playlist.length > 0) {
      // Check if current playing track exists in the playlist
      const trackInPlaylist = playlist.find(
        (track) => track.src === currentPlayingTrack?.src
      );

      if (!currentPlayingTrack || !trackInPlaylist) {
        // Set the first track from the dynamic playlist
        setCurrentTrack(playlist[0]);
      }
    }
  }, [playlistLoaded, playlist]);

  // Track loading and event listeners useEffect - only when track changes
  useEffect(() => {
    if (audioRef.current && currentPlayingTrack) {
      const audio = audioRef.current;

      // Always remove existing listeners first to prevent duplicates
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);

      // Only reset time and duration if the track source has actually changed
      if (currentPlayingTrack && audio.src !== currentPlayingTrack.src) {
        setCurrentTime(0);
        setDuration(0);

        // Set source and load audio FIRST
        audio.src = currentPlayingTrack.src;
        audio.load(); // Reload the audio element
        // iOS fix: Force metadata loading
        if (isIOS) {
          audio.preload = "metadata";
          audio.load();
        }
      }

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("ended", handleEnded);

      // Handle play/pause state (regardless of track change)
      if (isMusicPlaying) {
        audio.play().catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error playing audio:", error);
          }
        });
      } else {
        audio.pause();
      }

      // Force check if metadata is already loaded (for cached audio) - ALWAYS run this
      const checkMetadata = () => {
        if (audio.readyState >= 1) {
          const actualDuration = Math.floor(audio.duration);
          setDuration(actualDuration);
          return true; // Metadata was available
        }

        return false; // Metadata not yet available
      };
      // Check immediately and after short delays - ALWAYS run this
      checkMetadata();

      // Cleanup function - ALWAYS remove listeners
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, [currentPlayingTrack, isMusicPlaying]);

  // Separate useEffect for mute/unmute to prevent song restart
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      toggleMusicPlay();
    }
  };

  const handleTrackSelect = (track) => {
    // Only change track if it's different from current playing track
    if (!currentPlayingTrack || currentPlayingTrack.src !== track.src) {
      changeTrack(track);
    }
  };

  // Helper function to get display duration - use audio duration if available, otherwise use track's configured duration
  const getDisplayDuration = () => {
    if (duration > 0) {
      return formatTime(duration);
    }
    return "0:00";
  };

  // Helper function to get total duration in seconds for progress calculation
  const getTotalDurationSeconds = () => {
    if (duration > 0) {
      return duration > 0 ? duration : 0;
    }
    return 0;
  };

  const totalSeconds = getTotalDurationSeconds();
  const progressPercentage =
    totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

  if (isRadioPlayerOpen && isPlaylistEmpty) {
    return (
      <div className="fixed bottom-[90px] w-full z-10 md:bottom-0 right-0 md:left-auto md:w-[347px]">
        <div className="bg-ekke-bg p-4 w-full md:max-w-md border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">♪</span>
              </div>
              <div>
                <p className="body-1 text-neutral-900">No songs available</p>
                <p className="body-2 text-neutral-light">
                  Playlist is currently empty
                </p>
              </div>
            </div>
            <button
              onClick={closeRadioPlayer}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if radio player is not open
  if (!isRadioPlayerOpen || !currentPlayingTrack) {
    return null;
  }

  return (
    <>
      {showPlaylistView ? (
        <div className="fixed bottom-[90px] w-full z-10 md:bottom-0 right-0 md:left-auto md:w-[347px]">
          <div className="w-full bg-white border border-gray-300 md:max-w-md">
            {/* Playlist Header */}
            <div className="bg-ekke-brown text-white text-center py-3 px-4">
              <div className="font-road-radio text-sm font-bold tracking-wider">
                {globalConfig?.radio_player_header_text || "EKKE PLAYLIST"}
              </div>
            </div>

            {/* Playlist Items */}
            <div
              className="bg-ekke-bg overflow-y-auto"
              style={{
                maxHeight: "240px", // Show max 4 songs (60px per song)
                scrollbarWidth: "thin",
                scrollbarColor: "#000000 transparent",
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  width: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: #000000;
                  border-radius: 2px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #000000;
                }
              `}</style>
              {playlist.map((track, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 hover:bg-neutral-lighter cursor-pointer ${
                    currentPlayingTrack?.src === track.src
                      ? "bg-neutral-lighter"
                      : ""
                  }`}
                  style={{
                    borderBottom: `1px solid #dddace`,
                  }}
                  onClick={() => handleTrackSelect(track)}
                >
                  <div>
                    <div className="body-1">{track.title}</div>
                    <div className="body-2 text-neutral-light pl-2 pt-2">
                      {track.artist}
                    </div>
                  </div>
                  <div className="body-2 text-neutral-light">
                    {track.duration}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Playing Track Section - Fixed at bottom */}
            <div className="bg-ekke-bg p-3">
              <TrackInfo
                currentPlayingTrack={currentPlayingTrack}
                handleCloseRadioPlayer={handleCloseRadioPlayer}
              />

              {/* Player Controls */}
              <AudioPlayerControls
                isMusicPlaying={isMusicPlaying}
                togglePlay={togglePlay}
                currentTime={currentTime}
                formatTime={formatTime}
                progressPercentage={progressPercentage}
                getDisplayDuration={getDisplayDuration}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                togglePlaylistView={togglePlaylistView}
                showPlaylistButton={true}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="fixed bottom-[90px] w-full z-30 md:bottom-0 right-0 md:left-auto md:w-[347px]"
          style={{
            borderBottom: "1px solid #ababab",
          }}
        >
          <div className="bg-ekke-bg p-3 w-full md:max-w-md">
            <TrackInfo
              currentPlayingTrack={currentPlayingTrack}
              handleCloseRadioPlayer={handleCloseRadioPlayer}
            />

            {/* Player Controls */}
            <AudioPlayerControls
              isMusicPlaying={isMusicPlaying}
              togglePlay={togglePlay}
              currentTime={currentTime}
              formatTime={formatTime}
              progressPercentage={progressPercentage}
              getDisplayDuration={getDisplayDuration}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              togglePlaylistView={togglePlaylistView}
              showPlaylistButton={true}
            />
          </div>
        </div>
      )}

      {/* Audio element - rendered once, never unmounted */}
      <audio
        ref={audioRef}
        src={currentPlayingTrack.src}
        preload="metadata"
        playsInline
      />
    </>
  );
};

export default RadioPlayer;
