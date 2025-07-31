// File: src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayoutGlassy from '@/components/layout/AdminLayoutGlassy';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatCard from '@/components/ui/StatCard';
import { Building2, CreditCard, Users, Shield, Radio, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employers: 12,
    invoices: 43,
    users: 249,
    audits: 12,
    broadcasts: 7,
    backups: 3
  });

  useEffect(() => {
    // Could fetch real data here
  }, []);

  return (
    <AdminLayoutGlassy>
      <motion.div
        className="space-y-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sky-900">Platform Overview</h1>
          <p className="text-gray-500 text-sm">Live summary of system metrics and activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Employers"
            value={stats.employers.toString()}
            icon={<Building2 className="w-4 h-4" />}
            description="Active orgs"
          />
          <StatCard
            label="Invoices"
            value={stats.invoices.toString()}
            icon={<CreditCard className="w-4 h-4" />}
            description="Pending"
          />
          <StatCard
            label="Users"
            value={stats.users.toString()}
            icon={<Users className="w-4 h-4" />}
            description="All roles"
          />
          <StatCard
            label="Audits"
            value={stats.audits.toString()}
            icon={<Shield className="w-4 h-4" />}
            description="Security"
          />
          <StatCard
            label="Broadcasts"
            value={stats.broadcasts.toString()}
            icon={<Radio className="w-4 h-4" />}
            description="Sent"
          />
          <StatCard
            label="Backups"
            value={stats.backups.toString()}
            icon={<Database className="w-4 h-4" />}
            description="Available"
          />
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-3 text-gray-700">
              <li>✅ Employer "SkyHealth" added 12 new users</li>
              <li>📦 Backup completed for July 30th at 4:00 AM</li>
              <li>🔒 Admin logged in from new location</li>
              <li>📣 Broadcast sent to 186 patients</li>
              <li>🧾 Invoice #4829 generated for BrightCare</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayoutGlassy>
  );
}