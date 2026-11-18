import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <LoadingSpinner label="Loading transactions…" className="min-h-[30vh]" />
  );
}
