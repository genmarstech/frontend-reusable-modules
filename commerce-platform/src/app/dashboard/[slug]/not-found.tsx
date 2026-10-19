import { ErrorState } from "@/components/ui/States";

export default function NotFound() {
  return <ErrorState title="Not found" detail="That doesn't exist, or isn't this business's." />;
}
