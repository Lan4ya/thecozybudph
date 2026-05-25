// Revenue data over time
export const revenueData = [
  { date: "Jan 1", revenue: 2400, orders: 24 },
  { date: "Jan 5", revenue: 3200, orders: 32 },
  { date: "Jan 10", revenue: 2800, orders: 28 },
  { date: "Jan 15", revenue: 4100, orders: 41 },
  { date: "Jan 20", revenue: 3800, orders: 38 },
  { date: "Jan 25", revenue: 4900, orders: 49 },
  { date: "Jan 30", revenue: 5200, orders: 52 },
  { date: "Feb 5", revenue: 4700, orders: 47 },
  { date: "Feb 10", revenue: 5800, orders: 58 },
  { date: "Feb 15", revenue: 6100, orders: 61 },
  { date: "Feb 20", revenue: 6500, orders: 65 },
  { date: "Feb 25", revenue: 7200, orders: 72 },
];

// Sales by category
export const categoryData = [
  { name: "Bouquets", value: 35, color: "#ec4899" },
  { name: "Arrangements", value: 28, color: "#f43f5e" },
  { name: "Subscriptions", value: 22, color: "#f97316" },
  { name: "Accessories", value: 15, color: "#eab308" },
];

// Top products
export const topProductsData = [
  { name: "Romantic Red Roses", sales: 1250, revenue: 12500 },
  { name: "Sunflower Delight", sales: 1050, revenue: 10500 },
  { name: "Tulip Rainbow", sales: 890, revenue: 8900 },
  { name: "Wildflower Mix", sales: 765, revenue: 7650 },
  { name: "Cherry Blossom", sales: 640, revenue: 6400 },
];

import { DollarSign, ShoppingCart, Users, BarChart3 } from "lucide-react";

// Key metrics
export const keyMetrics = [
  {
    label: "Total Revenue",
    value: "₱58,200",
    change: "+12.5%",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "487",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    label: "Total Customers",
    value: "342",
    change: "+5.1%",
    positive: true,
    icon: Users,
  },
  {
    label: "Conversion Rate",
    value: "3.2%",
    change: "-0.5%",
    positive: false,
    icon: BarChart3,
  },
];

// Daily orders trend
export const ordersData = [
  { date: "Mon", orders: 45 },
  { date: "Tue", orders: 52 },
  { date: "Wed", orders: 48 },
  { date: "Thu", orders: 61 },
  { date: "Fri", orders: 73 },
  { date: "Sat", orders: 89 },
  { date: "Sun", orders: 67 },
];

// Customer acquisition by month
export const customerData = [
  { month: "January", customers: 45 },
  { month: "February", customers: 62 },
  { month: "March", customers: 58 },
  { month: "April", customers: 71 },
  { month: "May", customers: 85 },
  { month: "June", customers: 92 },
];

// Recent transactions
export const recentTransactions = [
  {
    id: "TXN001",
    customer: "Sarah Johnson",
    amount: "₱1,250.00",
    status: "Completed",
    date: "Today at 2:30 PM",
  },
  {
    id: "TXN002",
    customer: "Michael Chen",
    amount: "₱895.50",
    status: "Completed",
    date: "Today at 1:15 PM",
  },
  {
    id: "TXN003",
    customer: "Emma Wilson",
    amount: "₱2,150.00",
    status: "Pending",
    date: "Today at 12:45 PM",
  },
  {
    id: "TXN004",
    customer: "David Martinez",
    amount: "₱1,457.50",
    status: "Completed",
    date: "Yesterday at 4:20 PM",
  },
  {
    id: "TXN005",
    customer: "Lisa Anderson",
    amount: "₱1,955.00",
    status: "Completed",
    date: "Yesterday at 3:10 PM",
  },
];

// Product performance
export const productPerformance = [
  {
    name: "Romantic Red Roses",
    views: 2450,
    clicks: 1250,
    conversions: 125,
    revenue: "₱12,500",
  },
  {
    name: "Sunflower Delight",
    views: 2100,
    clicks: 1050,
    conversions: 105,
    revenue: "₱10,500",
  },
  {
    name: "Tulip Rainbow",
    views: 1780,
    clicks: 890,
    conversions: 89,
    revenue: "₱8,900",
  },
  {
    name: "Wildflower Mix",
    views: 1530,
    clicks: 765,
    conversions: 76,
    revenue: "₱7,650",
  },
];
