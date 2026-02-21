"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "motion/react";
import {
  Search, Users, Mail, Phone, Building2, Calendar,
  Briefcase, MessageSquare, FileText, TrendingUp,
} from "lucide-react";

// Client Directory - Consolidated view of all clients across projects, leads, requests, and contacts
export default function ClientsPage() {
  const clients = useQuery(api.clients.getAllClients);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedClientDetails = useQuery(
    api.clients.getClientDetails,
    selectedEmail ? { email: selectedEmail } : "skip"
  );

  const selectedClient = clients?.find((c) => c.primaryEmail === selectedEmail);

  // Filter clients by search
  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-brand-light" />
            <h1 className="text-3xl font-bold text-white">Clients</h1>
          </div>
          <p className="text-gray-400">Consolidated view of all your clients</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total Clients</p>
            <p className="text-2xl font-bold text-white">{clients?.length || 0}</p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">With Projects</p>
            <p className="text-2xl font-bold text-brand-light">
              {clients?.filter((c) => c.projectIds.length > 0).length || 0}
            </p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Leads</p>
            <p className="text-2xl font-bold text-yellow-400">
              {clients?.filter((c) => c.leadIds.length > 0).length || 0}
            </p>
          </div>
          <div className="glass-elevated rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total Interactions</p>
            <p className="text-2xl font-bold text-green-400">
              {clients?.reduce((sum, c) => sum + c.totalInteractions, 0) || 0}
            </p>
          </div>
        </div>

        {/* Main Content - Master/Detail Layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Client List (Master) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-light/50"
              />
            </div>

            {/* Client Cards */}
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredClients?.map((client) => (
                <motion.div
                  key={client.primaryEmail}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEmail(client.primaryEmail)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedEmail === client.primaryEmail
                      ? "bg-brand-light/20 border-brand-light/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  } border`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{client.name}</p>
                      <p className="text-sm text-gray-400">{client.primaryEmail}</p>
                      {client.company && (
                        <p className="text-xs text-gray-500 mt-1">{client.company}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {client.projectIds.length > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                          {client.projectIds.length}P
                        </span>
                      )}
                      {client.leadIds.length > 0 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          {client.leadIds.length}L
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {client.totalInteractions} interactions
                    </span>
                  </div>
                </motion.div>
              ))}

              {filteredClients?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No clients found</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Detail Card */}
          <div className="lg:col-span-3">
            {selectedClient && selectedClientDetails ? (
              <div className="glass-elevated rounded-2xl p-6 space-y-6">
                {/* Client Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedClient.name}</h2>
                  <div className="space-y-2">
                    {selectedClient.emails.map((email, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-light" />
                        <a
                          href={`mailto:${email.address}`}
                          className="text-brand-light hover:underline"
                        >
                          {email.address}
                        </a>
                        <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                          {email.label}
                        </span>
                        {email.isPrimary && (
                          <span className="text-xs text-yellow-400">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedClient.phone && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</p>
                      <a
                        href={`tel:${selectedClient.phone}`}
                        className="text-white flex items-center gap-2 hover:text-brand-light"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedClient.phone}
                      </a>
                    </div>
                  )}
                  {selectedClient.company && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Company</p>
                      <p className="text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {selectedClient.company}
                      </p>
                    </div>
                  )}
                </div>

                {/* Activity Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">First Seen</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedClient.firstSeen).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Last Activity</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedClient.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-500 mb-1">Total Interactions</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      {selectedClient.totalInteractions}
                    </p>
                  </div>
                </div>

                {/* Related Records */}
                <div className="space-y-4">
                  {/* Projects */}
                  {selectedClientDetails.projects.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-brand-light" />
                        <p className="font-semibold text-white">
                          Projects ({selectedClientDetails.projects.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {selectedClientDetails.projects.map((project) => (
                          <div
                            key={project._id}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-white font-medium">{project.projectType}</p>
                            <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-brand-light/20 text-brand-light border border-brand-light/30">
                                {project.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leads */}
                  {selectedClientDetails.leads.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <p className="font-semibold text-white">
                          Leads ({selectedClientDetails.leads.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {selectedClientDetails.leads.map((lead) => (
                          <div
                            key={lead._id}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-white font-medium">{lead.source}</p>
                            <p className="text-sm text-gray-400 mt-1">{lead.notes}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                {lead.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Requests */}
                  {selectedClientDetails.requests.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <p className="font-semibold text-white">
                          Project Requests ({selectedClientDetails.requests.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {selectedClientDetails.requests.map((request) => (
                          <div
                            key={request._id}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-white font-medium">
                              {request.projectTypes.join(", ")}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">{request.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {request.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Submissions */}
                  {selectedClientDetails.contacts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                        <p className="font-semibold text-white">
                          Contact Forms ({selectedClientDetails.contacts.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {selectedClientDetails.contacts.map((contact) => (
                          <div
                            key={contact._id}
                            className="p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <p className="text-white font-medium">{contact.service}</p>
                            <p className="text-sm text-gray-400 mt-1">{contact.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                {contact.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(contact.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-elevated rounded-2xl p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">Select a client to view their details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
