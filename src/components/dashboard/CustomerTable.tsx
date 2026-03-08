import { useState } from "react";
import { Users, MoreHorizontal, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { CustomerTableSkeleton } from "./CustomerTableSkeleton";

interface Customer {
  id: string;
  name: string;
  email: string;
  sent_at: string | null;
  opened: boolean;
  clicked: boolean;
  sequence_step?: number;
  sequence_stopped?: boolean;
  next_send_at?: string | null;
}

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

function getTimeUntil(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Soon";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "< 1 hour";
  if (diffHours < 24) return `in ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays}d`;
}

function SequenceBadge({ step, stopped }: { step: number; stopped: boolean }) {
  if (step === 0) return <span className="text-muted-foreground/40 text-[10px] px-1.5 py-0.5 rounded bg-secondary font-medium">Legacy</span>;

  if (stopped && step < 3) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                s <= step
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground/40"
              }`}
            >
              {s <= step ? `📧 ${s} ✓` : `📧 ${s}`}
            </span>
          ))}
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium w-fit">
          ⛔ Stopped
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((s) => {
        const isSent = s <= step;
        return (
          <span
            key={s}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isSent
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground/40"
            }`}
          >
            {isSent ? `📧 ${s} ✓` : `📧 ${s}`}
          </span>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: "Sent" | "Pending" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      status === "Sent"
        ? "bg-primary/15 text-primary"
        : "bg-secondary text-muted-foreground"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "Sent" ? "bg-primary" : "bg-muted-foreground/50"
      }`} />
      {status}
    </span>
  );
}

function BoolCell({ value }: { value: boolean | null }) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Yes
      </span>
    );
  }
  return <span className="text-muted-foreground/40 text-sm">—</span>;
}

function AvatarCircle({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
      {letter}
    </div>
  );
}

export function CustomerTable({ customers, isLoading, onDelete }: CustomerTableProps) {
  const reducedMotion = useReducedMotion();
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  if (isLoading) return <CustomerTableSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: reducedMotion ? 0.01 : 0.3, ease: [0.33, 1, 0.68, 1] }}
      className="glass-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/20">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">Customers</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{customers.length} total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border/20">
              {["Name", "Email", "Status", "Sequence", "Next Email", "Opened", "Clicked", ""].map((h) => (
                <th key={h || "actions"} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] p-3 sm:p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">No customers yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Upload a CSV or add one manually to get started.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {customers.map((c, i) => {
                  const step = c.sequence_step || 0;
                  const stopped = !!c.sequence_stopped;
                  const showNextEmail = step > 0 && step < 3 && !stopped && c.next_send_at;

                  return (
                    <motion.tr
                      key={c.id}
                      initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                      className="border-b border-border/10 transition-colors duration-150 hover:bg-secondary/40 group"
                    >
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2.5">
                          <AvatarCircle name={c.name} />
                          <span className="text-sm text-foreground font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs text-muted-foreground font-mono">{maskEmail(c.email)}</td>
                      <td className="p-3 sm:p-4">
                        <StatusBadge status={c.sent_at ? "Sent" : "Pending"} />
                      </td>
                      <td className="p-3 sm:p-4">
                        <SequenceBadge step={step} stopped={stopped} />
                      </td>
                      <td className="p-3 sm:p-4">
                        {showNextEmail ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getTimeUntil(c.next_send_at)}
                          </span>
                        ) : step >= 3 ? (
                          <span className="text-xs text-primary font-medium">Complete ✓</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <BoolCell value={!!c.opened} />
                      </td>
                      <td className="p-3 sm:p-4">
                        <BoolCell value={!!c.clicked} />
                      </td>
                      <td className="p-3 sm:p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-secondary">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(c)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.name}</span> and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) onDelete?.(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
