/**
 * Function Editor Component
 * Create and edit custom AI functions
 *
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FunctionDefinition, FunctionParameter, FunctionParameterType } from '../types';

interface FunctionEditorProps {
  functionToEdit?: FunctionDefinition;
  onSave: (func: FunctionDefinition) => void;
  onCancel: () => void;
}

export function FunctionEditor({ functionToEdit, onSave, onCancel }: FunctionEditorProps) {
  const [name, setName] = useState(functionToEdit?.name || '');
  const [description, setDescription] = useState(functionToEdit?.description || '');
  const [endpoint, setEndpoint] = useState(functionToEdit?.endpoint || '');
  const [method, setMethod] = useState<'GET' | 'POST'>(functionToEdit?.method || 'GET');
  const [apiKey, setApiKey] = useState(functionToEdit?.apiKey || '');
  const [headers, setHeaders] = useState<Record<string, string>>(functionToEdit?.headers || {});
  const [parameters, setParameters] = useState<FunctionParameter[]>(
    functionToEdit?.parameters || []
  );
  const [enabled, setEnabled] = useState(functionToEdit?.enabled ?? true);

  // Header editing state
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      {
        name: '',
        type: 'string',
        description: '',
        required: false,
      },
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleUpdateParameter = (index: number, field: keyof FunctionParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const handleAddHeader = () => {
    if (headerKey && headerValue) {
      setHeaders({ ...headers, [headerKey]: headerValue });
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    const updated = { ...headers };
    delete updated[key];
    setHeaders(updated);
  };

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      alert('Function name is required');
      return;
    }
    if (!description.trim()) {
      alert('Function description is required');
      return;
    }
    if (!endpoint.trim()) {
      alert('API endpoint is required');
      return;
    }

    // Check if all parameters have names
    if (parameters.some((p) => !p.name.trim())) {
      alert('All parameters must have a name');
      return;
    }

    const func: FunctionDefinition = {
      id: functionToEdit?.id || `custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      parameters,
      enabled,
      builtIn: false,
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim() || undefined,
      method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    };

    onSave(func);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            {functionToEdit ? 'Edit Function' : 'Create Custom Function'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Define a custom function that calls an external API
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Function Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Get Stock Price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this function does..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Enable this function
                </label>
              </div>
            </div>
          </section>

          {/* API Configuration */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTTP Method
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key (optional)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your API key"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Custom Headers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Headers
                </label>
                <div className="space-y-2">
                  {Object.entries(headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                      <button
                        onClick={() => handleRemoveHeader(key)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={headerKey}
                      onChange={(e) => setHeaderKey(e.target.value)}
                      placeholder="Header name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={headerValue}
                      onChange={(e) => setHeaderValue(e.target.value)}
                      placeholder="Header value"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                    <button
                      onClick={handleAddHeader}
                      disabled={!headerKey || !headerValue}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Parameters */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Parameters</h3>
              <button
                onClick={handleAddParameter}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Parameter
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {parameters.map((param, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Parameter Name
                        </label>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, 'name', e.target.value)}
                          placeholder="paramName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleUpdateParameter(index, 'type', e.target.value as FunctionParameterType)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={param.description}
                        onChange={(e) => handleUpdateParameter(index, 'description', e.target.value)}
                        placeholder="What this parameter is for"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={param.required}
                          onChange={(e) => handleUpdateParameter(index, 'required', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={`required-${index}`} className="text-xs font-medium text-gray-700">
                          Required
                        </label>
                      </div>

                      <button
                        onClick={() => handleRemoveParameter(index)}
                        className="px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {parameters.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No parameters defined. Click "Add Parameter" to get started.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {functionToEdit ? 'Update Function' : 'Create Function'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
