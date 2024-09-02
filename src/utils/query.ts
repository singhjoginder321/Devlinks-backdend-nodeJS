// utils/query.ts (or where appropriate)
import client from '../config/db';

// Helper function to execute SQL queries
const query = async (text: string, params: any[] = []) => {
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export default query;