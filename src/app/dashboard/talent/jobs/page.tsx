'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Trash2, Eye, FileText } from 'lucide-react';

const JOBS = [
    { id: 1, title: "Senior React Developer", type: "Full-time", location: "Remote", applications: 12, status: "Active", date: "2 days ago" },
    { id: 2, title: "Product Designer", type: "Contract", location: "New York, NY", applications: 5, status: "Draft", date: "1 week ago" },
    { id: 3, title: "Backend Engineer", type: "Full-time", location: "London, UK", applications: 34, status: "Closed", date: "3 weeks ago" },
];

export default function JobsPage() {
    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
                    <p className="text-gray-500 mt-1">Manage your job postings and view applications.</p>
                </div>
                <Link
                    href="/dashboard/talent/create-job"
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-100"
                >
                    + Post New Job
                </Link>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applications</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {JOBS.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{job.title}</span>
                                        <span className="text-sm text-gray-500">{job.type} • {job.location}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                        ${job.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            job.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FileText size={16} className="text-gray-400" />
                                        <span className="font-medium">{job.applications}</span>
                                        <span className="text-xs text-gray-400">candidates</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {job.date}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Edit">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                            <Trash2 size={18} />
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
