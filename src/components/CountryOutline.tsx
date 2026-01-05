import React, { useEffect, useState, useMemo } from 'react';
import { feature } from 'topojson-client';
import { geoPath, geoMercator } from 'd3-geo';

import { motion } from 'framer-motion';

interface CountryOutlineProps {
    cca3: string;
    name: string;
}

const CountryOutline: React.FC<CountryOutlineProps> = ({ cca3, name }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Fetch world map data
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(res => res.json())
            .then(data => {
                const countries = feature(data, data.objects.countries) as any;
                const country = countries.features.find((f: any) => f.id === cca3 || f.properties.name === name);
                if (country) {
                    setGeoData(country);
                } else {
                    // Fallback to searching by name if ID doesn't match
                    setError(true);
                }
            })
            .catch(() => setError(true));
    }, [cca3, name]);

    const path = useMemo(() => {
        if (!geoData) return null;

        const projection = geoMercator().fitSize([300, 200], geoData);
        return geoPath().projection(projection)(geoData);
    }, [geoData]);

    if (error) {
        return (
            <div className="flag-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <p style={{ color: 'var(--text-muted)' }}>Outline not available for {name}</p>
            </div>
        );
    }

    return (
        <div className="flag-container" style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 200" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                {path ? (
                    <motion.path
                        d={path!}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        style={{
                            filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2))'
                        }}
                    />
                ) : (
                    <text x="150" y="100" textAnchor="middle" fill="var(--text-muted)" fontSize="12">Loading outline...</text>
                )}
            </svg>
        </div>
    );
};

export default CountryOutline;
