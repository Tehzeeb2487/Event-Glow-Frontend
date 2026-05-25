import StatCard from "@/components/shared/StateCard";
import { DollarSign, TrendingUp, Wallet, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface MonthlyEarnings {
  month: string;
  earnings: number;
}

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayout: 0,
    transactions: 0
  });
  const [monthlyEarningData, setMonthlyEarningData] = useState<MonthlyEarnings[]>([]);

  const fetchMonthlyEarnings = async () => {
    const token = localStorage.getItem("token");
    
    const res = await axios.get(
      "https://eventglow-backend.onrender.com/api/vendors/earnings/monthly",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setMonthlyEarningData(res.data);
  }

  useEffect(() => {
    fetchMonthlyEarnings();
  }, []);

  const formattedMonthlyEarnings = monthlyEarningData.map(item => ({
    month: item.month,
    amount: item.earnings,
  }));

  const maxAmount =
  formattedMonthlyEarnings.length > 0
    ? Math.max(...formattedMonthlyEarnings.map(d => d.amount))
    : 0;

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/vendors/earnings/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setData(res.data);
    } catch(error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEarnings();
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading earnings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Earnings</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Earnings" value={`₹${data.totalEarnings}`} icon={DollarSign} variant="default" />
        <StatCard title="This Month" value={`₹${data.thisMonth}`} icon={TrendingUp} variant="success" />
        <StatCard title="Pending Payout" value={`₹${data.pendingPayout}`} icon={Wallet} variant="warning" />
        <StatCard title="Transactions" value={`${data.transactions}`} icon={CreditCard} variant="accent" />
      </div>

      {/* Simple bar chart */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h3 className="mb-6 font-display text-lg font-semibold text-card-foreground">Monthly Revenue</h3>
        <div className="flex items-end gap-3 h-48">
          {formattedMonthlyEarnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No monthly earnings right now</p>
          ) : (formattedMonthlyEarnings.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                ₹{(d.amount / 1000).toFixed(0)}k
              </span>
              <div
                className="w-full rounded-t-lg bg-primary/80 transition-all"
                style={{ height: maxAmount > 0 
                  ? `${(d.amount / maxAmount) * 100}%`
                  : "0%"
                }}
              />
              <span className="text-xs text-muted-foreground">{d.month}</span>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
