import React, { Component } from "react";
import ServerError from "../server-error/server-error";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      isOffline: false,
      isClient: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error", error, info);
    }
  }

  componentDidMount() {
    // Check if navigator is available (SSR safety)
    if (typeof navigator !== "undefined") {
      this.setState({ isOffline: !navigator.onLine, isClient: true });
    } else {
      this.setState({ isOffline: false, isClient: true });
    }

    window.addEventListener("online", this.updateOnlineStatus);
    window.addEventListener("offline", this.updateOnlineStatus);
  }

  componentWillUnmount() {
    window?.removeEventListener("online", this.updateOnlineStatus);
    window?.removeEventListener("offline", this.updateOnlineStatus);
  }

  updateOnlineStatus = () => {
    // Check if navigator is available (SSR safety)
    if (typeof navigator === "undefined") return;
    
    const isCurrentlyOffline = !navigator.onLine;

    if (this.state.isOffline && !isCurrentlyOffline) {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
    this.setState({ isOffline: isCurrentlyOffline });
  };

  render() {
    const { hasError, isOffline, isClient } = this.state;

    if (isClient && isOffline) {
      return <ServerError />;
    }

    if (hasError) {
      return <ServerError />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
