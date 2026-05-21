import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vendorName: string;
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewForm({ open, onOpenChange, vendorName, initialRating = 0, initialComment = "", onSubmit }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit(rating, comment.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Rate {vendorName}</DialogTitle>
          <DialogDescription>Share your experience with this vendor.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${n} star`}
                >
                  <Star className={`h-7 w-7 ${(hover || rating) >= n ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Comment</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others about your experience..." rows={4} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 hover:bg-muted hover:text-foreground hover:border-border">Cancel</Button>
            <Button onClick={handleSubmit} disabled={rating < 1} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
