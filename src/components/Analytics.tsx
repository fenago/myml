/**
 * Analytics Dashboard Component
 * Displays usage statistics, token usage, and performance metrics
 * @author Dr. Ernesto Lee
 */

import { useState, useEffect } from 'react';
import { analyticsService } from '../services/AnalyticsService';
import type { OverallAnalytics, DailyUsage } from '../services/AnalyticsService';
import { MODEL_CONFIG, type ModelId } from '../config/models';

interface Props {
  onClose: () => void;
}

export function Analytics({ onClose }: Props) {
  const [overall, setOverall] = useState<OverallAnalytics | null>(null);
  const [daily, setDaily] = useState<DailyUsage[]>([]);
  const [byModel, setByModel] = useState<{ modelId: string; tokens: number; percentage: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'models' | 'export'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setOverall(analyticsService.getOverallAnalytics());
    setDaily(analyticsService.getDailyUsage(7));
    setByModel(analyticsService.getTokensByModel());
  };

  const handleExportJSON = () => {
    const json = analyticsService.exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browsergpt-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = analyticsService.exportAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browsergpt-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      analyticsService.clearData();
      loadAnalytics();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getMaxDaily = () => {
    if (daily.length === 0) return 1;
    return Math.max(...daily.map(d => d.messages), 1);
  };

  const getModelName = (modelId: string): string => {
    const config = MODEL_CONFIG.models[modelId as ModelId];
    return config?.name || modelId;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Usage Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'daily', label: 'Daily Usage', icon: '📈' },
            { id: 'models', label: 'Models', icon: '🤖' },
            { id: 'export', label: 'Export', icon: '💾' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/10'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && overall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Total Conversations</div>
                  <div className="text-2xl font-bold text-white">{overall.totalConversations}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Total Messages</div>
                  <div className="text-2xl font-bold text-white">{formatNumber(overall.totalMessages)}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Total Tokens</div>
                  <div className="text-2xl font-bold text-white">{formatNumber(overall.totalTokens)}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-400 mb-1">Most Used Model</div>
                  <div className="text-lg font-bold text-white truncate">{getModelName(overall.mostUsedModel) || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Input vs Output Tokens</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-400">Input</span>
                        <span className="text-gray-300">{formatNumber(overall.totalInputTokens)}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: overall.totalTokens > 0
                              ? `${(overall.totalInputTokens / overall.totalTokens) * 100}%`
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">Output</span>
                        <span className="text-gray-300">{formatNumber(overall.totalOutputTokens)}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: overall.totalTokens > 0
                              ? `${(overall.totalOutputTokens / overall.totalTokens) * 100}%`
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Averages</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Messages per Conversation</span>
                      <span className="text-white font-medium">{overall.averageMessagesPerConversation.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tokens per Message</span>
                      <span className="text-white font-medium">{formatNumber(overall.averageTokensPerMessage)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Last 7 Days Activity</h3>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="space-y-3">
                  {daily.map((day, idx) => {
                    const maxMessages = getMaxDaily();
                    const percentage = (day.messages / maxMessages) * 100;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex gap-4 text-gray-300">
                            <span>{day.messages} messages</span>
                            <span>{formatNumber(day.tokens)} tokens</span>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-700 rounded overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                            {day.conversations} conversations
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Token Usage by Model</h3>
              <div className="space-y-3">
                {byModel.map((model, idx) => (
                  <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{getModelName(model.modelId)}</span>
                      <span className="text-gray-300 text-sm">{formatNumber(model.tokens)} tokens</span>
                    </div>
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${model.percentage}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-400 text-right">
                      {model.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                ))}
                {byModel.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No usage data available yet
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Export Analytics Data</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportJSON}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Export as JSON
                    </span>
                    <span className="text-sm text-blue-200">Detailed data export</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center justify-between px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Export as CSV
                    </span>
                    <span className="text-sm text-green-200">Spreadsheet compatible</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                <button
                  onClick={handleClearData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear All Analytics Data
                </button>
                <p className="mt-2 text-xs text-gray-400 text-center">
                  This will permanently delete all collected analytics data
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {overall && `Tracking ${overall.totalConversations} conversations with ${formatNumber(overall.totalTokens)} tokens`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
