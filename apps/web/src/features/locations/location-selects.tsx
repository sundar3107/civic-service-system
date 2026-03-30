"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../lib/api";

type District = {
  id: string;
  name: string;
  cities: Array<{ id: string; name: string }>;
};

const FALLBACK_DISTRICTS: District[] = [
  {
    id: "fallback-vellore",
    name: "Vellore",
    cities: [{ id: "fallback-katpadi", name: "Katpadi" }]
  }
];

type LocationSelectsProps = {
  districtId: string;
  cityId: string;
  onDistrictChange: (districtId: string) => void;
  onCityChange: (cityId: string) => void;
  labelPrefix?: string;
};

export function LocationSelects({
  districtId,
  cityId,
  onDistrictChange,
  onCityChange,
  labelPrefix = ""
}: LocationSelectsProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<District[]>("/locations/districts");
        if (data.length > 0) {
          setDistricts(data);
        } else {
          setDistricts(FALLBACK_DISTRICTS);
          setError("Using fallback district data. Run the seed command to load the full Tamil Nadu list.");
        }
      } catch {
        setDistricts(FALLBACK_DISTRICTS);
        setError("District data is unavailable. Using fallback Vellore / Katpadi for now.");
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (!districtId && districts.length > 0) {
      const firstDistrict = districts[0];
      onDistrictChange(firstDistrict.id);
      onCityChange(firstDistrict.cities[0]?.id ?? "");
    }
  }, [districtId, districts, onCityChange, onDistrictChange]);

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === districtId) ?? null,
    [districtId, districts]
  );

  return (
    <>
      {error ? <div className="notice">{error}</div> : null}
      <div className="split">
        <div className="form-row">
          <label htmlFor={`${labelPrefix}district`}>District</label>
          <select
            id={`${labelPrefix}district`}
            className="select"
            value={districtId}
            onChange={(event) => {
              onDistrictChange(event.target.value);
              onCityChange("");
            }}
          >
            <option value="">Select district</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor={`${labelPrefix}city`}>City / Town / Village</label>
          <select
            id={`${labelPrefix}city`}
            className="select"
            value={cityId}
            onChange={(event) => onCityChange(event.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Select city / town / village</option>
            {selectedDistrict?.cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
