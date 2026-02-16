import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllCountries } from '../api/countries';
import type { Country } from '../types/country';
import { useAuth } from '../contexts/AuthContext';
import CountryOutline from './CountryOutline';

const SearchBar: React.FC = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [countries, setCountries] = useState<Country[]>([]);
    const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchAllCountries().then(setCountries).catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (query.trim() === '') {
            setFilteredCountries([]);
        } else {
            const lowerQuery = query.toLowerCase();
            const results = countries.filter(c =>
                c.name.common.toLowerCase().includes(lowerQuery) ||
                c.cca3.toLowerCase().includes(lowerQuery)
            ).slice(0, 8);
            setFilteredCountries(results);
        }
    }, [query, countries]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="search-container" ref={searchRef}>
            <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search countries..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                />
                {query && (
                    <button className="clear-search" onClick={() => setQuery('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isFocused && filteredCountries.length > 0 && (
                    <motion.div
                        className="search-results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        {filteredCountries.map(country => (
                            <div
                                key={country.cca3}
                                className="search-result-item"
                                onClick={() => {
                                    setSelectedCountry(country);
                                    setIsFocused(false);
                                    setQuery('');
                                }}
                            >
                                <img src={country.flags.svg} alt={country.name.common} className="result-flag" />
                                <div className="result-info">
                                    <span className="result-name">{country.name.common}</span>
                                    <span className="result-region">{country.region}</span>
                                </div>
                                <ChevronRight size={16} className="result-arrow" />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedCountry && (
                    <motion.div
                        className="search-full-screen-overlay"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <header className="full-screen-header">
                            <button className="back-btn" onClick={() => setSelectedCountry(null)}>
                                <ArrowLeft size={24} />
                                <span>Back</span>
                            </button>
                            <h1>{selectedCountry.name.common}</h1>
                            <div style={{ width: 44 }} /> {/* Spacer */}
                        </header>

                        <div className="full-screen-content">
                            <div className="content-grid">
                                <section className="visual-section">
                                    <div className="visual-card">
                                        <h3>Flag</h3>
                                        <div className="visual-container">
                                            <img src={selectedCountry.flags.svg} alt={selectedCountry.name.common} />
                                        </div>
                                    </div>
                                    <div className="visual-card">
                                        <h3>Outline</h3>
                                        <div className="visual-container">
                                            <CountryOutline cca3={selectedCountry.cca3} name={selectedCountry.name.common} />
                                        </div>
                                    </div>
                                </section>

                                <section className="info-section">
                                    <div className="info-card">
                                        <h3>Country Details</h3>
                                        <div className="details-list">
                                            <div className="detail-item">
                                                <span className="label">Official Name</span>
                                                <span className="value">{selectedCountry.name.official}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Capital</span>
                                                <span className="value">{selectedCountry.capital?.[0] || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Region</span>
                                                <span className="value">{selectedCountry.region}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Subregion</span>
                                                <span className="value">{selectedCountry.subregion}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Population</span>
                                                <span className="value">{selectedCountry.population.toLocaleString()}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">CCA3 Code</span>
                                                <span className="value">{selectedCountry.cca3}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchBar;
