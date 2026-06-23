import { cn } from '@/lib/utils';

const DEFAULT_CLASSES = 'animate-pulse rounded-md bg-muted';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='skeleton' className={cn(DEFAULT_CLASSES, className)} {...props} />
  );
}

export { Skeleton };