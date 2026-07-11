import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DoorOpen, Search, User } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from './useSearch';
import { Input } from '@/components/ui/input';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useSearch(debounced);
  const hasResults = data && (data.guests.length || data.rooms.length || data.pgs.length);

  function goTo(path: string) {
    setOpen(false);
    setQuery('');
    navigate(path);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && query.trim()) {
      goTo(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Search guests, rooms, PGs…"
          className="pl-9"
        />
      </div>

      {open && debounced.trim() && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-field border border-divider bg-surface shadow-md">
          {isFetching && <p className="px-3 py-3 text-sm text-text-tertiary">Searching…</p>}
          {!isFetching && !hasResults && (
            <p className="px-3 py-3 text-sm text-text-tertiary">No results for "{debounced}"</p>
          )}
          {!isFetching && hasResults && (
            <div className="max-h-80 overflow-y-auto py-1">
              {data.pgs.slice(0, 3).map((pg) => (
                <button
                  key={pg.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-variant"
                  onMouseDown={() => goTo(`/pgs/${pg.id}`)}
                >
                  <Building2 className="h-4 w-4 text-text-tertiary" />
                  <span>{pg.name}</span>
                </button>
              ))}
              {data.guests.slice(0, 3).map((guest) => (
                <button
                  key={guest.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-variant"
                  onMouseDown={() => goTo(`/guests/${guest.id}`)}
                >
                  <User className="h-4 w-4 text-text-tertiary" />
                  <span>{guest.name}</span>
                </button>
              ))}
              {data.rooms.slice(0, 3).map((room) => (
                <button
                  key={room.id}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-variant"
                  onMouseDown={() => goTo(`/guests?pgId=${room.pgId}`)}
                >
                  <DoorOpen className="h-4 w-4 text-text-tertiary" />
                  <span>Room {room.roomNumber}</span>
                </button>
              ))}
              <button
                className="w-full border-t border-divider px-3 py-2 text-left text-xs font-medium text-primary hover:bg-surface-variant"
                onMouseDown={() => goTo(`/search?q=${encodeURIComponent(debounced)}`)}
              >
                See all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
