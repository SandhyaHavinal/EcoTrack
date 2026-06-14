import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcoTrack } from '../context/EcoTrackContext';
import { 
  Car, 
  Lightbulb, 
  Trash2, 
  Utensils, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Zap, 
  Droplet,
  Globe 
} from 'lucide-react';
import { EMISSION_FACTORS } from '../services/emissions';

const Calculator: React.FC = () => {
  const { addActivity } = useEcoTrack();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [transportMode, setTransportMode] = useState<keyof typeof EMISSION_FACTORS.transport>('car_petrol');
  const [distance, setDistance] = useState<number>(10);
  const [electricityKwh, setElectricityKwh] = useState<number>(50);
  const [waterLiters, setWaterLiters] = useState<number>(100);
  const [foodDiet, setFoodDiet] = useState<keyof typeof EMISSION_FACTORS.food>('mixed');
  const [wasteWeight, setWasteWeight] = useState<number>(5);
  const [recycledWeight, setRecycledWeight] = useState<number>(2);
  const [compostedWeight, setCompostedWeight] = useState<number>(1);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addActivity({
        date: new Date().toISOString().split('T')[0],
        transport: {
          mode: transportMode,
          distance: Number(distance),
          emissions: 0, // Calculated in context
        },
        electricity: {
          kwh: Number(electricityKwh),
          emissions: 0,
        },
        water: {
          liters: Number(waterLiters),
          emissions: 0,
        },
        food: {
          dietType: foodDiet,
          emissions: 0,
        },
        waste: {
          weight: Number(wasteWeight),
          recycled: Number(recycledWeight),
          composted: Number(compostedWeight),
          emissions: 0,
        }
      });
      setStep(4); // Move to final step (Success)
    } catch (error) {
      console.error('Failed to save carbon log:', error);
    } finally {
      setLoading(false);
    }
  };

  const transportLabels: Record<keyof typeof EMISSION_FACTORS.transport, string> = {
    car_petrol: 'Petrol Car',
    car_diesel: 'Diesel Car',
    ev: 'Electric Vehicle (EV)',
    motorbike: 'Motorbike',
    bus: 'Bus Transit',
    train: 'Train Transit',
    flight: 'Flight Travel',
    walk_bike: 'Walking/Cycling'
  };

  const foodLabels: Record<keyof typeof EMISSION_FACTORS.food, string> = {
    vegan: 'Vegan (Strict plant-based)',
    vegetarian: 'Vegetarian (No meat, has dairy/eggs)',
    mixed: 'Mixed Diet (Average meat and plants)',
    heavy_meat: 'Heavy Meat Eater (Meat in most meals)'
  };

  // Live footprint estimations
  const currentTransportEmissions = Number((distance * EMISSION_FACTORS.transport[transportMode]).toFixed(2));
  const currentElectricityEmissions = Number((electricityKwh * EMISSION_FACTORS.electricity).toFixed(2));
  const currentWaterEmissions = Number((waterLiters * EMISSION_FACTORS.water).toFixed(2));
  const currentFoodEmissions = Number(EMISSION_FACTORS.food[foodDiet].toFixed(2));
  const currentWasteEmissions = Number((
    (wasteWeight * EMISSION_FACTORS.waste.unsorted) +
    (recycledWeight * EMISSION_FACTORS.waste.recycled) +
    (compostedWeight * EMISSION_FACTORS.waste.composted)
  ).toFixed(2));

  const totalEstimate = Number((
    currentTransportEmissions +
    currentElectricityEmissions +
    currentWaterEmissions +
    currentFoodEmissions +
    currentWasteEmissions
  ).toFixed(2));

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Carbon Footprint <span className="eco-gradient-text font-bold">Calculator</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Fill in your daily or weekly activities to calculate your greenhouse gas footprint and update your score.
        </p>
      </div>

      {/* Calculator Container */}
      <div className="w-full max-w-2xl glass-card rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Transportation'}
                {step === 2 && 'Energy & Water'}
                {step === 3 && 'Food & Waste'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Wizard Steps */}
        <div className="min-h-[300px] flex flex-col justify-between">
          
          {/* STEP 1: TRANSPORT */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Transportation Habits</h3>
                  <p className="text-xs text-slate-400">Select how you traveled and distance covered.</p>
                </div>
              </div>

              {/* Mode selector grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(EMISSION_FACTORS.transport).map((mode) => {
                  const m = mode as keyof typeof EMISSION_FACTORS.transport;
                  const selected = transportMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setTransportMode(m);
                        if (m === 'walk_bike') setDistance(0);
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all duration-200 ${
                        selected 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold' 
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-2xl">
                        {m === 'car_petrol' && '🚗'}
                        {m === 'car_diesel' && '🚙'}
                        {m === 'ev' && '🔌'}
                        {m === 'motorbike' && '🏍️'}
                        {m === 'bus' && '🚌'}
                        {m === 'train' && '🚇'}
                        {m === 'flight' && '✈️'}
                        {m === 'walk_bike' && '🚲'}
                      </span>
                      <span className="text-xs">{transportLabels[m]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Distance Slider */}
              {transportMode !== 'walk_bike' && (
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold">Distance Traveled (km)</label>
                    <span className="text-sm font-bold text-emerald-500">{distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={transportMode === 'flight' ? '3000' : '200'}
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1 km</span>
                    <span>{transportMode === 'flight' ? '3000 km' : '200 km'}</span>
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center mt-6">
                <span className="text-sm font-medium">Estimated Transport Footprint:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentTransportEmissions} kg CO₂</span>
              </div>
            </div>
          )}

          {/* STEP 2: ENERGY & WATER */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center text-sky-500">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Electricity & Water Usage</h3>
                  <p className="text-xs text-slate-400">Log utility inputs for this activity period.</p>
                </div>
              </div>

              {/* Electricity Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <label className="text-sm font-semibold">Electricity Consumption (kWh)</label>
                  </div>
                  <span className="text-sm font-bold text-sky-500">{electricityKwh} kWh</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={electricityKwh}
                  onChange={(e) => setElectricityKwh(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0 kWh</span>
                  <span>500 kWh</span>
                </div>
              </div>

              {/* Water Input */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-sky-500" />
                    <label className="text-sm font-semibold">Water Usage (Liters)</label>
                  </div>
                  <span className="text-sm font-bold text-sky-500">{waterLiters} Liters</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0 L</span>
                  <span>1000 L</span>
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 mt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Electricity Emissions:</span>
                  <span className="font-semibold">{currentElectricityEmissions} kg CO₂</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Water Emissions:</span>
                  <span className="font-semibold">{currentWaterEmissions} kg CO₂</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-center font-bold text-slate-950 dark:text-white">
                  <span>Total Utility Footprint:</span>
                  <span>{Number((currentElectricityEmissions + currentWaterEmissions).toFixed(2))} kg CO₂</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FOOD & WASTE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Dietary Habits & Waste</h3>
                  <p className="text-xs text-slate-400">Enter food choices and recycling habits.</p>
                </div>
              </div>

              {/* Food Choices */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Primary Diet Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.keys(EMISSION_FACTORS.food).map((diet) => {
                    const d = diet as keyof typeof EMISSION_FACTORS.food;
                    const selected = foodDiet === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFoodDiet(d)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-200 ${
                          selected 
                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-semibold' 
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-xl">
                          {d === 'vegan' && '🥗'}
                          {d === 'vegetarian' && '🧀'}
                          {d === 'mixed' && '🍲'}
                          {d === 'heavy_meat' && '🥩'}
                        </span>
                        <div>
                          <p className="text-xs font-bold">{d.toUpperCase()}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{foodLabels[d]}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Waste Weights */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-semibold">Waste Generation (kg)</label>
                <div className="grid grid-cols-3 gap-3">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 pl-1">Unsorted (Landfill)</span>
                    <div className="relative">
                      <Trash2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        value={wasteWeight}
                        onChange={(e) => setWasteWeight(Math.max(0, Number(e.target.value)))}
                        className="w-full glass-input pr-10 pl-3 py-2 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 pl-1">Recycled</span>
                    <div className="relative">
                      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input
                        type="number"
                        min="0"
                        value={recycledWeight}
                        onChange={(e) => setRecycledWeight(Math.max(0, Number(e.target.value)))}
                        className="w-full glass-input pr-10 pl-3 py-2 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-500 pl-1">Composted</span>
                    <div className="relative">
                      <Utensils className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                      <input
                        type="number"
                        min="0"
                        value={compostedWeight}
                        onChange={(e) => setCompostedWeight(Math.max(0, Number(e.target.value)))}
                        className="w-full glass-input pr-10 pl-3 py-2 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Diet Footprint (Daily):</span>
                  <span className="font-semibold">{currentFoodEmissions} kg CO₂</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Waste Disposal Footprint:</span>
                  <span className="font-semibold">{currentWasteEmissions} kg CO₂</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div>
                <h3 className="font-outfit text-2xl font-bold">Activity Logged Successfully!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                  Your carbon footprint calculations have been updated in your profile.
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Total Logged Carbon</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalEstimate} kg CO₂</p>
              </div>

              <div className="flex flex-col gap-2 max-w-xs mx-auto pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setDistance(10);
                    setElectricityKwh(50);
                    setWaterLiters(100);
                    setWasteWeight(5);
                    setRecycledWeight(2);
                    setCompostedWeight(1);
                  }}
                  className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl font-semibold transition-all"
                >
                  Log Another Activity
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          {step < 4 && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 flex justify-between items-center">
              
              {/* Left Side: Prev Button */}
              {step > 1 ? (
                <button
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}

              {/* Total Estimate Marker */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Estimate</span>
                <span className="font-bold text-slate-900 dark:text-white text-lg">{totalEstimate} kg CO₂</span>
              </div>

              {/* Right Side: Next / Submit Button */}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:bg-slate-800 dark:hover:bg-slate-100"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Log</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Calculator;
