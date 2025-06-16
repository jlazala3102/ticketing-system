import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

function AuditLogs({ currentPage, onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/audit-logs');
        const data = await response.json();
        setLogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'AUTO_DELETE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Navigation currentPage={currentPage} onNavigate={onNavigate} />

        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          Audit Logs
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                System Activity Log ({logs.length} entries)
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Track all system changes and user actions
              </p>
            </div>
            
            {logs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs yet</h3>
                <p className="text-gray-600">System activity will appear here as users interact with tickets.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {log.entityType} #{log.entityId}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {log.user?.name || 'System'} ({log.user?.role || 'system'})
                          </span>
                        </div>
                        
                        {log.description && (
                          <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                        )}
                        
                        {(log.oldValues || log.newValues) && (
                          <div className="text-xs text-gray-600 space-y-1">
                            {log.oldValues && (
                              <div>
                                <span className="font-medium">Before:</span> {JSON.stringify(log.oldValues, null, 2)}
                              </div>
                            )}
                            {log.newValues && (
                              <div>
                                <span className="font-medium">After:</span> {JSON.stringify(log.newValues, null, 2)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500 ml-4">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
