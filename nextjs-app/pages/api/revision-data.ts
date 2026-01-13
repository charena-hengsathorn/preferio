import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch data from the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/all-reports`);
    
    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract revision management data
    const revisionData = {
      reports: data.reports?.map((report: any) => ({
        id: report.id,
        name: report.name,
        version: report.version,
        status: report.status,
        company_id: report.company_id,
        locked_by: report.locked_by,
        locked_at: report.locked_at,
        created_by: report.created_by,
        last_modified_by: report.last_modified_by,
        created_at: report.created_at,
        updated_at: report.updated_at,
        audit_trail: report.audit_trail || [],
        date_range: report.date_range,
        source: report.source
      })) || [],
      summary: {
        total_reports: data.reports?.length || 0,
        draft_reports: data.reports?.filter((r: any) => r.status === 'draft').length || 0,
        locked_reports: data.reports?.filter((r: any) => r.status === 'locked').length || 0,
        published_reports: data.reports?.filter((r: any) => r.status === 'published').length || 0,
        archived_reports: data.reports?.filter((r: any) => r.status === 'archived').length || 0,
        total_versions: data.reports?.reduce((sum: number, r: any) => sum + (r.version || 1), 0) || 0,
        total_audit_entries: data.reports?.reduce((sum: number, r: any) => sum + (r.audit_trail?.length || 0), 0) || 0
      }
    };
    
    res.status(200).json(revisionData);
  } catch (error) {
    console.error('Error fetching revision data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch revision data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
