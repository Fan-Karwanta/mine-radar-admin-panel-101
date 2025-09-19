import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../services/adminService';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { reportType: typeFilter })
      };

      const response = await adminService.getReports(params);
      setReports(response.data.reports);
      setTotalPages(response.data.pagination.pages);
      setTotalReports(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await adminService.getReportById(reportId);
      setSelectedReport(response.data);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await adminService.updateReportStatus(reportId, newStatus);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleDeleteReport = async () => {
    try {
      await adminService.deleteReport(reportToDelete);
      setShowDeleteModal(false);
      setReportToDelete(null);
      fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-900', text: 'text-yellow-300', label: 'Pending' },
      under_investigation: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Under Investigation' },
      resolved: { bg: 'bg-green-900', text: 'text-green-300', label: 'Resolved' },
      dismissed: { bg: 'bg-red-900', text: 'text-red-300', label: 'Dismissed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatReportType = (type) => {
    return type?.replace('illegal_', '').replace('_', ' ').toUpperCase() || 'Unknown';
  };

  const reportTypes = [
    'illegal_mining',
    'illegal_transport', 
    'illegal_processing',
    'illegal_trading',
    'illegal_exploration',
    'illegal_smallscale'
  ];

  const statuses = ['pending', 'under_investigation', 'resolved', 'dismissed'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports Management</h1>
          <p className="text-gray-400 mt-1">Manage mining violation reports</p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {reportTypes.map(type => (
              <option key={type} value={type}>
                {formatReportType(type)}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setTypeFilter('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Report ID</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Type</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Submitted By</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Location</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <motion.tr
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-800 hover:bg-gray-800"
                    >
                      <td className="py-4 px-6 text-white font-mono">{report.reportId}</td>
                      <td className="py-4 px-6 text-gray-300">{formatReportType(report.reportType)}</td>
                      <td className="py-4 px-6">{getStatusBadge(report.status)}</td>
                      <td className="py-4 px-6 text-gray-300">{report.submittedBy}</td>
                      <td className="py-4 px-6 text-gray-300">{report.location}</td>
                      <td className="py-4 px-6 text-gray-300">
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewReport(report._id)}
                            className="p-2 text-blue-400 hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report._id, e.target.value)}
                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                            title="Change Status"
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              setReportToDelete(report._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-400 hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
              <div className="text-sm text-gray-400">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalReports)} of {totalReports} reports
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Report Details</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">Report ID</label>
                      <p className="text-white font-mono">{selectedReport.reportId}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Type</label>
                      <p className="text-white">{formatReportType(selectedReport.reportType)}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Submitted By</label>
                      <p className="text-white">{selectedReport.submittedBy}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Location & Time</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">Location</label>
                      <p className="text-white">{selectedReport.location}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">GPS Coordinates</label>
                      <p className="text-white">
                        {selectedReport.gpsLocation?.latitude}, {selectedReport.gpsLocation?.longitude}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Incident Date</label>
                      <p className="text-white">{selectedReport.incidentDate}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Incident Time</label>
                      <p className="text-white">{selectedReport.incidentTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedReport.additionalInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
                  <p className="text-gray-300 bg-gray-800 p-4 rounded-lg">
                    {selectedReport.additionalInfo}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedReport.attachments.map((attachment, index) => (
                      <div key={index} className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-white text-sm truncate">{attachment.filename}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
