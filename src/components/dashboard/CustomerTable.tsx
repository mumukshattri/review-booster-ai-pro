import { useState } from "react";
import { Users, MoreHorizontal, Check, Minus, Trash2 } from "lucide-react";
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
}

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

function StatusBadge({ status }: { status: "Sent" | "Pending" }) {
  const isSent = status === "Sent";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isSent
        ? "bg-primary/15 text-primary"
        : "bg-secondary text-muted-foreground"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        isSent ? "bg-primary animate-pulse" : "bg-muted-foreground/50 animate-pulse"
      }`} />
      {status}
    </span>
  );
}

function BoolIcon({ value, color }: { value: boolean; color: string }) {
  return value ? (
    <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center`}>
      <Check className="h-3 w-3 text-foreground" />
    </div>
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground/30" />
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
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border/20">
              {["Name", "Email", "Status", "Opened", "Clicked", ""].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em] p-3 sm:p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground">
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
                {customers.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                    className="border-b border-border/10 table-row-hover group"
                  >
                    <td className="p-3 sm:p-4 text-sm text-foreground font-medium">{c.name}</td>
                    <td className="p-3 sm:p-4 text-sm text-muted-foreground font-mono text-xs">{c.email}</td>
                    <td className="p-3 sm:p-4">
                      <StatusBadge status={c.sent_at ? "Sent" : "Pending"} />
                    </td>
                    <td className="p-3 sm:p-4">
                      <BoolIcon value={!!c.opened} color="bg-emerald-500/20" />
                    </td>
                    <td className="p-3 sm:p-4">
                      <BoolIcon value={!!c.clicked} color="bg-amber-500/20" />
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
                            onClick={() => onDelete?.(c.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
