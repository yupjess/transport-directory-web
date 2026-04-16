import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchFuelPrices, fetchCommuterTypes, calculateCommuterFare, calculateVehicleFare, type FuelPrice } from '../lib/api';

export default function TransportWidget() {
  const [commuterType, setCommuterType] = useState('');
  const [commuterKm, setCommuterKm] = useState(1);
  const [vehicleProfile, setVehicleProfile] = useState('sedan');
  const [vehicleKm, setVehicleKm] = useState(10);
  const [fareResult, setFareResult] = useState<number | null>(null);
  const [vehicleCostResult, setVehicleCostResult] = useState<number | null>(null);

  // Fetch fuel prices
  const { data: fuelData, isLoading: fuelLoading, error: fuelError, refetch: refetchFuel } = useQuery({
    queryKey: ['fuel-prices'],
    queryFn: async () => {
      const res = await fetchFuelPrices();
      // API returns { data: [...], stale: false } or { data: [...], stale: false }
      // Normalize to { data: [...] }
      if (res.data) return res;
      return { data: [] };
    },
  });

  // Fetch commuter types
  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ['commuter-types'],
    queryFn: fetchCommuterTypes,
  });

  // Calculate commuter fare mutation
  const fareMutation = useMutation({
    mutationFn: ({ type, km }: { type: string; km: number }) => calculateCommuterFare(type, km),
    onSuccess: (data) => setFareResult(data.fare),
  });

  // Calculate vehicle cost via API
  const vehicleMutation = useMutation({
    mutationFn: ({ profile, km }: { profile: string; km: number }) => calculateVehicleFare(profile, km),
    onSuccess: (data) => setVehicleCostResult(data.cost),
  });

  const handleCommuterCalc = () => {
    if (!commuterType || !commuterKm) return;
    fareMutation.mutate({ type: commuterType, km: commuterKm });
  };

  const handleVehicleCalc = () => {
    if (!vehicleKm) return;
    vehicleMutation.mutate({ profile: vehicleProfile, km: vehicleKm });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Fuel Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-blue-500"></i> Latest Fuel Prices
        </h2>

        {fuelLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg" />
            ))}
          </div>
        ) : fuelError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            Failed to load fuel prices
            <button
              onClick={() => refetchFuel()}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div id="fuel-list" className="space-y-4">
            {fuelData?.data?.map((fuel: FuelPrice, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="font-bold text-slate-800">{fuel.brand}</div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div><span className="text-slate-500">Ron91:</span> ₱{fuel.ron91}</div>
                  <div><span className="text-slate-500">Ron95:</span> ₱{fuel.ron95}</div>
                  <div><span className="text-slate-500">Diesel:</span> ₱{fuel.diesel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commuter Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-calculator text-blue-500"></i> Commuter Fare
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">PUV Type</label>
            <select
              value={commuterType}
              onChange={e => setCommuterType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              disabled={typesLoading}
            >
              <option value="">Select type...</option>
              {typesData?.types?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Distance (km)</label>
            <input
              type="number"
              value={commuterKm}
              onChange={e => setCommuterKm(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
              min="1"
            />
          </div>
          <button
            onClick={handleCommuterCalc}
            disabled={!commuterType || fareMutation.isPending}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {fareMutation.isPending ? 'Calculating...' : 'Calculate Fare'}
          </button>
          {fareResult !== null && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-600 font-medium">Estimated Fare</div>
              <div className="text-3xl font-bold text-blue-900">₱{fareResult.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-car text-blue-500"></i> Vehicle Trip Cost
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Vehicle Profile</label>
            <select
              value={vehicleProfile}
              onChange={e => setVehicleProfile(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="sedan">Sedan</option>
              <option value="auv_van">AUV / Van</option>
              <option value="suv">SUV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Distance (km)</label>
            <input
              type="number"
              value={vehicleKm}
              onChange={e => setVehicleKm(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg"
              min="1"
            />
          </div>
          <button
            onClick={handleVehicleCalc}
            disabled={vehicleMutation.isPending}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {vehicleMutation.isPending ? 'Calculating...' : 'Estimate Cost'}
          </button>
          {vehicleCostResult !== null && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-600 font-medium">Estimated Fuel Cost</div>
              <div className="text-3xl font-bold text-blue-900">₱{vehicleCostResult.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}