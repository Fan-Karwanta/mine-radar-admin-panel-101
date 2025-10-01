import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight, X, CheckSquare, Square, Image as ImageIcon, ZoomIn } from 'lucide-react';
import adminService from '../services/adminService';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
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

  // Render type-specific details based on report type
  const renderTypeSpecificDetails = (report) => {
    switch(report.reportType) {
      case 'illegal_mining':
        return renderMiningDetails(report.miningData);
      case 'illegal_transport':
        return renderTransportDetails(report.transportData);
      case 'illegal_processing':
        return renderProcessingDetails(report.processingData);
      case 'illegal_trading':
        return renderTradingDetails(report.tradingData);
      case 'illegal_exploration':
        return renderExplorationDetails(report.explorationData);
      case 'illegal_smallscale':
        return renderSmallScaleDetails(report.smallScaleData);
      default:
        return null;
    }
  };

  const renderMiningDetails = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        {/* Operating Activities */}
        {data.operatingActivities && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
              Operating Activities
            </h3>
            <div className="space-y-4">
              {/* Extraction */}
              <div>
                <div className="flex items-center mb-2">
                  {data.operatingActivities.extraction?.active ? (
                    <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-white font-medium">Extraction</span>
                </div>
                {data.operatingActivities.extraction?.equipment && data.operatingActivities.extraction.equipment.length > 0 && (
                  <div className="ml-7 text-gray-300">
                    <span className="text-gray-400 text-sm">Equipment: </span>
                    {data.operatingActivities.extraction.equipment.join(', ')}
                  </div>
                )}
              </div>
              {/* Disposition */}
              <div>
                <div className="flex items-center mb-2">
                  {data.operatingActivities.disposition?.active ? (
                    <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-white font-medium">Disposition</span>
                </div>
                {data.operatingActivities.disposition?.equipment && data.operatingActivities.disposition.equipment.length > 0 && (
                  <div className="ml-7 text-gray-300">
                    <span className="text-gray-400 text-sm">Equipment: </span>
                    {data.operatingActivities.disposition.equipment.join(', ')}
                  </div>
                )}
              </div>
              {/* Processing */}
              <div>
                <div className="flex items-center mb-2">
                  {data.operatingActivities.processing?.active ? (
                    <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-white font-medium">Processing</span>
                </div>
                {data.operatingActivities.processing?.equipment && data.operatingActivities.processing.equipment.length > 0 && (
                  <div className="ml-7 text-gray-300">
                    <span className="text-gray-400 text-sm">Equipment: </span>
                    {data.operatingActivities.processing.equipment.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Non-Operating Observations */}
        {data.nonOperatingObservations && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-cyan-500 mr-3 rounded"></div>
              Non-Operating Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                {data.nonOperatingObservations.excavations ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Excavations</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.accessRoad ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Access Road</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.processingFacility ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Processing Facility</span>
              </div>
            </div>
          </div>
        )}
        {/* Interview */}
        {data.interview && data.interview.conducted && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-lime-500 mr-3 rounded"></div>
              Interview Responses
            </h3>
            <div className="space-y-4">
              {data.interview.responses?.recentActivity && (
                <div>
                  <label className="text-gray-400 text-sm">Recent Activity</label>
                  <p className="text-white">{data.interview.responses.recentActivity}</p>
                </div>
              )}
              {data.interview.responses?.excavationStart && (
                <div>
                  <label className="text-gray-400 text-sm">Excavation Start</label>
                  <p className="text-white">{data.interview.responses.excavationStart}</p>
                </div>
              )}
              {data.interview.responses?.transportVehicles && (
                <div>
                  <label className="text-gray-400 text-sm">Transport Vehicles</label>
                  <p className="text-white">{data.interview.responses.transportVehicles}</p>
                </div>
              )}
              {data.interview.responses?.operatorName && (
                <div>
                  <label className="text-gray-400 text-sm">Operator Name</label>
                  <p className="text-white">{data.interview.responses.operatorName}</p>
                </div>
              )}
              {data.interview.responses?.operatorAddress && (
                <div>
                  <label className="text-gray-400 text-sm">Operator Address</label>
                  <p className="text-white">{data.interview.responses.operatorAddress}</p>
                </div>
              )}
              {data.interview.responses?.permits && (
                <div>
                  <label className="text-gray-400 text-sm">Permits</label>
                  <p className="text-white">{data.interview.responses.permits}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTransportDetails = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
            Transportation Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.violationType && (
              <div>
                <label className="text-gray-400 text-sm">Violation Type</label>
                <p className="text-white capitalize">{data.violationType.replace('_', ' ')}</p>
              </div>
            )}
            {data.documentType && (
              <div>
                <label className="text-gray-400 text-sm">Document Type</label>
                <p className="text-white">{data.documentType}</p>
              </div>
            )}
          </div>
        </div>
        {/* Material Info */}
        {data.materialInfo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-cyan-500 mr-3 rounded"></div>
              Material Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.materialInfo.volumeWeight && (
                <div>
                  <label className="text-gray-400 text-sm">Volume/Weight</label>
                  <p className="text-white">{data.materialInfo.volumeWeight}</p>
                </div>
              )}
              {data.materialInfo.unit && (
                <div>
                  <label className="text-gray-400 text-sm">Unit</label>
                  <p className="text-white">{data.materialInfo.unit}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Vehicle Info */}
        {data.vehicleInfo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-lime-500 mr-3 rounded"></div>
              Vehicle Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.vehicleInfo.type && (
                <div>
                  <label className="text-gray-400 text-sm">Type</label>
                  <p className="text-white">{data.vehicleInfo.type}</p>
                </div>
              )}
              {data.vehicleInfo.plateNumber && (
                <div>
                  <label className="text-gray-400 text-sm">Plate Number</label>
                  <p className="text-white font-mono">{data.vehicleInfo.plateNumber}</p>
                </div>
              )}
              {data.vehicleInfo.description && (
                <div>
                  <label className="text-gray-400 text-sm">Description</label>
                  <p className="text-white">{data.vehicleInfo.description}</p>
                </div>
              )}
              {data.vehicleInfo.bodyColor && (
                <div>
                  <label className="text-gray-400 text-sm">Body Color</label>
                  <p className="text-white">{data.vehicleInfo.bodyColor}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Owner/Operator & Driver */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.ownerOperator && (data.ownerOperator.name || data.ownerOperator.address) && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-1 h-6 bg-purple-500 mr-3 rounded"></div>
                Owner/Operator
              </h3>
              <div className="space-y-3">
                {data.ownerOperator.name && (
                  <div>
                    <label className="text-gray-400 text-sm">Name</label>
                    <p className="text-white">{data.ownerOperator.name}</p>
                  </div>
                )}
                {data.ownerOperator.address && (
                  <div>
                    <label className="text-gray-400 text-sm">Address</label>
                    <p className="text-white">{data.ownerOperator.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {data.driver && (data.driver.name || data.driver.address) && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-1 h-6 bg-pink-500 mr-3 rounded"></div>
                Driver
              </h3>
              <div className="space-y-3">
                {data.driver.name && (
                  <div>
                    <label className="text-gray-400 text-sm">Name</label>
                    <p className="text-white">{data.driver.name}</p>
                  </div>
                )}
                {data.driver.address && (
                  <div>
                    <label className="text-gray-400 text-sm">Address</label>
                    <p className="text-white">{data.driver.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Source & Actions */}
        {(data.sourceOfMaterials || data.actionsTaken) && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-teal-500 mr-3 rounded"></div>
              Additional Details
            </h3>
            <div className="space-y-4">
              {data.sourceOfMaterials && (
                <div>
                  <label className="text-gray-400 text-sm">Source of Materials</label>
                  <p className="text-white">{data.sourceOfMaterials}</p>
                </div>
              )}
              {data.actionsTaken && (
                <div>
                  <label className="text-gray-400 text-sm">Actions Taken</label>
                  <p className="text-white">{data.actionsTaken}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProcessingDetails = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        {data.facilityInfo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
              Facility Information
            </h3>
            <div className="space-y-3">
              {data.facilityInfo.type && (
                <div>
                  <label className="text-gray-400 text-sm">Facility Type</label>
                  <p className="text-white">{data.facilityInfo.type}</p>
                </div>
              )}
              {data.facilityInfo.processingProducts && (
                <div>
                  <label className="text-gray-400 text-sm">Processing Products</label>
                  <p className="text-white">{data.facilityInfo.processingProducts}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {data.rawMaterials && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-cyan-500 mr-3 rounded"></div>
              Raw Materials Source
            </h3>
            <div className="space-y-3">
              {data.rawMaterials.sourceName && (
                <div>
                  <label className="text-gray-400 text-sm">Source Name</label>
                  <p className="text-white">{data.rawMaterials.sourceName}</p>
                </div>
              )}
              {data.rawMaterials.sourceLocation && (
                <div>
                  <label className="text-gray-400 text-sm">Source Location</label>
                  <p className="text-white">{data.rawMaterials.sourceLocation}</p>
                </div>
              )}
              {data.rawMaterials.determinationMethod && (
                <div>
                  <label className="text-gray-400 text-sm">Determination Method</label>
                  <p className="text-white">{data.rawMaterials.determinationMethod}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTradingDetails = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        {data.businessInfo && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
              Business Information
            </h3>
            <div className="space-y-3">
              {data.businessInfo.name && (
                <div>
                  <label className="text-gray-400 text-sm">Business Name</label>
                  <p className="text-white">{data.businessInfo.name}</p>
                </div>
              )}
              {data.businessInfo.owner && (
                <div>
                  <label className="text-gray-400 text-sm">Owner</label>
                  <p className="text-white">{data.businessInfo.owner}</p>
                </div>
              )}
              {data.businessInfo.location && (
                <div>
                  <label className="text-gray-400 text-sm">Business Location</label>
                  <p className="text-white">{data.businessInfo.location}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {data.commoditySource && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-cyan-500 mr-3 rounded"></div>
              Commodity Source
            </h3>
            <div className="space-y-3">
              {data.commoditySource.name && (
                <div>
                  <label className="text-gray-400 text-sm">Source Name</label>
                  <p className="text-white">{data.commoditySource.name}</p>
                </div>
              )}
              {data.commoditySource.location && (
                <div>
                  <label className="text-gray-400 text-sm">Source Location</label>
                  <p className="text-white">{data.commoditySource.location}</p>
                </div>
              )}
              {data.commoditySource.determinationMethod && (
                <div>
                  <label className="text-gray-400 text-sm">Determination Method</label>
                  <p className="text-white">{data.commoditySource.determinationMethod}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-1 h-6 bg-lime-500 mr-3 rounded"></div>
            Additional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.stockpiledMaterials && (
              <div>
                <label className="text-gray-400 text-sm">Stockpiled Materials</label>
                <p className="text-white capitalize">{data.stockpiledMaterials.replace('_', ' ')}</p>
              </div>
            )}
            {data.dtiRegistration && (
              <div>
                <label className="text-gray-400 text-sm">DTI Registration</label>
                <p className="text-white capitalize">{data.dtiRegistration.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExplorationDetails = (data) => {
    if (!data) return null;
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
          Exploration Activities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            {data.activities?.drilling ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Drilling</span>
          </div>
          <div className="flex items-center">
            {data.activities?.testPitting ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Test Pitting</span>
          </div>
          <div className="flex items-center">
            {data.activities?.trenching ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Trenching</span>
          </div>
          <div className="flex items-center">
            {data.activities?.shaftSinking ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Shaft Sinking</span>
          </div>
          <div className="flex items-center">
            {data.activities?.tunneling ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Tunneling</span>
          </div>
          <div className="flex items-center">
            {data.activities?.others ? (
              <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <Square className="h-5 w-5 text-gray-500 mr-2" />
            )}
            <span className="text-white">Others</span>
          </div>
        </div>
        {data.othersActivity && (
          <div className="mt-4">
            <label className="text-gray-400 text-sm">Other Activities Description</label>
            <p className="text-white">{data.othersActivity}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSmallScaleDetails = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        {/* Operating Activities */}
        {data.operatingActivities && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-orange-500 mr-3 rounded"></div>
              Operating Activities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                {data.operatingActivities.extraction ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Extraction</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.disposition ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Disposition</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.mineralProcessing ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Mineral Processing</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.tunneling ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Tunneling</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.shaftSinking ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Shaft Sinking</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.goldPanning ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Gold Panning</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.amalgamation ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Amalgamation</span>
              </div>
              <div className="flex items-center">
                {data.operatingActivities.others ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Others</span>
              </div>
            </div>
            {data.othersActivity && (
              <div className="mt-4">
                <label className="text-gray-400 text-sm">Other Activities Description</label>
                <p className="text-white">{data.othersActivity}</p>
              </div>
            )}
          </div>
        )}
        {/* Equipment Used */}
        {data.equipmentUsed && (data.equipmentUsed.extraction || data.equipmentUsed.disposition || data.equipmentUsed.mineralProcessing) && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-cyan-500 mr-3 rounded"></div>
              Equipment Used
            </h3>
            <div className="space-y-3">
              {data.equipmentUsed.extraction && (
                <div>
                  <label className="text-gray-400 text-sm">Extraction Equipment</label>
                  <p className="text-white">{data.equipmentUsed.extraction}</p>
                </div>
              )}
              {data.equipmentUsed.disposition && (
                <div>
                  <label className="text-gray-400 text-sm">Disposition Equipment</label>
                  <p className="text-white">{data.equipmentUsed.disposition}</p>
                </div>
              )}
              {data.equipmentUsed.mineralProcessing && (
                <div>
                  <label className="text-gray-400 text-sm">Mineral Processing Equipment</label>
                  <p className="text-white">{data.equipmentUsed.mineralProcessing}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Non-Operating Observations */}
        {data.nonOperatingObservations && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-lime-500 mr-3 rounded"></div>
              Non-Operating Observations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                {data.nonOperatingObservations.excavations ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Excavations</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.stockpiles ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Stockpiles</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.tunnels ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Tunnels</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.mineShafts ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Mine Shafts</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.accessRoad ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Access Road</span>
              </div>
              <div className="flex items-center">
                {data.nonOperatingObservations.processingFacility ? (
                  <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <Square className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <span className="text-white">Processing Facility</span>
              </div>
            </div>
          </div>
        )}
        {/* Interview */}
        {data.interview && data.interview.conducted && data.interview.responses && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-6 bg-purple-500 mr-3 rounded"></div>
              Interview Responses
            </h3>
            <div className="space-y-4">
              {Object.entries(data.interview.responses).map(([key, value]) => {
                if (value) {
                  return (
                    <div key={key}>
                      <label className="text-gray-400 text-sm">Question {key.replace('question', '')}</label>
                      <p className="text-white">{value}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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
                      <td className="py-4 px-6 text-gray-300">
                        {typeof report.submittedBy === 'object' && report.submittedBy
                          ? report.submittedBy.email || report.submittedBy.completeName || report.submittedBy.username || 'Unknown User'
                          : report.submittedBy || 'Unknown User'}
                      </td>
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
          <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Report Details</h2>
                  <p className="text-gray-400 text-sm mt-1">{formatReportType(selectedReport.reportType)}</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 mr-3 rounded"></div>
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">Report ID</label>
                      <p className="text-white font-mono text-lg">{selectedReport.reportId}</p>
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
                      <label className="text-gray-400 text-sm">Language</label>
                      <p className="text-white capitalize">{selectedReport.language}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Submitted By</label>
                      <p className="text-white">
                        {typeof selectedReport.submittedBy === 'object' && selectedReport.submittedBy
                          ? `${selectedReport.submittedBy.completeName || selectedReport.submittedBy.username || 'Unknown User'} (${selectedReport.submittedBy.email || 'No email'})`
                          : selectedReport.submittedBy || 'Unknown User'}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Submitted At</label>
                      <p className="text-white">{new Date(selectedReport.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 mr-3 rounded"></div>
                    Location & Time
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm">Location</label>
                      <p className="text-white">{selectedReport.location}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">GPS Coordinates</label>
                      <p className="text-white font-mono">
                        {selectedReport.gpsLocation?.latitude}, {selectedReport.gpsLocation?.longitude}
                      </p>
                      <a 
                        href={`https://www.google.com/maps?q=${selectedReport.gpsLocation?.latitude},${selectedReport.gpsLocation?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block"
                      >
                        View on Google Maps →
                      </a>
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

              {/* Project Information */}
              {selectedReport.projectInfo && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-purple-500 mr-3 rounded"></div>
                    Project Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Has Signboard</label>
                      <p className="text-white capitalize">{selectedReport.projectInfo.hasSignboard?.replace('_', ' ')}</p>
                    </div>
                    {selectedReport.projectInfo.projectName && (
                      <div>
                        <label className="text-gray-400 text-sm">Project Name</label>
                        <p className="text-white">{selectedReport.projectInfo.projectName}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Commodity & Site Status */}
              {(selectedReport.commodity || selectedReport.siteStatus) && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-yellow-500 mr-3 rounded"></div>
                    Site Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedReport.commodity && (
                      <div>
                        <label className="text-gray-400 text-sm">Commodity</label>
                        <p className="text-white">{selectedReport.commodity}</p>
                      </div>
                    )}
                    {selectedReport.siteStatus && (
                      <div>
                        <label className="text-gray-400 text-sm">Site Status</label>
                        <p className="text-white capitalize">{selectedReport.siteStatus.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Operator Information */}
              {selectedReport.operatorInfo && (selectedReport.operatorInfo.name || selectedReport.operatorInfo.address) && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-red-500 mr-3 rounded"></div>
                    Operator Information
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.operatorInfo.name && (
                      <div>
                        <label className="text-gray-400 text-sm">Name</label>
                        <p className="text-white">{selectedReport.operatorInfo.name}</p>
                      </div>
                    )}
                    {selectedReport.operatorInfo.address && (
                      <div>
                        <label className="text-gray-400 text-sm">Address</label>
                        <p className="text-white">{selectedReport.operatorInfo.address}</p>
                      </div>
                    )}
                    {selectedReport.operatorInfo.determinationMethod && (
                      <div>
                        <label className="text-gray-400 text-sm">Determination Method</label>
                        <p className="text-white">{selectedReport.operatorInfo.determinationMethod}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Type-Specific Details */}
              {renderTypeSpecificDetails(selectedReport)}

              {/* Additional Information */}
              {selectedReport.additionalInfo && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-indigo-500 mr-3 rounded"></div>
                    Additional Information
                  </h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedReport.additionalInfo}
                  </p>
                </div>
              )}

              {/* Uploaded Photos */}
              {selectedReport.attachments && selectedReport.attachments.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-1 h-6 bg-pink-500 mr-3 rounded"></div>
                    Uploaded Photos ({selectedReport.attachments.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedReport.attachments.map((attachment, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer"
                        onClick={() => {
                          setSelectedImage(attachment);
                          setShowImageModal(true);
                        }}
                      >
                        <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={attachment.path} 
                            alt={attachment.filename}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23374151" width="100" height="100"/%3E%3Ctext fill="%239CA3AF" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-lg">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="mt-2">
                          <p className="text-white text-xs truncate">{attachment.filename}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                          {attachment.geotagged && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded">
                              Geotagged
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certification */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <div className="w-1 h-6 bg-teal-500 mr-3 rounded"></div>
                  Certification
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {selectedReport.certified ? (
                      <CheckSquare className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <span className="text-white">Report Certified</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(selectedReport.certificationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4" onClick={() => setShowImageModal(false)}>
          <div className="max-w-7xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 bg-gray-800 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={selectedImage.path} 
              alt={selectedImage.filename}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-4 bg-gray-900 p-4 rounded-lg">
              <p className="text-white font-medium">{selectedImage.filename}</p>
              <p className="text-gray-400 text-sm mt-1">
                Uploaded: {new Date(selectedImage.uploadedAt).toLocaleString()}
              </p>
              {selectedImage.geotagged && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-900 text-green-300 text-sm rounded">
                  📍 Geotagged Photo
                </span>
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
