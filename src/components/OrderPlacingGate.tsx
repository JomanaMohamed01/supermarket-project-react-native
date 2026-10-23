import { useEffect, useState } from "react";
import { ActionLoader } from "@/components/ActionLoader";
import { subscribeOrderPlacing } from "@/lib/orderPlacement";

export function OrderPlacingGate() {
  const [placing, setPlacing] = useState(false);

  useEffect(() => subscribeOrderPlacing(setPlacing), []);

  if (!placing) return null;

  return <ActionLoader message="Placing order..." />;
}
