import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PAYHIP_PRODUCTS, type PayhipProductKey } from "@/lib/funnel";

interface Props {
  product: PayhipProductKey;
  className?: string;
  children: ReactNode;
  onStart?: () => void;
}

/**
 * Links to the product's hosted Payhip checkout page. Payhip collects payment
 * and emails the receipt; the payhip-webhook function records the sale and
 * runs fulfillment. Until the Payhip product URL exists, the button stays
 * clickable and sends buyers to the contact page with the product preselected.
 */
export function PayhipCheckoutButton({ product, className, children, onStart }: Props) {
  const url = PAYHIP_PRODUCTS[product].url;
  if (!url) {
    return (
      <Link to={`/contact?interest=${product}`} onClick={onStart} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onStart} className={className}>
      {children}
    </a>
  );
}
