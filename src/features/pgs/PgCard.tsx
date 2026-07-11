import { Link } from 'react-router-dom';
import { Building2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { PgDto } from '@/api/types';

interface PgCardProps {
  pg: PgDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function PgCard({ pg, onEdit, onDelete }: PgCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3 p-5">
      <Link to={`/pgs/${pg.id}`} className="flex flex-1 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-container">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{pg.name}</p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {pg.address}, {pg.city}
          </p>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-error">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
