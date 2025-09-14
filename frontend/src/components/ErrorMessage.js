import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ title = 'Error', message = 'Please try again later.', onRetry }) => (
  <div className="text-center p-8">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn btn-primary inline-flex items-center justify-center"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;
