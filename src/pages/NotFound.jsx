import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-gold">
        <Compass size={28} />
      </div>
      <h1 className="font-display text-5xl font-bold text-ink">404</h1>
      <p className="max-w-sm text-sm text-muted">
        This page wandered off somewhere. Let's get you back to tracking your money.
      </p>
      <Link to="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
