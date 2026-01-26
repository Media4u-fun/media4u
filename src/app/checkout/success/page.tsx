import { type ReactElement, Suspense } from "react";
import { CheckoutSuccessContent } from "./checkout-success-content";

function LoadingFallback(): ReactElement {
  return <div className="mesh-bg min-h-screen" />;
}

export default function CheckoutSuccessPage(): ReactElement {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
