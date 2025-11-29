import { Skeleton } from '@/components/ui/skeleton'

export function LoadingChat() {
  return (
    <>
      <header className="w-full p-4 border-b flex items-baseline justify-between text-2xl">
        <Skeleton className="w-[200px] h-8 bg-card" />
        <Skeleton className="w-8 h-8 bg-card" />
      </header>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-[1216px] w-full">
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[200px] h-6 bg-card" />
            <Skeleton className="min-w-[120px] max-w-md h-16 bg-card rounded-md" />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[200px] h-6 bg-card" />
            <Skeleton className="min-w-[120px] max-w-md h-16 bg-card rounded-md" />
          </div>
        </div>
        <div className="w-full flex justify-end">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[200px] h-6 bg-card" />
            <Skeleton className="min-w-[120px] max-w-md w-full h-16 bg-card rounded-md" />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[200px] h-6 bg-card" />
            <Skeleton className="min-w-[120px] max-w-md h-16 bg-card rounded-md" />
          </div>
        </div>
      </div>

      <div className="w-full p-4 max-w-[1216px]">
        <Skeleton className="w-full h-20 bg-card" />
      </div>
    </>
  )
}
