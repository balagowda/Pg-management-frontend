import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { telLink, waLink } from '@/lib/whatsapp';

interface ContactActionsRowProps {
  phone: string;
  reminderMessage: string;
  className?: string;
}

/** Call + WhatsApp-reminder buttons — shared between Guest Detail and each Defaulters row. */
export function ContactActionsRow({ phone, reminderMessage, className }: ContactActionsRowProps) {
  return (
    <div className={className ? `flex items-center gap-2 ${className}` : 'flex items-center gap-2'}>
      <Button variant="outline" size="sm" asChild>
        <a href={telLink(phone)}>
          <Phone className="h-4 w-4" />
          Call
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={waLink(phone, reminderMessage)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
          Send Reminder
        </a>
      </Button>
    </div>
  );
}
