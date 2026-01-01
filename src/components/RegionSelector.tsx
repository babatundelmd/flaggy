import React from 'react';

interface RegionSelectorProps {
    region: string;
    subregion: string;
    onRegionChange: (r: string) => void;
    onSubregionChange: (s: string) => void;
}

const regions = [
    { id: 'all', label: 'All World' },
    { id: 'africa', label: 'Africa', subregions: ['North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa'] },
    { id: 'americas', label: 'Americas', subregions: ['North America', 'Central America', 'South America', 'Caribbean'] },
    { id: 'asia', label: 'Asia', subregions: ['Eastern Asia', 'Western Asia', 'South-Eastern Asia', 'Southern Asia', 'Central Asia'] },
    { id: 'europe', label: 'Europe', subregions: ['Western Europe', 'Eastern Europe', 'Southern Europe', 'Northern Europe'] },
    { id: 'oceania', label: 'Oceania' },
];

export const RegionSelector: React.FC<RegionSelectorProps> = ({ region, subregion, onRegionChange, onSubregionChange }) => {
    const currentRegion = regions.find(r => r.id === region.toLowerCase());

    return (
        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <select
                value={region.toLowerCase()}
                onChange={(e) => onRegionChange(e.target.value)}
                className="form-select"
                style={{ flex: 1 }}
            >
                {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                        {r.label}
                    </option>
                ))}
            </select>

            {currentRegion?.subregions && (
                <select
                    value={subregion}
                    onChange={(e) => onSubregionChange(e.target.value)}
                    className="form-select"
                    style={{ flex: 1 }}
                >
                    <option value="all">All {currentRegion.label}</option>
                    {currentRegion.subregions.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};
