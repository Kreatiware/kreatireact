import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, StepperPanel } from '../../../../packages/react/src/components/Stepper';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A multi-step progress indicator with content panels. Steps show numbered indicators with check icons for completed steps. Supports horizontal/vertical orientation, label positioning, custom icons, and clickable navigation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = ['account', 'details', 'confirm'] as const;

/** Interactive stepper with next/back navigation. */
export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('account');
    const idx = steps.indexOf(active as typeof steps[number]);
    return (
      <div style={{ width: 500 }}>
        <Stepper activeStep={active}>
          <StepperPanel stepKey="account" header="Account">
            <p style={{ margin: '0 0 12px' }}>Create your account credentials.</p>
          </StepperPanel>
          <StepperPanel stepKey="details" header="Details">
            <p style={{ margin: '0 0 12px' }}>Fill in your personal information.</p>
          </StepperPanel>
          <StepperPanel stepKey="confirm" header="Confirm">
            <p style={{ margin: '0 0 12px' }}>Review and confirm your data.</p>
          </StepperPanel>
        </Stepper>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {idx > 0 && <Button label="Back" buttonType="outlined" size="sm" onClick={() => setActive(steps[idx - 1])} />}
          {idx < steps.length - 1 && <Button label="Next" size="sm" onClick={() => setActive(steps[idx + 1])} />}
          {idx === steps.length - 1 && <Button label="Finish" severity="success" size="sm" onClick={() => setActive(steps[0])} />}
        </div>
      </div>
    );
  },
};

/** Labels positioned below the indicators. */
export const LabelBottom: Story = {
  render: () => {
    const [active, setActive] = useState('details');
    const idx = steps.indexOf(active as typeof steps[number]);
    return (
      <div style={{ width: 500 }}>
        <Stepper activeStep={active} labelPosition="bottom" clickable onStepChange={setActive}>
          <StepperPanel stepKey="account" header="Account">
            <p style={{ margin: '0 0 12px' }}>Account setup step.</p>
          </StepperPanel>
          <StepperPanel stepKey="details" header="Details">
            <p style={{ margin: '0 0 12px' }}>Personal details step.</p>
          </StepperPanel>
          <StepperPanel stepKey="confirm" header="Confirm">
            <p style={{ margin: '0 0 12px' }}>Confirmation step.</p>
          </StepperPanel>
        </Stepper>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {idx > 0 && <Button label="Back" buttonType="outlined" size="sm" onClick={() => setActive(steps[idx - 1])} />}
          {idx < steps.length - 1 && <Button label="Next" size="sm" onClick={() => setActive(steps[idx + 1])} />}
        </div>
      </div>
    );
  },
};

/** Clickable completed steps allow navigating back. */
export const Clickable: Story = {
  render: () => {
    const [active, setActive] = useState('account');
    const idx = steps.indexOf(active as typeof steps[number]);
    return (
      <div style={{ width: 500 }}>
        <Stepper activeStep={active} clickable onStepChange={setActive}>
          <StepperPanel stepKey="account" header="Account">
            <p style={{ margin: '0 0 12px' }}>Click any completed step indicator to go back.</p>
          </StepperPanel>
          <StepperPanel stepKey="details" header="Details">
            <p style={{ margin: '0 0 12px' }}>You can click "Account" above to return.</p>
          </StepperPanel>
          <StepperPanel stepKey="confirm" header="Confirm">
            <p style={{ margin: '0 0 12px' }}>Both previous steps are clickable.</p>
          </StepperPanel>
        </Stepper>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {idx < steps.length - 1 && <Button label="Next" size="sm" onClick={() => setActive(steps[idx + 1])} />}
        </div>
      </div>
    );
  },
};

/** Vertical orientation with clickable steps. */
export const Vertical: Story = {
  render: () => {
    const [active, setActive] = useState('details');
    return (
      <Stepper activeStep={active} orientation="vertical" clickable onStepChange={setActive} style={{ width: 300 }}>
        <StepperPanel stepKey="account" header="Account">
          <p style={{ margin: 0 }}>Account information.</p>
        </StepperPanel>
        <StepperPanel stepKey="details" header="Details">
          <p style={{ margin: 0 }}>Personal details.</p>
        </StepperPanel>
        <StepperPanel stepKey="confirm" header="Confirm">
          <p style={{ margin: 0 }}>Review everything.</p>
        </StepperPanel>
      </Stepper>
    );
  },
};

/** Custom icons on each step indicator. */
export const CustomIcons: Story = {
  render: () => {
    const [active, setActive] = useState('account');
    const idx = steps.indexOf(active as typeof steps[number]);
    return (
      <div style={{ width: 500 }}>
        <Stepper activeStep={active} clickable onStepChange={setActive}>
          <StepperPanel stepKey="account" header="Account" icon={<span style={{ fontSize: 14 }}>&#9733;</span>}>
            <p style={{ margin: '0 0 12px' }}>Custom star icon on this step.</p>
          </StepperPanel>
          <StepperPanel stepKey="details" header="Details" icon={<span style={{ fontSize: 14 }}>&#9998;</span>}>
            <p style={{ margin: '0 0 12px' }}>Custom pencil icon on this step.</p>
          </StepperPanel>
          <StepperPanel stepKey="confirm" header="Confirm" icon={<span style={{ fontSize: 14 }}>&#10003;</span>}>
            <p style={{ margin: '0 0 12px' }}>Custom check icon on this step.</p>
          </StepperPanel>
        </Stepper>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {idx > 0 && <Button label="Back" buttonType="outlined" size="sm" onClick={() => setActive(steps[idx - 1])} />}
          {idx < steps.length - 1 && <Button label="Next" size="sm" onClick={() => setActive(steps[idx + 1])} />}
        </div>
      </div>
    );
  },
};

/** Indicator only — no panel content. */
export const IndicatorOnly: Story = {
  render: () => (
    <Stepper activeStep="details" style={{ width: 400 }}>
      <StepperPanel stepKey="account" header="Account" />
      <StepperPanel stepKey="details" header="Details" />
      <StepperPanel stepKey="confirm" header="Confirm" />
      <StepperPanel stepKey="done" header="Done" />
    </Stepper>
  ),
};

/** Label bottom without content — pure progress bar. */
export const ProgressBar: Story = {
  render: () => (
    <Stepper activeStep="payment" labelPosition="bottom" style={{ width: 500 }}>
      <StepperPanel stepKey="cart" header="Cart" />
      <StepperPanel stepKey="shipping" header="Shipping" />
      <StepperPanel stepKey="payment" header="Payment" />
      <StepperPanel stepKey="review" header="Review" />
      <StepperPanel stepKey="complete" header="Complete" />
    </Stepper>
  ),
};
