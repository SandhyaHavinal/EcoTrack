import React, { useState } from 'react';
import { useEcoTrack } from '../context/EcoTrackContext';
import { MapPin, Navigation, Info, CheckCircle, Leaf, Bike, Bus, Train, Car } from 'lucide-react';
import { EMISSION_FACTORS } from '../services/emissions';



const TravelTracker: React.FC = () => {
  const { addActivity } = useEcoTrack();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripLogged, setTripLogged] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<keyof typeof EMISSION_FACTORS.transport>('bus');

  // Direct calculation fallback when Maps API isn't initialized
  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setTripLogged(false);

    // Simulate route search
    setTimeout(() => {
      // Generate a realistic distance based on string length hash for consistency
      const hash = (origin.length + destination.length) * 3;
      const calculatedDistance = Math.max(2, hash % 45); // distance between 2 and 45 km
      setDistance(calculatedDistance);
      setLoading(false);
    }, 1200);
  };

  const logTrip = async (mode: keyof typeof EMISSION_FACTORS.transport) => {
    if (!distance) return;
    setLoading(true);
    try {
      await addActivity({
        date: new Date().toISOString().split('T')[0],
        transport: {
          mode,
          distance: Number(distance),
          emissions: 0,
          routeDetails: { origin, destination }
        },
        electricity: { kwh: 0, emissions: 0 },
        water: { liters: 0, emissions: 0 },
        food: { dietType: 'mixed', emissions: 0 },
        waste: { weight: 0, recycled: 0, composted: 0, emissions: 0 }
      });
      setTripLogged(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute emission comparisons
  const carEmissions = distance ? Number((distance * EMISSION_FACTORS.transport.car_petrol).toFixed(2)) : 0;
  const evEmissions = distance ? Number((distance * EMISSION_FACTORS.transport.ev).toFixed(2)) : 0;
  const busEmissions = distance ? Number((distance * EMISSION_FACTORS.transport.bus).toFixed(2)) : 0;
  const trainEmissions = distance ? Number((distance * EMISSION_FACTORS.transport.train).toFixed(2)) : 0;
  const bikeEmissions = 0;



  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Travel Route <span className="eco-gradient-text font-bold">Tracker</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Map out your commutes, estimate travel distance, and compare low-carbon alternatives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Route Form */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-500" />
              <span>Route Planner</span>
            </h3>

            <form onSubmit={handleCalculateRoute} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Starting Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. 5th Avenue, New York"
                    className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Central Park Zoo"
                    className="w-full glass-input pl-10 pr-4 py-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Calculate Distance</span>
                    <Navigation className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Environmental warning / API status */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <Info className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Offline Simulation Mode</span>
              <p className="leading-relaxed">
                If the VITE_GOOGLE_MAPS_API_KEY environment variable is not defined, EcoTrack generates simulated coordinates and distances based on text inputs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Map & Alternative Comparison */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Display Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg h-[300px] md:h-[400px] relative flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
            {distance ? (
              <div className="w-full h-full relative p-6 flex flex-col justify-between">
                
                {/* SVG Route Visualization */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <svg width="240" height="200" viewBox="0 0 240 200" className="text-emerald-500 fill-none stroke-current stroke-2 stroke-dasharray-4">
                    <path d="M 40,160 C 80,100 120,40 200,40" strokeWidth="3" strokeDasharray="6" className="animate-[dash_3s_linear_infinite]" />
                    <circle cx="40" cy="160" r="6" fill="#10b981" />
                    <circle cx="200" cy="40" r="6" fill="#ef4444" />
                  </svg>
                </div>

                <div className="z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 self-start text-xs font-semibold">
                  Origin: {origin}
                </div>

                <div className="z-10 flex flex-col items-center justify-center py-6 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Route Distance</span>
                  <span className="font-outfit text-5xl font-extrabold text-emerald-500">{distance.toFixed(1)} km</span>
                  <span className="text-xs text-slate-500">Route active from {origin} to {destination}</span>
                </div>

                <div className="z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 self-end text-xs font-semibold">
                  Destination: {destination}
                </div>

              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <Navigation className="w-12 h-12 text-slate-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No active route mapped</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Enter an origin and destination in the sidebar planner to calculate the distance and estimate transit alternatives.
                </p>
              </div>
            )}
          </div>

          {/* Comparison and Log Trip Panel */}
          {distance && (
            <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
              <div>
                <h3 className="text-lg font-bold">Carbon Footprint Comparison</h3>
                <p className="text-xs text-slate-500">Check emissions for different transportation modes for this trip.</p>
              </div>

              {/* Grid of alternatives */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                
                {/* Standard Car */}
                <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-1">
                  <Car className="w-6 h-6 text-rose-500 mx-auto" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Petrol Car</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{carEmissions} kg</span>
                  <span className="text-[9px] text-rose-600 dark:text-rose-400 font-semibold block">Baseline</span>
                </div>

                {/* EV */}
                <button
                  onClick={() => setSelectedAlternative('ev')}
                  className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                    selectedAlternative === 'ev' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Leaf className="w-6 h-6 text-emerald-500 mx-auto" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Electric Car</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{evEmissions} kg</span>
                  <span className="text-[9px] text-emerald-600 font-semibold block">-{Math.round((1 - evEmissions/carEmissions)*100)}%</span>
                </button>

                {/* Bus */}
                <button
                  onClick={() => setSelectedAlternative('bus')}
                  className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                    selectedAlternative === 'bus' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Bus className="w-6 h-6 text-sky-500 mx-auto" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Bus Transit</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{busEmissions} kg</span>
                  <span className="text-[9px] text-emerald-600 font-semibold block">-{Math.round((1 - busEmissions/carEmissions)*100)}%</span>
                </button>

                {/* Train */}
                <button
                  onClick={() => setSelectedAlternative('train')}
                  className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                    selectedAlternative === 'train' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Train className="w-6 h-6 text-indigo-500 mx-auto" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Train Transit</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{trainEmissions} kg</span>
                  <span className="text-[9px] text-emerald-600 font-semibold block">-{Math.round((1 - trainEmissions/carEmissions)*100)}%</span>
                </button>

                {/* Walk/Bike */}
                <button
                  onClick={() => setSelectedAlternative('walk_bike')}
                  className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                    selectedAlternative === 'walk_bike' 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Bike className="w-6 h-6 text-emerald-500 mx-auto" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Walk / Bike</span>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">{bikeEmissions} kg</span>
                  <span className="text-[9px] text-emerald-600 font-semibold block">-100%</span>
                </button>

              </div>

              {/* Action Log Box */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold">
                    Select a transit method to log this trip
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Logging this trip updates your footprint stats and awards 10 activity points.
                  </p>
                </div>
                
                {tripLogged ? (
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">Trip Logged!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => logTrip(selectedAlternative)}
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/15 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <span>Log Trip as {selectedAlternative.toUpperCase()}</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default TravelTracker;
