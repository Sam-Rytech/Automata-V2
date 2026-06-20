import { cn } from '@/lib/utils';

const getBaseClassName = () => 'animate-pulse rounded-md bg-muted';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn(getBaseClassName(), className)} {...props} />
  );
}

export { Skeleton };