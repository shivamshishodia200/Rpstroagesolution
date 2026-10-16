import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  X,
  MessageSquare,
  Building,
} from 'lucide-react';
import api from '../services/api';

export const Leads = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/enquiries', { params });
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter]);

  const openLeadDrawer = (lead) => {
    setSelectedLead(lead);
    setNewNote('');
    setDrawerOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead) return;
    try {
      const res = await api.patch(`/enquiries/${selectedLead._id}`, { status: newStatus });
      if (res.data.success) {
        setSelectedLead(res.data.enquiry);
        setSuccessMsg(`Status updated to '${newStatus}'`);
        fetchEnquiries();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;
    setSavingNote(true);
    try {
      const res = await api.patch(`/enquiries/${selectedLead._id}`, { newNote: newNote.trim() });
      if (res.data.success) {
        setSelectedLead(res.data.enquiry);
        setNewNote('');
        fetchEnquiries();
      }
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleExportCSV = () => {
    window.open('http://localhost:5001/api/admin/enquiries/export/csv', '_blank');
  };

  const statusStyles = {
    new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    contacted: 'bg-blue-100 text-blue-800 border-blue-200',
    quotation_sent: 'bg-amber-100 text-amber-800 border-amber-200',
    follow_up: 'bg-purple-100 text-purple-800 border-purple-200',
    won: 'bg-green-100 text-green-900 font-bold border-green-300',
    lost: 'bg-neutral-100 text-neutral-600 border-neutral-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Lead & Quotation Enquiry Pipeline
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real customer enquiries captured across all dynamic city and product landing pages.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-orange" />
          <span>Export All Leads (CSV)</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 border border-brand-border rounded flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, phone, email, city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['', 'new', 'contacted', 'quotation_sent', 'won', 'lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-brand-dark text-white'
                  : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {st ? st.replace('_', ' ') : 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-brand-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-brand-border text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Location / City</th>
                <th className="py-3 px-4">Product Requirement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Received Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">Loading enquiries...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">No client enquiries found.</td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr
                    key={enq._id}
                    onClick={() => openLeadDrawer(enq)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-900 block">{enq.name}</span>
                      {enq.company && <span className="text-[10px] text-neutral-500">{enq.company}</span>}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800">
                      {enq.phone}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-neutral-700">
                      {enq.city || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate">
                      <span className="font-semibold text-neutral-800">{enq.productOfInterest}</span>
                      {enq.requirementDetails && (
                        <span className="block text-[10px] text-neutral-400 truncate">
                          {enq.requirementDetails}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusStyles[enq.status] || 'bg-neutral-100'}`}>
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-neutral-400 text-[11px]">
                      {new Date(enq.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      {drawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-brand-border">
            <div>
              {/* Drawer Header */}
              <div className="p-6 bg-neutral-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-orange block">
                    LEAD DETAIL // {selectedLead.status}
                  </span>
                  <h3 className="text-base font-bold mt-1">{selectedLead.name}</h3>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lead Information */}
              <div className="p-6 space-y-5 text-xs">
                {/* Status Selector */}
                <div>
                  <label className="block font-bold text-neutral-700 mb-1.5 uppercase text-[10px]">
                    Update Lead Status:
                  </label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-brand-orange focus:outline-none"
                  >
                    <option value="new">New (Uncontacted)</option>
                    <option value="contacted">Contacted Customer</option>
                    <option value="quotation_sent">Quotation / CAD Sent</option>
                    <option value="follow_up">In Follow-up</option>
                    <option value="won">Won Deal (Order Placed)</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {/* Contact Cards */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-orange flex-shrink-0" />
                    <a href={`tel:${selectedLead.phone}`} className="font-bold text-neutral-900 hover:text-brand-orange">
                      {selectedLead.phone}
                    </a>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-orange flex-shrink-0" />
                      <a href={`mailto:${selectedLead.email}`} className="text-neutral-700 hover:text-brand-orange">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  {selectedLead.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0" />
                      <span className="text-neutral-700 font-medium">City: {selectedLead.city}</span>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-brand-orange flex-shrink-0" />
                      <span className="text-neutral-700">Company: {selectedLead.company}</span>
                    </div>
                  )}
                </div>

                {/* Project Requirements */}
                <div className="space-y-2">
                  <span className="font-bold text-neutral-900 block uppercase text-[10px]">Requirement Details</span>
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-neutral-800 leading-relaxed">
                    <p className="font-semibold text-brand-orange mb-1">{selectedLead.productOfInterest}</p>
                    <p>{selectedLead.requirementDetails || 'No additional note provided by customer.'}</p>
                    {selectedLead.storeArea && (
                      <p className="mt-2 text-[11px] text-neutral-500">
                        <strong>Store / Floor Area:</strong> {selectedLead.storeArea}
                      </p>
                    )}
                  </div>
                </div>

                {/* Source Page */}
                <div className="text-[11px] text-neutral-500 font-mono">
                  <span>Source Route: </span>
                  <span className="text-neutral-800">{selectedLead.sourcePageUrl}</span>
                </div>

                {/* Internal Notes Thread */}
                <div className="pt-4 border-t border-neutral-200">
                  <span className="font-bold text-neutral-900 block uppercase text-[10px] mb-2">
                    Internal Sales Notes ({selectedLead.internalNotes?.length || 0})
                  </span>

                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {selectedLead.internalNotes?.map((n, i) => (
                      <div key={i} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-[11px]">
                        <div className="flex justify-between text-neutral-400 text-[10px] mb-1 font-mono">
                          <span>{n.addedBy}</span>
                          <span>{new Date(n.addedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-neutral-800">{n.note}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal follow-up note..."
                      className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-brand-orange focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={savingNote || !newNote.trim()}
                      className="bg-brand-orange text-white px-3 py-1.5 rounded text-xs font-bold uppercase disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 py-2 rounded text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
