import React, { forwardRef, Children, isValidElement } from 'react';
import { CHECK_PATH } from './iconPaths';
import './Stepper.css';

/**
 * Props for the StepperPanel component
 */
export interface StepperPanelProps {
  /** Unique key identifying this step */
  stepKey: string;
  /** Step label text */
  header?: string;
  /** Custom indicator content — replaces the number/check */
  icon?: React.ReactNode;
  /** Step content */
  children?: React.ReactNode;
  /** Additional CSS class name for the panel */
  className?: string;
  /** Inline styles for the panel */
  style?: React.CSSProperties;
}

/**
 * StepperPanel defines a single step within a Stepper.
 *
 * @description Must be used as a direct child of Stepper. Each panel requires a unique
 * `stepKey` prop. The `header` prop is displayed as the step label. An optional `icon`
 * prop replaces the default number/check indicator. Content is only rendered when active.
 *
 * @example
 * ```tsx
 * <Stepper activeStep="account">
 *   <StepperPanel stepKey="account" header="Account">Form here</StepperPanel>
 *   <StepperPanel stepKey="confirm" header="Confirm">Review here</StepperPanel>
 * </Stepper>
 * ```
 */
export const StepperPanel = forwardRef<HTMLDivElement, StepperPanelProps>(
  (_props, _ref) => null,
);

StepperPanel.displayName = 'StepperPanel';

/**
 * Props for the Stepper component
 */
export interface StepperProps {
  /** Key of the currently active step */
  activeStep: string;
  /** Orientation of the step indicators */
  orientation?: 'horizontal' | 'vertical';
  /** Position of the label relative to the indicator */
  labelPosition?: 'end' | 'bottom';
  /** Allow clicking completed steps to navigate back */
  clickable?: boolean;
  /** Callback when a step is clicked (only completed steps when clickable) */
  onStepChange?: (key: string) => void;
  /** StepperPanel children */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Stepper displays a multi-step progress indicator with associated content panels.
 *
 * @description Renders StepperPanel children as a sequence of steps with numbered
 * indicators, connector lines, and labels. Steps before the active one show a check
 * icon (completed). The active step is highlighted. Steps after are pending. When
 * `clickable` is enabled, completed steps can be clicked to navigate back. Use
 * `labelPosition="bottom"` to place labels below the indicators. Each StepperPanel
 * can provide a custom `icon` to replace the default number/check. Only the active
 * panel's content is rendered. Supports horizontal and vertical orientations.
 *
 * @example
 * ```tsx
 * <Stepper activeStep="details" clickable onStepChange={setStep}>
 *   <StepperPanel stepKey="account" header="Account"><p>Step 1</p></StepperPanel>
 *   <StepperPanel stepKey="details" header="Details"><p>Step 2</p></StepperPanel>
 *   <StepperPanel stepKey="confirm" header="Confirm"><p>Step 3</p></StepperPanel>
 * </Stepper>
 * ```
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, orientation = 'horizontal', labelPosition = 'end', clickable = false, onStepChange, children, className = '', style }, ref) => {
    const panels = Children.toArray(children).filter(
      (child): child is React.ReactElement<StepperPanelProps> =>
        isValidElement(child) && (child.type as { displayName?: string }).displayName === 'StepperPanel',
    );

    const activeIndex = panels.findIndex((p) => p.props.stepKey === activeStep);
    const activePanel = panels[activeIndex];
    const base = 'k-stepper';
    const classes = [
      base,
      `${base}--${orientation}`,
      labelPosition === 'bottom' && `${base}--label-bottom`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} style={style} role="group" aria-label="Progress">
        <div className={`${base}__header`}>
          {panels.map((panel, i) => {
            const { stepKey, header, icon } = panel.props;
            const isCompleted = i < activeIndex;
            const isActive = i === activeIndex;
            const canClick = clickable && isCompleted;

            const stepClasses = [
              `${base}__step`,
              isActive && `${base}__step--active`,
              isCompleted && `${base}__step--completed`,
              canClick && `${base}__step--clickable`,
            ].filter(Boolean).join(' ');

            const indicator = icon ?? (
              isCompleted
                ? <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d={CHECK_PATH} /></svg>
                : i + 1
            );

            return (
              <React.Fragment key={stepKey}>
                {i > 0 && (
                  <div className={`${base}__connector ${isCompleted ? `${base}__connector--completed` : ''}`} aria-hidden="true" />
                )}
                <div
                  className={stepClasses}
                  role="tab"
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={!canClick || undefined}
                  tabIndex={canClick ? 0 : undefined}
                  onClick={canClick ? () => onStepChange?.(stepKey) : undefined}
                  onKeyDown={canClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStepChange?.(stepKey); } } : undefined}
                >
                  <span className={`${base}__indicator`} aria-hidden="true">{indicator}</span>
                  {header && <span className={`${base}__label`}>{header}</span>}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {activePanel?.props.children && (
          <div
            className={`${base}__content ${activePanel.props.className ?? ''}`}
            style={activePanel.props.style}
            role="tabpanel"
          >
            {activePanel.props.children}
          </div>
        )}
      </div>
    );
  },
);

Stepper.displayName = 'Stepper';
