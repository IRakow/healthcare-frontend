// Mock data service for admin dashboard
// In production, these would fetch from your Supabase database

export async function getAdminStats() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    totalUsers: 1247,
    activeEmployers: 18,
    totalRevenue: 285400
  };
}

export async function getEmployerBreakdown() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    { name: 'Techfinity Corp', revenue: 68500 },
    { name: 'NovaHealth', revenue: 47200 },
    { name: 'Atlas Inc', revenue: 33400 },
  ];
}

export async function getAiAuditPreview() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return [
    { 
      user: 'john.doe@atlas.com', 
      input: 'Book me an appointment next week', 
      output: 'Appointment scheduled for...' 
    },
    { 
      user: 'jane@novahealth.com', 
      input: 'Show me last lab results', 
      output: 'Displaying results from July 28...' 
    },
  ];
}