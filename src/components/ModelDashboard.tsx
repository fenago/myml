/**
 * Model Info Dashboard Component
 * Displays model statistics, memory usage, and performance metrics
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { modelInfoService, type ModelInfo } from '../services/ModelInfoService';
import { useStore } from '../store/useStore';
import { getModelConfig } from '../config/models';

interface Props {
  onClose: () => void;
}

export function ModelDashboard({ onClose }: Props) {
  const { currentModelId, modelStatus, loadProgress } = useStore();
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentModel = getModelConfig(currentModelId);

  // Refresh model info every 2 seconds
  useEffect(() => {
    const updateInfo = async () => {
      const info = await modelInfoService.getModelInfo(
        currentModel,
        modelStatus === 'loaded',
        loadProgress?.percentage === 100 ? Date.now() : undefined
      );
      setModelInfo(info);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 2000);

    return () => clearInterval(interval);
  }, [currentModel, modelStatus, loadProgress, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClearHistory = () => {
    if (confirm('Clear performance history? This will reset all statistics.')) {
      modelInfoService.clearHistory();
      handleRefresh();
    }
  };

  if (!modelInfo) {
    return null;
  }

  const perfBreakdown = modelInfoService.getPerformanceBreakdown();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Model Dashboard</h2>
              <p className="text-sm text-blue-100">Performance & System Statistics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all text-white"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Model Status */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Model Status</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    modelInfo.isLoaded
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {modelInfo.isLoaded ? '✓ Loaded' : 'Not Loaded'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Model</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{modelInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Size</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{modelInfo.size} MB</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quantization</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{modelInfo.quantization}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Capabilities</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {modelInfo.capabilities.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Usage</h3>

              <div className="space-y-4">
                {/* Memory Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      {modelInfo.memoryUsed} MB / {modelInfo.memoryTotal} MB
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{modelInfo.memoryPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        modelInfo.memoryPercent > 80
                          ? 'bg-red-500'
                          : modelInfo.memoryPercent > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(modelInfo.memoryPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* System Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Platform</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{modelInfo.platform}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">CPU Cores</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {modelInfo.hardwareConcurrency}
                    </p>
                  </div>
                  {modelInfo.deviceMemory && (
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Device RAM</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {modelInfo.deviceMemory} GB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Statistics</h3>
                {modelInfo.totalInferences > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {modelInfo.totalInferences === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                  No inference data yet. Generate some responses to see performance stats!
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Main Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Speed</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {modelInfo.averageTokensPerSecond}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">tokens/sec</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Latency</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {modelInfo.averageLatency}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">ms</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Inferences</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {modelInfo.totalInferences}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">requests</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tokens</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {modelInfo.totalTokensGenerated.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">generated</p>
                    </div>
                  </div>

                  {/* Performance Breakdown */}
                  {perfBreakdown && (
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Speed Distribution (tokens/sec)</p>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Min</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.round(perfBreakdown.min)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Median</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.round(perfBreakdown.median)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">P95</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.round(perfBreakdown.p95)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Max</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.round(perfBreakdown.max)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>100% Local Processing:</strong> All inference happens in your browser. No data is sent to external servers. Performance depends on your device's CPU and available memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
