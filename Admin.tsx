
import React from 'react';
import { Shield, User as UserIcon, Bell } from 'lucide-react';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from './constants';

export const SettingsPage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><UserIcon size={18} className="mr-2"/> User Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" className="w-full p-2 border border-slate-300 rounded" defaultValue="Admin User" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" className="w-full p-2 border border-slate-300 rounded" defaultValue="admin@ksaintel.com" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Bell size={18} className="mr-2"/> Notifications</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Email Alerts for New Projects</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Daily Digest Summary</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const AdminConsole = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center text-red-600"><Shield size={24} className="mr-2"/> Admin Console</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">User Management</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="p-2">User</th>
                                <th className="p-2">Role</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_USERS.map(u => (
                                <tr key={u.id} className="border-t border-slate-100">
                                    <td className="p-2 font-medium">{u.name}</td>
                                    <td className="p-2">{u.role}</td>
                                    <td className="p-2 text-green-600">Active</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">System Audit Log</h3>
                    <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto">
                        {MOCK_AUDIT_LOGS.map(log => (
                            <div key={log.id} className="p-2 bg-slate-50 border border-slate-100 rounded">
                                <span className="text-slate-400">[{log.timestamp}]</span> <span className="text-blue-600">{log.user}</span>: {log.action}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
