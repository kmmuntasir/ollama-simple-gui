import React, { useEffect } from 'react';

const Notification = ({ error, onDismiss }) => {
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, onDismiss]);

    if (!error) return null;

    return (
        <div className="fixed top-4 left-4 z-50">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
            </div>
        </div>
    );
};

export default Notification;