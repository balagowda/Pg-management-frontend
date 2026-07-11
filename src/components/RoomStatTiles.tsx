import { cn } from '@/lib/cn';

interface RoomStatTilesProps {
  capacity: number;
  occupied: number;
}

/** Capacity/Occupied/Vacant compact tile row for the room detail page. */
export function RoomStatTiles({ capacity, occupied }: RoomStatTilesProps) {
  const vacant = Math.max(capacity - occupied, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Tile label="Capacity" value={capacity} filled />
      <Tile label="Occupied" value={occupied} />
      <Tile label="Vacant" value={vacant} />
    </div>
  );
}

function Tile({ label, value, filled }: { label: string; value: number; filled?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-card border border-divider py-5',
        filled ? 'bg-primary text-primary-foreground' : 'bg-card text-text-primary',
      )}
    >
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span
        className={cn('text-xs', filled ? 'text-primary-foreground/80' : 'text-text-secondary')}
      >
        {label}
      </span>
    </div>
  );
}
