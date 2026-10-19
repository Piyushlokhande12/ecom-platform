import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ORDER_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

/**
 * Visual progress stepper component showing order fulfillment progression
 */
export default function OrderStatusStepper({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="order-cancelled-banner">
        <AlertCircle size={16} />
        <span>This order was cancelled. Items have been restocked.</span>
      </div>
    );
  }

  const currentStep = ORDER_STEPS.indexOf(status);

  return (
    <div className="order-stepper-wrap">
      <div className="stepper-track">
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step}
              className={`stepper-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
            >
              <div className="step-node">
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <div className="step-pulse-dot"></div>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className="step-label">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
