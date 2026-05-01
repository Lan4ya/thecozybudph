import { recentTransactions } from "../data/mock-analytics";

export const RecentTransactions = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((txn, index) => (
              <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 text-sm font-mono text-primary">{txn.id}</td>
                <td className="py-3 px-4 text-sm">{txn.customer}</td>
                <td className="py-3 px-4 text-sm font-medium">{txn.amount}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
