import React from "react";
import styles from "./server-error.less";
import { FDKLink } from "fdk-core/components";

function ServerError() {
  const suggestions = [
    {
      text: "CONTACT SUPPORT",
      link: "/contact-us",
    },
    {
      text: "GO TO HOME",
      link: "/",
    },
  ];

  return (
    <div className={styles.serverErrorContainer}>
      <div className={styles.container}>
        {/* Error Message Section */}
        <div className={styles.messageSection}>
          <div className={styles.errorSection}>
            <div className={styles.errorTitle}>
              There is an internal server error. Try again.
            </div>
            <p className={styles.errorSubtitle}>
              Something went wrong. Try Again
            </p>
          </div>

          {/* Suggestions Section */}
          <div className={styles.suggestionsSection}>
            <div className={styles.suggestionsTitle}> We Suggest:</div>
            <div className={styles.suggestionsList}>
              {suggestions.map((suggestion, index) => (
                <FDKLink
                  key={index}
                  to={suggestion.link}
                  className={styles.suggestionLink}
                >
                  {suggestion.text}
                </FDKLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerError;
