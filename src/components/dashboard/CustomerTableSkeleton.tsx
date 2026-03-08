import { motion } from "framer-motion";

function ShimmerRow() {
  return (
    <tr className="border-b border-border/10">
      <td className="p-4"><div className="h-4 w-28 rounded-md bg-muted animate-pulse" /></td>
      <td className="p-4"><div className="h-4 w-40 rounded-md bg-muted animate-pulse" /></td>
      <td className="p-4"><div className="h-5 w-16 rounded-full bg-muted animate-pulse" /></td>
      <td className="p-4"><div className="h-6 w-6 rounded-full bg-muted animate-pulse" /></td>
      <td className="p-4"><div className="h-6 w-6 rounded-full bg-muted animate-pulse" /></td>
      <td className="p-4"><div className="h-4 w-4 rounded bg-muted animate-pulse" /></td>
    </tr>
  );
}

export function CustomerTableSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/20">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-3 w-16 rounded bg-muted animate-pulse mt-2" />
      </div>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-border/20">
            {["", "", "", "", "", ""].map((_, i) => (
              <th key={i} className="p-4"><div className="h-3 w-14 rounded bg-muted/50 animate-pulse" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerRow key={i} />
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
