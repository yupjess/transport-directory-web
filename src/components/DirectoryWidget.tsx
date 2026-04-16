import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchDirectory, scrapeDirectory, type DirectoryEntry } from '../lib/api';
import { REGIONS } from './regions';

// Region/province/city cascading dropdowns
function LocationFilters({
  onFilter,
}: {
  onFilter: (region: string, province: string, city: string) => void;
}) {
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  const selectedRegion = REGIONS.find(r => r.name === region);

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setProvince('');
    setCity('');
    onFilter(value, '', '');
  };

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity('');
    onFilter(region, value, '');
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    onFilter(region, province, value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Region</label>
        <select
          value={region}
          onChange={e => handleRegionChange(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
        >
          <option value="">All Regions</option>
          {REGIONS.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Province</label>
        <select
          value={province}
          onChange={e => handleProvinceChange(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          disabled={!region}
        >
          <option value="">Select Region first</option>
          {selectedRegion?.provinces.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">City</label>
        <select
          value={city}
          onChange={e => handleCityChange(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          disabled={!province}
        >
          <option value="">Select Province first</option>
          {selectedRegion?.provinces.find(p => p.name === province)?.cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function DirectoryWidget() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageStart, setPageStart] = useState(0);
  const [pageEnd, setPageEnd] = useState(4);
  const [filters, setFilters] = useState({ region: '', province: '', city: '' });
  const [selectedEntry, setSelectedEntry] = useState<DirectoryEntry | null>(null);

  // Search query
  const { data: searchData, isLoading: searchLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['directory-search', searchQuery],
    queryFn: async (query: string) => {
      const result = await searchDirectory(query);
      // Adventist API returns { success: true, data: [...], total: ... }
      // Normalize to { data: [...] }
      if (result.data) return result;
      // Handle case where search returns different format
      if (Array.isArray(result)) return { data: result };
      return { data: [] };
    },
    enabled: searchQuery.length > 0,
  });

  // Paginated scrape
  const { data: scrapeData, isLoading: scrapeLoading, refetch: refetchScrape } = useQuery({
    queryKey: ['directory-scrape', pageStart, pageEnd],
    queryFn: async (start: number, end: number) => {
      const result = await scrapeDirectory(start, end);
      // Adventist API returns { success: true, data: [...], total_records: ... }
      // Normalize to { data: [...] }
      if (result.data) return result;
      // Handle case where result is an array directly
      if (Array.isArray(result)) return { data: result };
      return { data: [] };
    },
    enabled: searchQuery.length === 0,
  });

  // Use search data if available, otherwise use scrape data
  const entries = searchData?.data || scrapeData?.data || [];
  const isLoading = searchLoading || scrapeLoading;

  const applyFilters = (region: string, province: string, city: string) => {
    setFilters({ region, province, city });
  };

  const filteredEntries = entries.filter((entry: DirectoryEntry) => {
    if (!filters.region && !filters.province && !filters.city) return true;
    const matchesRegion = !filters.region ||
      entry.union?.includes(filters.region) ||
      entry.conference?.includes(filters.region);
    const matchesProvince = !filters.province || entry.address?.includes(filters.province);
    const matchesCity = !filters.city || entry.address?.includes(filters.city);
    return matchesRegion && matchesProvince && matchesCity;
  });

  return (
    <div className="space-y-6">
      {/* Error state */}
      {(searchLoading === false && searchQuery && !searchData) ||
       (scrapeLoading === false && !searchQuery && !scrapeData) ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>Failed to load directory entries. Please try again.</span>
          <button
            onClick={() => searchQuery ? refetchSearch() : refetchScrape()}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        {/* Text Search */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Search by Name, City, or Keyword</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter search term..."
              className="flex-1 p-2 border border-slate-300 rounded-lg"
            />
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Location Filters */}
        <LocationFilters onFilter={applyFilters} />

        {/* Page Range (for non-search mode) */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-slate-600 mb-1">Start Page</label>
              <input
                type="number"
                value={pageStart}
                onChange={e => setPageStart(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
                min="0"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-slate-600 mb-1">End Page</label>
              <input
                type="number"
                value={pageEnd}
                onChange={e => setPageEnd(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
                min="0"
              />
            </div>
            <button
              onClick={() => refetchScrape()}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass"></i> Browse Pages
            </button>
          </div>
        )}
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-sm uppercase font-semibold">
              <tr>
                <th className="p-4 border-b border-slate-200">Organization</th>
                <th className="p-4 border-b border-slate-200">Status</th>
                <th className="p-4 border-b border-slate-200">Location</th>
                <th className="p-4 border-b border-slate-200">Contact</th>
                <th className="p-4 border-b border-slate-200">Conference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colspan={5} className="p-8 text-center text-slate-400 italic">
                    Loading...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colspan={5} className="p-8 text-center text-slate-400 italic">
                    No records found for this selection.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry: DirectoryEntry, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 transition-colors text-sm text-slate-700 cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="p-4 font-medium text-slate-900">{entry.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        {entry.org_status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">{entry.address}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {entry.phone && <span className="text-xs text-slate-500">{entry.phone}</span>}
                        {entry.email && (
                          <a href={`mailto:${entry.email}`} className="text-xs text-blue-600 hover:underline">
                            {entry.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs">{entry.conference}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Entry Info */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEntry(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{selectedEntry.name}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-slate-600">Status:</span> {selectedEntry.org_status || 'N/A'}</p>
              <p><span className="font-medium text-slate-600">Location:</span> {selectedEntry.address}</p>
              {selectedEntry.phone && <p><span className="font-medium text-slate-600">Phone:</span> {selectedEntry.phone}</p>}
              {selectedEntry.email && <p><span className="font-medium text-slate-600">Email:</span> {selectedEntry.email}</p>}
              {selectedEntry.conference && <p><span className="font-medium text-slate-600">Conference:</span> {selectedEntry.conference}</p>}
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="mt-4 w-full py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}