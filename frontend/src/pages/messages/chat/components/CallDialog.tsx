import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Phone, Video } from 'lucide-react';

type CallDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCallStart: (type: 'audio' | 'video') => void;
  recipientName: string;
};

export function CallDialog({ isOpen, onClose, onCallStart, recipientName }: CallDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a call with {recipientName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-4 py-4">
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 h-24 w-24 rounded-full"
            onClick={() => onCallStart('audio')}
          >
            <Phone className="h-6 w-6" />
            <span>Voice</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex flex-col items-center gap-2 h-24 w-24 rounded-full"
            onClick={() => onCallStart('video')}
          >
            <Video className="h-6 w-6" />
            <span>Video</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
