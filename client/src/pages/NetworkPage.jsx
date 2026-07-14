import React, { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { 
  Search, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  HelpCircle, 
  User, 
  FileText, 
  MapPin, 
  Activity, 
  Phone, 
  CreditCard, 
  Key, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { PageContainer, PageHeader, DashboardCard } from '../components/LayoutComponents.jsx';
import { Button, Input, Badge } from '../components/UIPrimitives.jsx';
import { useUI } from '../context/UIContext.jsx';
import api from '../services/api.js';

const NODE_COLORS = {
  Criminal: '#ef4444',
  Victim: '#3b82f6',
  FIR: '#a855f7',
  Vehicle: '#06b6d4',
  PhoneNumber: '#f59e0b',
  BankAccount: '#10b981',
  Evidence: '#ec4899',
  PoliceStation: '#84cc16',
  CrimeCategory: '#64748b'
};

const NODE_SIZES = {
  Criminal: 45,
  FIR: 45,
  Victim: 40,
  Vehicle: 35,
  PhoneNumber: 35,
  BankAccount: 35,
  Evidence: 35,
  PoliceStation: 40,
  CrimeCategory: 35
};

const NetworkPage = () => {
  const { addToast } = useUI();
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    nodeType: '',
    relationshipType: '',
    district: '',
    crimeCategory: ''
  });

  // Helper: Get color index based on entity type
  const getNodeColor = (type) => NODE_COLORS[type] || '#64748b';
  const getNodeSize = (type) => NODE_SIZES[type] || 35;

  // Initialize Cytoscape Container
  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': 'data(color)',
            'color': '#f8fafc',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-width': '2.5px',
            'border-color': '#0f172a',
            'text-outline-color': 'data(color)',
            'text-outline-width': '1.5px',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(label)',
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'font-size': '8px',
            'color': '#94a3b8',
            'text-background-opacity': 0.85,
            'text-background-color': '#070e1b',
            'text-background-padding': '3px',
            'text-background-shape': 'round',
            'line-style': 'solid'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': '4px',
            'border-color': '#f8fafc',
            'scale': 1.1
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2,
            'line-color': '#1e293b',
            'target-arrow-color': '#1e293b'
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true,
        fit: true,
        padding: 50
      }
    });

    // Event: Node Selection tap listener
    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      setSelectedNode(data);

      // Dim non-connected neighborhood items for clean edge highlighting
      cyRef.current.elements().addClass('dimmed');
      node.removeClass('dimmed');
      node.neighborhood().removeClass('dimmed');
      node.connectedEdges().removeClass('dimmed');
    });

    // Event: Click canvas empty space to clear filters
    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        cyRef.current.elements().removeClass('dimmed');
        setSelectedNode(null);
      }
    });

    // Load initial gang networks
    loadInitialGraph();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // Load starting seed graph (Shekhar/burglary gang)
  const loadInitialGraph = async () => {
    setLoading(true);
    try {
      // Find gang leader Shekhar
      const searchRes = await api.get('/network/search?query=Shekhar');
      if (searchRes.data.data && searchRes.data.data.length > 0) {
        const shekharNode = searchRes.data.data[0];
        await fetchAndRenderNode(shekharNode.id, shekharNode.type);
      }
    } catch (err) {
      console.error('Initial network loading failed:', err);
      addToast('Failed to retrieve seed network linkages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Triggers search requests matching user text queries
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/network/search?query=${searchQuery}`);
      setSearchResults(res.data.data);
      if (res.data.data.length === 0) {
        addToast('No matching network nodes found.', 'info');
      }
    } catch (err) {
      console.error('Search failed:', err);
      addToast('Error running node search.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetches a node's immediate neighborhood and merges it into Cytoscape
  const fetchAndRenderNode = async (nodeId, type, replaceGraph = true) => {
    const rawId = nodeId.split('-')[1] || nodeId;
    const cleanType = type.toLowerCase() === 'bank account' ? 'bank' : type.toLowerCase() === 'phone number' ? 'phone' : type.toLowerCase();
    
    setLoading(true);
    try {
      // Build query string matching filters
      const params = {};
      Object.keys(filters).forEach(k => {
        if (filters[k]) params[k] = filters[k];
      });

      const res = await api.get(`/network/${cleanType}/${rawId}`, { params });
      const { graph, insights: newInsights } = res.data.data;

      if (!graph || graph.nodes.length === 0) {
        addToast('No neighborhood connections matching current filters.', 'warning');
        return;
      }

      setInsights(newInsights || {});

      if (replaceGraph) {
        cyRef.current.elements().remove();
      }

      // Add nodes
      graph.nodes.forEach(n => {
        const cyNodeId = n.id;
        if (cyRef.current.$(`#${cyNodeId}`).length === 0) {
          cyRef.current.add({
            group: 'nodes',
            data: {
              id: cyNodeId,
              label: n.label,
              type: n.type,
              color: getNodeColor(n.type),
              size: getNodeSize(n.type),
              metadata: n.metadata
            }
          });
        }
      });

      // Add edges
      graph.edges.forEach(e => {
        const cyEdgeId = `${e.source}-${e.target}-${e.relationshipType}`;
        if (cyRef.current.$(`#${cyEdgeId}`).length === 0) {
          cyRef.current.add({
            group: 'edges',
            data: {
              id: cyEdgeId,
              source: e.source,
              target: e.target,
              label: e.relationshipType
            }
          });
        }
      });

      // Recalculate cose layouts
      const layout = cyRef.current.layout({
        name: 'cose',
        animate: true,
        fit: true,
        padding: 50
      });
      layout.run();

      addToast(`Rendered network connections for: ${graph.nodes[0]?.label}`, 'success');
    } catch (err) {
      console.error('Fetch node network error:', err);
      addToast('Failed to load node neighborhood details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Zoom/Pan Action handlers
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() + 0.15);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() - 0.15);
  const handleFit = () => cyRef.current?.fit();

  // Apply Sidebar Filter Settings
  const handleApplyFilters = () => {
    if (selectedNode) {
      fetchAndRenderNode(selectedNode.id, selectedNode.type, true);
    } else {
      loadInitialGraph();
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      nodeType: '',
      relationshipType: '',
      district: '',
      crimeCategory: ''
    });
    addToast('Network filters reset.', 'success');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Criminal Network Analysis"
        description="Traverse gang alignments, trace shared phone indices, and map transactions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Controls & Node search */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          
          {/* Node Search Panel */}
          <DashboardCard title="Graph Node Lookup">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suspect, Plate, Phone..."
                  className="flex-1 text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="px-3">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2 max-h-[200px] overflow-y-auto scrollbar pr-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Search Matches</p>
                  {searchResults.map((node) => (
                    <div
                      key={node.id}
                      onClick={() => {
                        fetchAndRenderNode(node.id, node.type, true);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="flex justify-between items-center p-2 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/35 hover:bg-blue-500/5 hover:border-blue-500/20 cursor-pointer transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{node.label}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{node.type}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Dynamic Filters Panel */}
          <DashboardCard title="Network Filters">
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Node Type</label>
                <select
                  value={filters.nodeType}
                  onChange={(e) => setFilters(prev => ({ ...prev, nodeType: e.target.value }))}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="Criminal">Criminal</option>
                  <option value="FIR">FIR</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="PhoneNumber">Phone Number</option>
                  <option value="BankAccount">Bank Account</option>
                  <option value="Evidence">Evidence</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Relation Type</label>
                <select
                  value={filters.relationshipType}
                  onChange={(e) => setFilters(prev => ({ ...prev, relationshipType: e.target.value }))}
                  className="w-full h-8 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090f1d] text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="">All Relationships</option>
                  <option value="USES">USES (Phone)</option>
                  <option value="OWNS">OWNS (Bank)</option>
                  <option value="INVOLVED_IN">INVOLVED_IN (FIR/Vehicle)</option>
                  <option value="ASSOCIATED_WITH">ASSOCIATED_WITH (Gang)</option>
                  <option value="LOCATED_AT">LOCATED_AT (Location)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">District Limit</label>
                <Input 
                  placeholder="e.g. Bengaluru" 
                  value={filters.district}
                  onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                  className="h-8"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Button onClick={handleApplyFilters} className="flex-1 text-xs py-1.5">Apply</Button>
                <Button variant="secondary" onClick={handleResetFilters} className="px-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </DashboardCard>

          {/* Node Legend Info */}
          <DashboardCard title="Graph Legend">
            <div className="flex flex-wrap gap-2">
              {Object.keys(NODE_COLORS).map(type => (
                <div key={type} className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: NODE_COLORS[type] }} />
                  <span className="text-slate-600 dark:text-slate-300">{type}</span>
                </div>
              ))}
            </div>
          </DashboardCard>

        </div>

        {/* Graph Display Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          <DashboardCard
            title="Interactive Linkage Analysis Map"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="p-2" onClick={handleZoomIn} title="Zoom In"><ZoomIn className="w-4 h-4" /></Button>
                <Button variant="secondary" className="p-2" onClick={handleZoomOut} title="Zoom Out"><ZoomOut className="w-4 h-4" /></Button>
                <Button variant="secondary" className="p-2" onClick={handleFit} title="Fit Canvas"><Maximize className="w-4 h-4" /></Button>
              </div>
            }
          >
            <div className="relative w-full h-[55vh] bg-[#070e1b] rounded border border-slate-800/80 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:30px_30px]" />
              <div ref={containerRef} className="absolute inset-0 w-full h-full" />
              
              {loading && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2.5">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Resolving Adjacency Matrix...</p>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Inspector Panel */}
            <DashboardCard title="Node Investigator">
              {selectedNode ? (
                <div className="space-y-4 text-xs leading-relaxed">
                  <div className="flex justify-between items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{selectedNode.label}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">{selectedNode.type}</p>
                    </div>
                    <Badge variant={selectedNode.type === 'Criminal' ? 'danger' : selectedNode.type === 'Vehicle' ? 'info' : selectedNode.type === 'BankAccount' ? 'success' : 'warning'}>
                      {selectedNode.type}
                    </Badge>
                  </div>

                  {selectedNode.metadata && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node Details</p>
                      <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-900/30 p-3 rounded border border-slate-150 dark:border-slate-800/40">
                        {Object.entries(selectedNode.metadata).map(([key, val]) => (
                          <div key={key}>
                            <p className="text-[9px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                              {Array.isArray(val) ? val.join(', ') : typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val || 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => fetchAndRenderNode(selectedNode.id, selectedNode.type, false)}
                      className="flex-1 py-1.5 text-xs flex justify-center items-center gap-1.5"
                    >
                      Expand Connections
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <HelpCircle className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">Select any node on the graph canvas to inspect relational dossiers.</p>
                </div>
              )}
            </DashboardCard>

            {/* AI Insights & Gang Detection Panel */}
            <DashboardCard title="Graph Intelligence Insights">
              <div className="space-y-3.5 text-xs overflow-y-auto max-h-[300px] scrollbar pr-1">
                {(!insights.repeatOffenders?.length && !insights.sharedPhones?.length && !insights.sharedBanks?.length && !insights.sharedVehicles?.length) ? (
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-4 rounded text-slate-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>No sharing anomalies or suspicious associations identified in the current graph cluster.</span>
                  </div>
                ) : (
                  <>
                    {insights.repeatOffenders && insights.repeatOffenders.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase text-red-500 tracking-wider">Repeat Suspects Flagged</p>
                        <div className="flex flex-wrap gap-1.5">
                          {insights.repeatOffenders.map(name => (
                            <Badge key={name} variant="danger">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insights.highlyConnectedSuspects && insights.highlyConnectedSuspects.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-yellow-500 tracking-wider">Central Suspect Nodes</p>
                        {insights.highlyConnectedSuspects.map(h => (
                          <div key={h.name} className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            <span>{h.name}</span>
                            <Badge variant="warning">{h.linksCount} relationships</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {insights.sharedPhones && insights.sharedPhones.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-blue-500 tracking-wider">Shared SIM Cards</p>
                        {insights.sharedPhones.map(sp => (
                          <div key={sp.phone} className="p-2 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/35">
                            <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-blue-500" />
                              {sp.phone}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Used by: <span className="font-bold text-slate-300">{sp.suspects.join(', ')}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {insights.sharedBanks && insights.sharedBanks.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-green-500 tracking-wider">Shared Bank Accounts</p>
                        {insights.sharedBanks.map(sb => (
                          <div key={sb.account} className="p-2 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/35">
                            <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <CreditCard className="w-3 h-3 text-green-500" />
                              {sb.account}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Access by: <span className="font-bold text-slate-300">{sb.suspects.join(', ')}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {insights.sharedVehicles && insights.sharedVehicles.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase text-cyan-500 tracking-wider">Shared Suspect Transit</p>
                        {insights.sharedVehicles.map(sv => (
                          <div key={sv.vehicle} className="p-2 border border-slate-150 dark:border-slate-800/60 rounded bg-slate-50 dark:bg-slate-900/35">
                            <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <Key className="w-3 h-3 text-cyan-500" />
                              {sv.vehicle}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Shared by: <span className="font-bold text-slate-300">{sv.suspects.join(', ')}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </DashboardCard>

          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default NetworkPage;
