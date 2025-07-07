import React from 'react';

const CrownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75h7.5m-7.5 3h7.5M3 12.75a9 9 0 1118 0 9 9 0 01-18 0zM12 2.25L14.25 6l2.25-1.5-2.25 6h-4.5l-2.25-6L9.75 6 12 2.25z" />
    </svg>
);

export default CrownIcon;
