import React from 'react';

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    
    return (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{message}</span>
            </div>
        </div>
    );
};

export default ErrorMessage; 