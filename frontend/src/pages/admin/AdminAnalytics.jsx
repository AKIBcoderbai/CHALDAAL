import React, { useEffect, useState } from "react";
import { FaUsers, FaStore, FaBox, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import "./AdminAnalytics.css";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading Analytics...</div>;
  if (!data) return <div>Failed to load data.</div>;

  return (
    <div className="analytics-container">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>৳ {data.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon"><FaBox /></div>
          <div className="stat-info">
            <h3>Products Sold</h3>
            <p>{data.totalProductsSold.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{data.users.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><FaStore /></div>
          <div className="stat-info">
            <h3>Active Sellers</h3>
            <p>{data.sellers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="admin-card mt-30">
        <h3><FaChartLine /> Recent Sales (Last 7 Days)</h3>
        {data.recentSales && data.recentSales.length > 0 ? (
          <div className="sales-chart-mock">
            {data.recentSales.map((sale, idx) => (
              <div key={idx} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${Math.max(20, sale.order_count * 15)}px` }}
                  title={`${sale.order_count} orders`}
                >
                  <span className="bar-value">{sale.order_count}</span>
                </div>
                <div className="chart-label">
                  {new Date(sale.sale_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No sales data for the last 7 days.</p>
        )}
      </div>

      <div className="admin-card">
        <h3>Platform Details</h3>
        <ul className="details-list">
          <li><strong>Total Catalog Items:</strong> {data.totalProducts}</li>
          <li><strong>Total Lifetime Orders:</strong> {data.totalOrders}</li>
          <li><strong>Registered Riders:</strong> {data.riders}</li>
        </ul>
      </div>
    </div>
  );
}
