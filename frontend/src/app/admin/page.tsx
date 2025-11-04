'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: string;
    gemini: string;
    memory: {
      used: number;
      total: number;
      external: number;
    };
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple admin check - in production, implement proper role-based access
    if (!user || !user.email.includes('admin')) {
      router.push('/');
      return;
    }

    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user, router]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health/detailed');
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load system data</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'connected':
      case 'configured':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'not_configured':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System monitoring and health status</p>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.status)}`}>
              {healthData.status}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Environment</h3>
            <div className="text-2xl font-bold text-gray-900">{healthData.environment}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Uptime</h3>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Version</h3>
            <div className="text-2xl font-bold text-gray-900">{healthData.version}</div>
          </div>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Database</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.services.database)}`}>
                  {healthData.services.database}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Gemini AI</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthData.services.gemini)}`}>
                  {healthData.services.gemini}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Used</span>
                <span className="font-mono">{healthData.services.memory.used.toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-mono">{healthData.services.memory.total.toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>External</span>
                <span className="font-mono">{healthData.services.memory.external.toFixed(1)} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(healthData.services.memory.used / healthData.services.memory.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/api/health/detailed', '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              View Raw Health Data
            </button>
            <button
              onClick={() => window.open('/api/test/config', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Check Configuration
            </button>
            <button
              onClick={fetchHealthData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Last Updated:</strong> {new Date(healthData.timestamp).toLocaleString()}
            </div>
            <div>
              <strong>Node Environment:</strong> {healthData.environment}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}