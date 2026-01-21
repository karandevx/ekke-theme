import React from "react";
import styles from "./stepper.less";
import SvgWrapper from "../core/svgWrapper/SvgWrapper";

export default function Stepper({
  icon = "checkmark-xs",
  steps = [],
  currentStepIdx = 1,
  customStepperClass = "",
  customStepItemClass = "",
  onStepClick, // Add this new prop
}) {
  const getStepStatus = (idx) => {
    if (idx < currentStepIdx) {
      return "completed";
    } else if (idx === currentStepIdx) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  const handleStepClick = (index) => {
    // Only allow clicking on completed or current steps
    if (index < currentStepIdx && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className={`${styles.stepper} ${customStepperClass} bg-ekke-bg`}>
      <div className={`${styles.stepperContainer} p-4`}>
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`${styles.stepItem} ${customStepItemClass}`}
          >
            <div className={styles.selectorContainer}>
              {index === currentStepIdx && <div className={styles.selector} />}
            </div>
            <span
              className={`${styles.stepLabel} ${styles[getStepStatus(index)]} font-archivo font-normal text-bodycopy1 leading-[120%] tracking-[0] uppercase body-1 !text-black ${
                index <= currentStepIdx
                  ? "cursor-pointer hover:opacity-70"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => handleStepClick(index)}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
