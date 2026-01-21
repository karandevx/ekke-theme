import React, { useState, useEffect, useRef } from "react";
import { isRunningOnClient } from "../helper/utils";
import styles from "../styles/sections/hero-video.less";
import placeholderImage from "../assets/images/placeholder/hero-video.png";
import { useGlobalTranslation } from "fdk-core/utils";
import { FDKLink } from "fdk-core/components";
import PlayIcon from "../assets/images/play.svg";
import PauseIcon from "../assets/images/pause.svg";

export function Component({ props, globalConfig }) {
  const {
    videoFile,
    videoUrl,
    autoplay,
    hidecontrols,
    showloop,
    is_pause_button,
    title,
    coverUrl,
    padding_top,
    padding_bottom,
    bottom_right_text,
    bottom_left_text,
    cta_button_text,
    cta_button_link,
  } = props;
  const { t } = useGlobalTranslation("translation");
  const [showOverlay, setShowOverlay] = useState(!autoplay?.value);
  const [ytOverlay, setYtOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const videoRef = useRef(null);
  const ytVideoRef = useRef(null);

  function isValidURL(url) {
    try {
      return Boolean(new URL(url));
    } catch (e) {
      return false;
    }
  }

  function isGdrive() {
    if (!isValidURL(videoUrl?.value)) return false;
    const urlObj = new URL(videoUrl?.value);
    return urlObj.host.includes("drive.google.com");
  }

  function getGdriveVideoUrl() {
    if (videoUrl && isValidURL(videoUrl?.value)) {
      const urlObj = new URL(videoUrl?.value);
      const v = urlObj.pathname.split("/");
      const fileId = v[v.indexOf("d") + 1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return "";
  }

  function getVideoSource() {
    if (videoFile?.value) {
      return videoFile?.value;
    }
    if (isGdrive()) {
      return getGdriveVideoUrl();
    }
    return videoUrl?.value;
  }

  function playMp4() {
    setShowOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }

  function stopMp4() {
    // Prevent pausing if autoplay and loop are both enabled
    const shouldPreventPause = autoplay?.value && showloop?.value;

    if (!shouldPreventPause) {
      setShowOverlay(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }

  function getYTVideoID() {
    if (!isValidURL(videoUrl?.value)) return null;
    const urlObj = new URL(videoUrl?.value);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname.includes("youtu.be")) {
      return pathname.slice(1); // /VIDEO_ID
    }

    if (hostname.includes("youtube.com")) {
      if (pathname.startsWith("/watch")) {
        return searchParams.get("v");
      }
      if (pathname.startsWith("/embed/")) {
        return pathname.split("/embed/")[1];
      }
    }

    return null;
  }

  // function getYTVideoID() {
  //   if (!isValidURL(videoUrl?.value)) return null;
  //   const urlObj = new URL(videoUrl?.value);
  //   const { searchParams } = urlObj;
  //   let v = searchParams.get("v");
  //   if (urlObj.host.includes("youtu.be")) {
  //     v = urlObj.pathname.split("/").pop();
  //   }
  //   return v;
  // }

  useEffect(() => {
    setIsValidUrl(isValidURL(videoUrl?.value));

    // Detect iOS devices
    if (isRunningOnClient()) {
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    }
  }, [videoUrl]);

  function isYoutube() {
    if (!videoUrl?.value || !isValidURL(videoUrl?.value)) {
      return false;
    }
    const urlObj = new URL(videoUrl?.value);
    if (isRunningOnClient()) {
      return (
        urlObj.host.includes("youtu.be") || urlObj.host.includes("youtube.com")
      );
    }
    return false;
  }

  const loadYTScript = () => {
    const nodes = document.querySelectorAll("[data-ytscript]");
    if (nodes.length === 0) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.dataset.ytscript = "true";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      tag.onload = () => {
        if (!window.onYouTubeIframeAPIReady) {
          window.onYouTubeIframeAPIReady = () => {
            setTimeout(onYouTubeIframeAPIReady, 500);
          };
        } else {
          setTimeout(onYouTubeIframeAPIReady, 500);
        }
      };
    } else if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        setTimeout(onYouTubeIframeAPIReady, 500);
      };
    } else {
      setTimeout(onYouTubeIframeAPIReady, 500);
    }
    setIsLoading(true);
  };

  const removeYTScript = () => {
    const { players } = window;
    // Destroy any existing YouTube player instances
    if (players) {
      Object.keys(players).forEach((item) => {
        if (players[item].inst) {
          players[item].inst.destroy();
        }
      });
      window.players = null;
    }

    // Find all elements with the "data-ytscript" attribute
    const nodes = document.querySelectorAll("[data-ytscript]");

    // Safely remove each element, but ensure it is still part of the DOM
    nodes.forEach((element) => {
      if (element && element?.parentNode) {
        try {
          element?.parentNode?.removeChild(element);
        } catch (err) {
          console.warn("Error removing script node:", err);
        }
      } else {
        console.warn(
          "Script node is not part of the DOM or already removed:",
          element
        );
      }
    });

    // Unset window.YT if it exists
    if (typeof window.YT !== "undefined") {
      window.YT = undefined;
    }
  };

  const getImgSrcSet = () => {
    if (globalConfig?.img_hd) {
      return [];
    }
    return [
      { breakpoint: { min: 1728 }, width: 3564 },
      { breakpoint: { min: 1512 }, width: 3132 },
      { breakpoint: { min: 1296 }, width: 2700 },
      { breakpoint: { min: 1080 }, width: 2250 },
      { breakpoint: { min: 900 }, width: 1890 },
      { breakpoint: { min: 720 }, width: 1530 },
      { breakpoint: { min: 540 }, width: 1170 },
      { breakpoint: { min: 360 }, width: 810 },
      { breakpoint: { min: 180 }, width: 450 },
    ];
  };

  const onYouTubeIframeAPIReady = () => {
    const ytVideo = ytVideoRef.current;
    window.players = { ...window.players };
    const { players } = window;

    if (ytVideo) {
      const videoID = ytVideo.dataset.videoid;
      if (!players[videoID]) {
        players[videoID] = {};
      }

      const videoMeta = JSON.parse(ytVideo.dataset.videometa);
      const qautoplay = videoMeta?.autoplay?.value ? 1 : 0;
      const qcontrols = videoMeta?.hidecontrols?.value ? 0 : 1;
      const qmute = videoMeta?.autoplay?.value;
      const qloop = !showloop?.value ? 0 : 1;

      players[videoID].onReady = (e) => {
        if (qmute) {
          e.target.mute();
        } else {
          e.target.unMute();
        }
        if (qautoplay) {
          e.target.playVideo();
        }
        setIsLoading(false);
      };

      players[videoID].onStateChange = (event) => {
        const p = window.players;
        const shouldPreventPause =
          videoMeta?.autoplay?.value && showloop?.value;

        if (
          event.data === window.YT.PlayerState.PLAYING ||
          event.data === window.YT.PlayerState.BUFFERING
        ) {
          setYtOverlay(true);
          setShowOverlay(false);
        }
        if (event.data === window.YT.PlayerState.PAUSED) {
          // Only show overlay if pause is allowed (not when autoplay and loop are both enabled)
          if (!shouldPreventPause) {
            setShowOverlay(true);
          } else {
            // If pausing is not allowed, resume playing
            p[videoID].inst.playVideo();
          }
        }
        if (event.data === window.YT.PlayerState.ENDED) {
          if (qloop === 1) {
            p[videoID].inst.playVideo(); // Loop the video if qloop is 1
            p[videoID].inst.seekTo(0);
          } else {
            setShowOverlay(true); // End the video without looping
          }
        }
      };
      // eslint-disable-next-line no-undef
      players[videoID].inst = new YT.Player(`yt-video-${videoID}`, {
        videoId: videoID,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: qautoplay,
          controls: qcontrols,
          modestbranding: 1,
          mute: qmute,
          loop: qloop,
          fs: 0,
          WebKitPlaysInline: "true",
          playsinline: 1,
          cc_load_policty: 0,
          iv_load_policy: 3,
          origin: document.location.origin,
          // iOS-specific parameters to prevent flickering
          enablejsapi: 1,
          rel: 0,
          showinfo: 0,
          // Disable annotations and related videos
          disablekb: 1,
          // Quality parameters - use auto for better iOS compatibility
          vq: "auto",
          hd: 1,
        },
        events: {
          onReady: players[videoID].onReady,
          onStateChange: players[videoID].onStateChange,
        },
      });
    }
  };

  const playYT = () => {
    const videoID = ytVideoRef.current.dataset.videoid;
    const p = window.players;
    p[videoID].inst.playVideo();
    setShowOverlay(false);
  };

  const stopYT = () => {
    // Prevent pausing if autoplay and loop are both enabled
    const shouldPreventPause = autoplay?.value && showloop?.value;

    if (!shouldPreventPause) {
      const videoID = ytVideoRef.current.dataset.videoid;
      const p = window.players;
      p[videoID].inst.pauseVideo();
      setShowOverlay(true);
    }
  };

  const closeVideo = () => {
    if (videoFile?.value || isGdrive()) {
      stopMp4();
    } else {
      stopYT();
    }
  };

  const playVideo = () => {
    if (videoFile?.value || isGdrive()) {
      playMp4();
    } else {
      playYT();
    }
  };

  useEffect(() => {
    if (!videoUrl?.value && !videoFile?.value) {
      setShowOverlay(true);
    }
    if (
      (videoUrl?.value && videoFile?.value) ||
      (!videoUrl?.value && videoFile?.value)
    ) {
      setYtOverlay(true);
    }
    if (!videoFile?.value && videoUrl?.value) {
      setYtOverlay(false);
    }
    if (isYoutube(videoUrl?.value) && !videoFile?.value) {
      setShowOverlay(false);
      removeYTScript();
    }

    setTimeout(() => {
      if (isYoutube(videoUrl?.value)) {
        loadYTScript();
      }
    }, 0);
  }, [videoUrl, videoFile, autoplay, hidecontrols, showloop]);

  const handleVideoClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    // Prevent pausing if autoplay and loop are both enabled
    const shouldPreventPause = autoplay?.value && showloop?.value;

    if (videoRef.current) {
      if (!videoRef.current.paused) {
        // Only allow pausing if autoplay and loop are not both enabled
        if (!shouldPreventPause) {
          videoRef.current.pause();
        }
      } else {
        // iOS-specific handling to prevent flickering
        if (isIOS) {
          // Add small delay for iOS to prevent refresh issues
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.warn);
            }
          }, 50);
        } else {
          videoRef.current.play();
        }
      }
    }
  };

  // const dynamicStyles = {
  //   paddingTop: `${padding_top?.value ?? 0}px`,
  //   paddingBottom: `${padding_bottom?.value ?? 0}px`,
  // };

  return (
    <section>
      {title?.value && (
        <h2 className={`fx-title ${styles.video_heading} fontHeader`}>
          {title?.value}
        </h2>
      )}

      <div className={`${styles.video_container} `}>
        {videoFile?.value ? (
          <video
            ref={videoRef}
            onClick={handleVideoClick}
            width="100%"
            poster={coverUrl?.value}
            autoPlay={autoplay?.value}
            muted={autoplay?.value}
            loop={showloop?.value}
            controls={!hidecontrols?.value}
            webkit-playsinline="true"
            playsInline
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portraint"
            playsinline="true"
            data-webkit-playsinline="true"
            onPause={() => {
              // Only show overlay if pause is allowed (not when autoplay and loop are both enabled)
              const shouldPreventPause = autoplay?.value && showloop?.value;
              if (!shouldPreventPause) {
                setShowOverlay(true);
              } else {
                // If pausing is not allowed, resume playing
                if (videoRef.current) {
                  // Add small delay to prevent flickering on iOS
                  setTimeout(() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play();
                    }
                  }, 100);
                }
              }
            }}
            onEnded={() => {
              if (showloop?.value) {
                // Prevent flicker by immediately restarting without showing overlay
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                }
              } else {
                setShowOverlay(true);
              }
            }}
            onPlay={() => setShowOverlay(false)}
            onLoadedData={() => setIsLoading(false)}
            onProgress={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
            preload={isIOS ? "none" : "metadata"}
            // iOS-specific attributes to prevent auto-refresh
            {...(isIOS && {
              "data-ios-optimized": "true",
              "webkit-playsinline": "true",
              "x5-playsinline": "true",
            })}
            src={getVideoSource()}
            allowFullScreen
            // iOS-specific optimization attributes
            crossOrigin="anonymous"
            disablePictureInPicture
            style={{
              imageRendering: "auto",
              objectFit: "cover",
              backgroundColor: "transparent",
              // Prevent iOS video flickering
              WebkitTransform: "translateZ(0)",
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
              // Smooth video rendering on iOS
              WebkitFilter: "blur(0)",
              filter: "blur(0)",
            }}
          ></video>
        ) : (
          isYoutube() &&
          isValidUrl && (
            <div className={styles.youtube_wrapper}>
              <div
                className={styles.yt_video}
                ref={ytVideoRef}
                id={`yt-video-${getYTVideoID(videoUrl?.value)}`}
                data-videoid={getYTVideoID(videoUrl?.value)}
                data-videometa={JSON.stringify(props)}
                allowFullScreen
              ></div>
            </div>
          )
        )}

        {showOverlay && (
          <div
            onClick={playVideo}
            className={`${styles.overlay} ${!coverUrl?.value ? styles.overlay_noimage : ""} ${isYoutube() ? styles.youtube_noimage : ""}`}
          >
            {coverUrl.value && (
              <div
                className={styles.overlay__image}
                style={{
                  background: `#ccc url(${coverUrl?.value}) center/cover no-repeat `,
                }}
              ></div>
            )}
            <div className={styles.overlay__content}>
              <div
                id="play"
                // onClick={playVideo}
                className={styles.overlay__playButton}
              >
                <PlayIcon />
              </div>
            </div>
          </div>
        )}
        {is_pause_button?.value &&
          !showOverlay &&
          ytOverlay &&
          !(autoplay?.value && showloop?.value) && (
            <div className={styles.pauseButton} onClick={closeVideo}>
              <PauseIcon />
            </div>
          )}
        {!videoFile?.value && !videoUrl?.value && (
          <img
            src={coverUrl?.value || placeholderImage}
            alt={t("resource.common.placeholder")}
            style={{ width: "100%" }}
            srcSet={getImgSrcSet()}
          />
        )}

        {/* Bottom text elements */}
        <div className={styles.bottom_text_container}>
          {bottom_left_text && (
            <div className={styles.bottom_left_text}>
              {bottom_left_text.value || "Bottom Left Text"}
            </div>
          )}

          {bottom_right_text && (
            <div className={styles.bottom_right_text}>
              <a href="mailto:hello@ekke.co">
                {bottom_right_text.value || "Bottom Right Text"}
              </a>
            </div>
          )}
        </div>

        {/* CTA Button */}
        {cta_button_text && (
          <div className={styles.cta_button_container}>
            {cta_button_link?.value ? (
              <FDKLink to={cta_button_link.value} className={styles.cta_button}>
                {cta_button_text.value}
              </FDKLink>
            ) : (
              <span className={styles.cta_button}>{cta_button_text.value}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export const settings = {
  label: "t:resource.sections.hero_video.hero_video",
  props: [
    {
      type: "video",
      id: "videoFile",
      default: false,
      label: "t:resource.sections.hero_video.primary_video",
    },
    {
      id: "videoUrl",
      type: "text",
      label: "t:resource.sections.hero_video.video_url",
      default: "",
      info: "t:resource.sections.hero_video.video_support_mp4_youtube",
    },
    {
      type: "checkbox",
      id: "autoplay",
      default: true,
      label: "t:resource.sections.hero_video.autoplay",
      info: "t:resource.sections.hero_video.enable_autoplay_muted",
    },
    {
      type: "checkbox",
      id: "hidecontrols",
      default: true,
      label: "t:resource.sections.hero_video.hide_video_controls",
      info: "t:resource.sections.hero_video.disable_video_controls",
    },
    {
      type: "checkbox",
      id: "showloop",
      default: true,
      label: "t:resource.sections.hero_video.play_video_loop",
      info: "t:resource.sections.hero_video.disable_video_loop",
    },
    {
      type: "checkbox",
      id: "is_pause_button",
      default: true,
      label: "t:resource.sections.hero_video.display_pause_on_hover",
      info: "t:resource.sections.hero_video.display_pause_on_hover_info",
    },
    {
      type: "text",
      id: "title",
      default: "",
      label: "t:resource.common.heading",
    },
    {
      id: "coverUrl",
      type: "image_picker",
      label: "t:resource.sections.hero_video.thumbnail_image",
      default: "",
      options: {
        aspect_ratio: "16:9",
      },
    },
    {
      type: "text",
      id: "bottom_right_text",
      default: "right",
      label: "Right bottomText",
    },
    {
      type: "text",
      id: "bottom_left_text",
      default: "left",
      label: "Left bottom Text",
    },
    {
      type: "text",
      id: "cta_button_text",
      default: "JOIN THE EKKE COMMUNITY",
      label: "CTA Button Text",
    },
    {
      type: "url",
      id: "cta_button_link",
      default: "",
      label: "CTA Button Link",
    },

    {
      type: "range",
      id: "padding_top",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.top_padding",
      default: 0,
      info: "t:resource.sections.categories.top_padding_for_section",
    },
    {
      type: "range",
      id: "padding_bottom",
      min: 0,
      max: 100,
      step: 1,
      unit: "px",
      label: "t:resource.sections.categories.bottom_padding",
      default: 16,
      info: "t:resource.sections.categories.bottom_padding_for_section",
    },
  ],
};
export default Component;
