import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <LoadingSpinner
      label="Loading admin overview…"
      className="min-h-[30vh]"
    />
  );
}
