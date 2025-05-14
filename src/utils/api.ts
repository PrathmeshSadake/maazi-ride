import axios from 'axios';

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}; 