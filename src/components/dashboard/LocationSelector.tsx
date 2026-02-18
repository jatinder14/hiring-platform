"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

interface LocationSelectorProps {
    selectedCountryIso: string;
    setSelectedCountryIso: (iso: string) => void;
    selectedStateIso: string;
    setSelectedStateIso: (iso: string) => void;
    selectedCityName: string;
    setSelectedCityName: (name: string) => void;
    pincode: string;
    setPincode: (code: string) => void;
}

export default function LocationSelector({
    selectedCountryIso,
    setSelectedCountryIso,
    selectedStateIso,
    setSelectedStateIso,
    selectedCityName,
    setSelectedCityName,
    pincode,
    setPincode
}: LocationSelectorProps) {

    // Memoize heavy data fetching
    const allCountries = useMemo(() => Country.getAllCountries(), []);
    const allStates = useMemo(() => selectedCountryIso ? State.getStatesOfCountry(selectedCountryIso) : [], [selectedCountryIso]);
    const allCities = useMemo(() => selectedStateIso ? City.getCitiesOfState(selectedCountryIso, selectedStateIso) : [], [selectedCountryIso, selectedStateIso]);

    // Local inputs for search
    const [countryInput, setCountryInput] = useState('');
    const [stateInput, setStateInput] = useState('');
    const [cityInput, setCityInput] = useState('');

    // Refs to track focus and prevent clearing loop while typing
    const countryInputRef = useRef<HTMLInputElement>(null);
    const stateInputRef = useRef<HTMLInputElement>(null);

    // Sync local inputs with props on initial load or external change
    useEffect(() => {
        const c = allCountries.find(c => c.isoCode === selectedCountryIso);
        if (c) {
            setCountryInput(c.name);
        } else if (!selectedCountryIso) {
            // Only clear if NOT focused (user is not typing)
            if (document.activeElement !== countryInputRef.current) {
                setCountryInput('');
            }
        }
    }, [selectedCountryIso, allCountries]);

    useEffect(() => {
        const s = allStates.find(s => s.isoCode === selectedStateIso);
        if (s) {
            setStateInput(s.name);
        } else if (!selectedStateIso) {
            // Only clear if NOT focused (user is not typing)
            if (document.activeElement !== stateInputRef.current) {
                setStateInput('');
            }
        }
    }, [selectedStateIso, allStates]);

    useEffect(() => {
        setCityInput(selectedCityName || '');
    }, [selectedCityName]);

    // Filtered lists for performance (limit rendering)
    const filteredCountries = useMemo(() =>
        allCountries.filter(c => c.name.toLowerCase().includes(countryInput.toLowerCase())).slice(0, 50),
        [allCountries, countryInput]);

    const filteredStates = useMemo(() =>
        allStates.filter(s => s.name.toLowerCase().includes(stateInput.toLowerCase())).slice(0, 50),
        [allStates, stateInput]);

    const filteredCities = useMemo(() =>
        allCities.filter(c => c.name.toLowerCase().includes(cityInput.toLowerCase())).slice(0, 50),
        [allCities, cityInput]);

    return (
        <>
            {/* Country */}
            <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                        ref={countryInputRef}
                        type="text"
                        className="form-input"
                        list="country-list"
                        value={countryInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCountryInput(val);
                            const country = allCountries.find(c => c.name === val);
                            if (country) {
                                setSelectedCountryIso(country.isoCode);
                                setSelectedStateIso('');
                                setSelectedCityName('');
                            } else {
                                setSelectedCountryIso('');
                                setSelectedStateIso('');
                                setSelectedCityName('');
                            }
                        }}
                        placeholder="Search or select country..."
                    />
                    <datalist id="country-list">
                        {filteredCountries.map(c => (
                            <option key={c.isoCode} value={c.name} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* State */}
            <div className="form-group">
                <label className="form-label">State / Province</label>
                <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                        ref={stateInputRef}
                        type="text"
                        className="form-input"
                        list="state-list"
                        value={stateInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            setStateInput(val);
                            const state = allStates.find(s => s.name === val);
                            if (state) {
                                setSelectedStateIso(state.isoCode);
                                setSelectedCityName('');
                            } else {
                                setSelectedStateIso('');
                            }
                        }}
                        placeholder={selectedCountryIso ? "Search or select state..." : "Select country first"}
                        disabled={!selectedCountryIso}
                    />
                    <datalist id="state-list">
                        {filteredStates.map(s => (
                            <option key={s.isoCode} value={s.name} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* City */}
            <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                        type="text"
                        className="form-input"
                        list="city-list"
                        value={cityInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCityInput(val);
                            setSelectedCityName(val);
                        }}
                        placeholder={selectedStateIso ? "Search or select city..." : "Select state first"}
                        disabled={!selectedStateIso}
                    />
                    <datalist id="city-list">
                        {filteredCities.map((c, i) => (
                            <option key={`${c.name}-${i}`} value={c.name} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Pincode */}
            <div className="form-group">
                <label className="form-label">Pincode / ZIP Code</label>
                <div className="input-wrapper">
                    <MapPin size={18} />
                    <input
                        type="text"
                        className="form-input"
                        value={pincode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                            setPincode(value);
                        }}
                        placeholder="Enter postal code"
                        maxLength={10}
                    />
                </div>
            </div>
        </>
    );
}
