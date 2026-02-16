import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFlags } from '../hooks/useFlags';
import SearchBar from './SearchBar';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const EducationMap: React.FC = () => {
    const [hoveredCountry, setHoveredCountry] = useState<any>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const { data: countries } = useFlags('beginner', 'all', 'all');

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="education-map-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <header style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#64748b'
                }}>
                    <ArrowLeft size={20} />
                </Link>
                <SearchBar />
                <div style={{ width: 40 }} /> {/* Spacer to balance header */}
            </header>

            <main style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: 0 }} onMouseMove={handleMouseMove}>
                <ComposableMap projectionConfig={{ scale: 160 }} style={{ width: '100%', height: '100%' }}>
                    <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }: { geographies: any[] }) =>
                                geographies.map((geo: any) => {
                                    const countryData = countries?.find((c: any) => c.cca3 === geo.id || c.name.common === geo.properties.name);
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {
                                                setHoveredCountry(countryData || { name: { common: geo.properties.name }, population: 0 });
                                            }}
                                            onMouseLeave={() => setHoveredCountry(null)}
                                            style={{
                                                default: {
                                                    fill: "#ffffff",
                                                    stroke: "#cbd5e1",
                                                    strokeWidth: 0.5,
                                                    outline: "none",
                                                },
                                                hover: {
                                                    fill: "var(--primary)",
                                                    stroke: "var(--primary)",
                                                    strokeWidth: 0.5,
                                                    outline: "none",
                                                    transition: 'all 0.2s ease'
                                                },
                                                pressed: {
                                                    fill: "var(--primary-hover)",
                                                    outline: "none",
                                                }
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>

                <AnimatePresence>
                    {hoveredCountry && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            style={{
                                position: 'fixed',
                                left: tooltipPos.x + 15,
                                top: tooltipPos.y + 15,
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0',
                                zIndex: 100,
                                pointerEvents: 'none'
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{hoveredCountry.name.common}</h3>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 600 }}>Population:</span>
                                    <span>{new Intl.NumberFormat().format(hoveredCountry.population || 0)}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default EducationMap;
