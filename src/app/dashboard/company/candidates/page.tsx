'use client';

import Link from 'next/link';
import { Download, CheckCircle, XCircle, MoreVertical, Briefcase, User, Mail, FileText } from 'lucide-react';
import { useState } from 'react';

const APPLICATIONS = [
    { id: 1, name: "John Doe", job: "Senior React Developer", email: "john@example.com", status: "Applied", applied: "1 hour ago", resume: "#" },
    { id: 2, name: "Jane Smith", job: "Senior React Developer", email: "jane@example.com", status: "Interview", applied: "2 days ago", resume: "#" },
    { id: 3, name: "Mike Johnson", job: "Product Designer", email: "mike@example.com", status: "Rejected", applied: "3 days ago", resume: "#" },
    { id: 4, name: "Sarah Lee", job: "Backend Engineer", email: "sarah@example.com", status: "Hired", applied: "1 week ago", resume: "#" },
];

const STATUS_COLORS: Record<string, string> = {
    'Applied': 'bg-blue-100 text-blue-700',
    'Interview': 'bg-purple-100 text-purple-700',
    'Shortlisted': 'bg-yellow-100 text-yellow-700',
    'Hired': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
};

export default function CandidatesPage() {
    const [filter, setFilter] = useState('All');

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
                    <p className="text-gray-500 mt-1">Review and manage job applications.</p>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
                {['All', 'Applied', 'Interview', 'Hired', 'Rejected'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`text-sm font-medium pb-2 border-b-2 transition
                            ${filter === status ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applying For</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {APPLICATIONS.filter(app => filter === 'All' || app.status === filter).map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {app.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{app.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail size={12} /> {app.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-900">{app.job}</p>
                                        <p className="text-gray-500 text-xs">Applied {app.applied}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <a href={app.resume} className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
                                        <Download size={16} /> Resume
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Accept/Interview">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
