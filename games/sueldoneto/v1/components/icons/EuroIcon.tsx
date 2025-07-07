
import React from 'react';

const EuroIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M17.2 7a6 7 0 1 0 0 10" />
        <path d="M13 10h-8m0 4h8" />
    </svg>
);

export default EuroIcon;
