import { useState, useMemo } from "react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Search,
  Users as UsersIcon,
  Shield,
  User,
  Ban,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Mail,
  Phone,
  ShoppingBag,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  MOCK_USERS,
  type MockUser,
  type UserRole,
  type UserStatus,
} from "./data/mock-users";

const ROLE_OPTIONS: { value: UserRole | ""; label: string }[] = [
  { value: "", label: "All Roles" },
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
];

const STATUS_OPTIONS: { value: UserStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" },
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest First",
    sortBy: "joinedAt" as keyof MockUser,
    sortDir: "desc" as const,
  },
  {
    value: "oldest",
    label: "Oldest First",
    sortBy: "joinedAt" as keyof MockUser,
    sortDir: "asc" as const,
  },
  {
    value: "name-asc",
    label: "Name (A-Z)",
    sortBy: "name" as keyof MockUser,
    sortDir: "asc" as const,
  },
  {
    value: "name-desc",
    label: "Name (Z-A)",
    sortBy: "name" as keyof MockUser,
    sortDir: "desc" as const,
  },
  {
    value: "orders-desc",
    label: "Most Orders",
    sortBy: "ordersCount" as keyof MockUser,
    sortDir: "desc" as const,
  },
  {
    value: "spent-desc",
    label: "Highest Spent",
    sortBy: "totalSpentCents" as keyof MockUser,
    sortDir: "desc" as const,
  },
];

function formatCents(cents: number) {
  return `₱${(cents / 100).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function StatusBadge({ status }: { status: UserStatus }) {
  const config = {
    active: {
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 border-green-300",
      label: "Active",
    },
    inactive: {
      icon: Clock,
      className: "bg-gray-100 text-gray-800 border-gray-300",
      label: "Inactive",
    },
    banned: {
      icon: Ban,
      className: "bg-red-100 text-red-800 border-red-300",
      label: "Banned",
    },
  };
  const { icon: Icon, className, label } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
        role === "admin"
          ? "bg-purple-100 text-purple-800 border-purple-300"
          : "bg-blue-100 text-blue-800 border-blue-300",
      )}
    >
      {role === "admin" ? (
        <Shield className="size-3" />
      ) : (
        <User className="size-3" />
      )}
      {role === "admin" ? "Admin" : "Customer"}
    </span>
  );
}

function UserDetailDrawer({
  user,
  isOpen,
  onClose,
}: {
  user: MockUser | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!user || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l h-full overflow-y-auto p-6 shadow-xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user.status} />
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 text-muted-foreground shrink-0" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <ShoppingBag className="size-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{user.ordersCount}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <Banknote className="size-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">
                {formatCents(user.totalSpentCents)}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDate(user.joinedAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Last Active</span>
              <span>{formatRelativeTime(user.lastActiveAt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4">
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
            {user.status !== "banned" ? (
              <Button variant="destructive" className="w-full">
                <Ban className="size-4 mr-2" />
                Ban User
              </Button>
            ) : (
              <Button variant="default" className="w-full">
                <CheckCircle2 className="size-4 mr-2" />
                Unban User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [sortValue, setSortValue] = useState("newest");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sortConfig = SORT_OPTIONS.find((s) => s.value === sortValue)!;

  const filteredUsers = useMemo(() => {
    let result = [...MOCK_USERS];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }

    result.sort((a, b) => {
      const dir = sortConfig.sortDir === "asc" ? 1 : -1;
      if (sortConfig.sortBy === "joinedAt" || sortConfig.sortBy === "name") {
        return (
          dir *
          String(a[sortConfig.sortBy]).localeCompare(
            String(b[sortConfig.sortBy]),
          )
        );
      }
      return (
        dir *
        ((a[sortConfig.sortBy] as number) - (b[sortConfig.sortBy] as number))
      );
    });

    return result;
  }, [search, roleFilter, statusFilter, sortConfig]);

  const activeUsers = MOCK_USERS.filter((u) => u.status === "active").length;
  const totalCustomers = MOCK_USERS.filter((u) => u.role === "customer").length;
  const totalAdmins = MOCK_USERS.filter((u) => u.role === "admin").length;

  const handleViewUser = (user: MockUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <UsersIcon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <User className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Customers</p>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalAdmins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(searchInput);
              }}
              className="pl-9"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
              className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none min-w-[7rem]"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              ▼
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as UserStatus | "")
              }
              className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none min-w-[7rem]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              ▼
            </span>
          </div>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer appearance-none min-w-[9rem]"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▼
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Orders
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Total Spent
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Last Active
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-right">{user.ordersCount}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCents(user.totalSpentCents)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(user.lastActiveAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
