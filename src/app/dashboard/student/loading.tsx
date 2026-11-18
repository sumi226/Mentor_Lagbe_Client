import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <LoadingSpinner
      label="Loading your applications…"
      className="min-h-[30vh]"
    />
  );
}
