import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Building2, DoorOpen, SearchX, User } from 'lucide-react';
import { useSearch } from './useSearch';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { data, isLoading, isError, refetch } = useSearch(q);

  if (!q.trim()) {
    return (
      <EmptyState
        icon={SearchX}
        title="Type a search query"
        description="Search across guests, rooms, and PGs."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const hasResults = data && (data.guests.length || data.rooms.length || data.pgs.length);

  if (!hasResults) {
    return (
      <EmptyState
        icon={SearchX}
        title={`No results for "${q}"`}
        description="Try a different search term."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-primary">Results for "{q}"</h1>

      {data.pgs.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">PGs</h2>
          <div className="grid gap-2">
            {data.pgs.map((pg) => (
              <Link key={pg.id} to={`/pgs/${pg.id}`}>
                <Card className="flex items-center gap-3 p-4 hover:bg-surface-variant/50">
                  <Building2 className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{pg.name}</p>
                    <p className="text-xs text-text-secondary">
                      {pg.address}, {pg.city}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.guests.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">Guests</h2>
          <div className="grid gap-2">
            {data.guests.map((guest) => (
              <Link key={guest.id} to={`/guests/${guest.id}`}>
                <Card className="flex items-center gap-3 p-4 hover:bg-surface-variant/50">
                  <User className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{guest.name}</p>
                    <p className="text-xs text-text-secondary">{guest.phone}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.rooms.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">Rooms</h2>
          <div className="grid gap-2">
            {data.rooms.map((room) => (
              <Link key={room.id} to={`/guests?pgId=${room.pgId}`}>
                <Card className="flex items-center gap-3 p-4 hover:bg-surface-variant/50">
                  <DoorOpen className="h-4 w-4 text-text-tertiary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Room {room.roomNumber}</p>
                    <p className="text-xs text-text-secondary">Capacity {room.capacity}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
