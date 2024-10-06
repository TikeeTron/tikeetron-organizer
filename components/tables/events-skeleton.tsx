import { Skeleton } from "../ui/skeleton";

export default function EventsSkeleton() {
  return (
    <div className="flex flex-col space-y-1">
      {[...Array(10)].map((_, index) => {
        return (
          <Skeleton
            key={index}
            className="w-full h-8 rounded-md"
          />
        );
      })}
    </div>
  );
}
