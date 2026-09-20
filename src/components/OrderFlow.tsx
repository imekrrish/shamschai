import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';

/**
 * The bag → delivery → payment rail every ordering screen shares, so a
 * shopper always knows how far along they are and how to step back.
 */
const STEPS = [
  { step: 1, label: 'Bag', to: '/cart' },
  { step: 2, label: 'Delivery', to: '/checkout' },
  { step: 3, label: 'Payment', to: null },
] as const;

/** 4 marks every step complete, which is what the confirmation screen shows. */
export function OrderSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="order-steps">
      {STEPS.map(({ step, label, to }) => {
        const state = current > step ? 'done' : current === step ? 'current' : 'todo';
        const body = (
          <>
            <span className="order-step-mark" aria-hidden="true">
              {state === 'done' ? <Check size={11} /> : `0${step}`}
            </span>
            <span className="order-step-label">{label}</span>
          </>
        );
        return (
          <li key={step} className={`order-step is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            {/* Only a step already behind you is worth linking back to. */}
            {state === 'done' && to ? <Link to={to}>{body}</Link> : <span>{body}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flow-back">
      <ChevronLeft size={15} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function OrderFlowBar({ children }: { children: ReactNode }) {
  return (
    <nav className="order-flow-bar" aria-label="Order progress">
      {children}
    </nav>
  );
}
