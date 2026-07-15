import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { lawyersData, Lawyer } from '../data/lawyersData';
import { Search, MapPin, SlidersHorizontal, Star, Shield, Building, Video, Languages, ChevronDown, Clock, X } from 'lucide-react';
import { cn } from '../lib/utils';
import FormSelect from '../components/forms/FormSelect';

const P_AREAS = [
  "Property", "Criminal", "Civil", "Corporate", "Family", "Consumer", 
  "Cyber", "Traffic", "Labour", "Women's Rights", "Elder Law", "Tax Law", 
  "Immigration", "Intellectual Property", "Banking", "Constitutional"
];
const EXPS = ["0-2 yrs", "3-5 yrs", "5-10 yrs", "10-20 yrs", "20+ yrs"];
const FEES = ["Under ₹500", "₹500–₹1500", "₹1500–₹3000", "₹3000–₹6000", "₹6000+"];
const LANGS = ["Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Urdu", "Odia"];
const RATINGS = [5, 4, 3];

export default function FindLawyers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [consultType, setConsultType] = useState<"all"|"online"|"offline"|"both">("all");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedExps, setSelectedExps] = useState<string[]>([]);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState("relevance");
  
  const [showMoreAreas, setShowMoreAreas] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const toggleArray = (arr: string[], val: string, setArr: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (arr.includes(val)) setArr(arr.filter(a => a !== val));
    else setArr([...arr, val]);
  };

  const clearAll = () => {
    setConsultType("all");
    setSelectedAreas([]);
    setSelectedExps([]);
    setSelectedFees([]);
    setSelectedLangs([]);
    setRatingFilter(0);
    setStateFilter("");
    setCityQuery("");
  };

  const checkExp = (lawyerExp: number, expFilter: string) => {
    if (expFilter === "0-2 yrs") return lawyerExp <= 2;
    if (expFilter === "3-5 yrs") return lawyerExp >= 3 && lawyerExp <= 5;
    if (expFilter === "5-10 yrs") return lawyerExp > 5 && lawyerExp <= 10;
    if (expFilter === "10-20 yrs") return lawyerExp > 10 && lawyerExp <= 20;
    if (expFilter === "20+ yrs") return lawyerExp > 20;
    return false;
  };

  const checkFee = (fee: number, feeFilter: string) => {
    if (feeFilter === "Under ₹500") return fee < 500;
    if (feeFilter === "₹500–₹1500") return fee >= 500 && fee <= 1500;
    if (feeFilter === "₹1500–₹3000") return fee > 1500 && fee <= 3000;
    if (feeFilter === "₹3000–₹6000") return fee > 3000 && fee <= 6000;
    if (feeFilter === "₹6000+") return fee > 6000;
    return false;
  };

  const filteredLawyers = useMemo(() => {
    let result = lawyersData.filter(lawyer => {
      // Search text
      const searchLower = searchQuery.toLowerCase();
      if (searchLower && !lawyer.name.toLowerCase().includes(searchLower) && !lawyer.specializations.some(s => s.toLowerCase().includes(searchLower))) {
        return false;
      }
      
      // City / State
      if (cityQuery && !lawyer.city.toLowerCase().includes(cityQuery.toLowerCase())) return false;
      if (stateFilter && lawyer.state !== stateFilter) return false;

      // Consult Type
      if (consultType !== "all" && consultType !== "both") {
        if (lawyer.availability !== "both" && lawyer.availability !== consultType) return false;
      }

      // Practice Areas
      if (selectedAreas.length > 0) {
        if (!selectedAreas.some(area => lawyer.specializations.some(s => s.toLowerCase().includes(area.toLowerCase())))) return false;
      }

      // Experience
      if (selectedExps.length > 0) {
        if (!selectedExps.some(exp => checkExp(lawyer.experience, exp))) return false;
      }

      // Fee
      if (selectedFees.length > 0) {
        if (!selectedFees.some(fee => checkFee(lawyer.consultationFee, fee))) return false;
      }

      // Languages
      if (selectedLangs.length > 0) {
        if (!selectedLangs.every(lang => lawyer.languages.includes(lang))) return false; // MUST speak all selected
      }

      // Rating
      if (ratingFilter > 0 && lawyer.rating < ratingFilter) return false;

      return true;
    });

    if (sortBy === "rating_desc") result.sort((a, b) => b.rating - a.rating);
    if (sortBy === "exp_desc") result.sort((a, b) => b.experience - a.experience);
    if (sortBy === "fee_asc") result.sort((a, b) => a.consultationFee - b.consultationFee);
    if (sortBy === "fee_desc") result.sort((a, b) => b.consultationFee - a.consultationFee);

    return result;
  }, [searchQuery, cityQuery, stateFilter, consultType, selectedAreas, selectedExps, selectedFees, selectedLangs, ratingFilter, sortBy]);

  const activeFilterCount = (consultType !== "all" ? 1 : 0) + selectedAreas.length + selectedExps.length + selectedFees.length + selectedLangs.length + (ratingFilter > 0 ? 1 : 0) + (stateFilter ? 1 : 0);

  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const currentLawyers = filteredLawyers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // States
  const states = Array.from(new Set(lawyersData.map(l => l.state))).sort();

  return (
    <div className="min-h-screen bg-[#102542] text-white flex flex-col font-sans">
      <Navbar />
      
      {/* Hero / Search */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0a1a2e] to-[#102542] border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Find Your Legal <span className="text-[#D4AF37]">Expert</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">Search from 10,000+ verified lawyers across India</p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-full flex flex-col md:flex-row items-center p-2 border-[#D4AF37]/30 focus-within:border-[#D4AF37]/80 transition-colors shadow-lg shadow-black/20 mb-6"
            >
              <div className="flex-1 flex items-center px-4 w-full md:w-auto">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, specialization, or keyword..." 
                  className="bg-transparent border-none outline-none w-full px-3 py-3 text-white placeholder-gray-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-[#D4AF37]/30 mx-2" />
              <div className="w-full md:w-px h-px bg-[#D4AF37]/30 my-2 md:hidden" />
              <div className="flex-1 md:flex-none md:w-1/3 flex items-center px-4 w-full">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="City or State" 
                  className="bg-transparent border-none outline-none w-full px-3 py-3 text-white placeholder-gray-500"
                  value={cityQuery}
                  onChange={e => setCityQuery(e.target.value)}
                />
              </div>
              <button className="w-full md:w-auto bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-semibold px-8 py-3 rounded-full mt-2 md:mt-0 transition-colors">
                Search
              </button>
            </motion.div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
              {["All", "Property", "Criminal", "Family", "Corporate", "Cyber", "Labour", "Women's Rights"].map(area => {
                const isActive = area === "All" ? selectedAreas.length === 0 : selectedAreas.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => {
                      if (area === "All") setSelectedAreas([]);
                      else toggleArray(selectedAreas, area, setSelectedAreas);
                    }}
                    className={cn(
                      "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border",
                      isActive 
                        ? "bg-[#D4AF37] text-[#102542] border-[#D4AF37]" 
                        : "bg-white/5 text-gray-300 border-white/10 hover:border-[#D4AF37]/50"
                    )}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-6 md:px-12 py-12 flex-grow flex flex-col md:flex-row gap-8 relative">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
          <span className="font-semibold">Showing {filteredLawyers.length} lawyers</span>
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-[#D4AF37] font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={cn(
          "md:w-72 shrink-0 md:sticky md:top-28 md:h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide flex flex-col gap-6",
          mobileFiltersOpen ? "fixed inset-0 z-50 bg-[#0a1a2e] p-6 top-0 h-screen w-full" : "hidden md:flex"
        )}>
          {mobileFiltersOpen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-2xl font-bold">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-white/10 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                Filters 
                {activeFilterCount > 0 && (
                  <span className="bg-[#D4AF37] text-[#102542] text-xs px-2 py-0.5 rounded-full font-sans">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-[#D4AF37] text-sm hover:underline">Clear All</button>
              )}
            </div>

            {/* Consult Type */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Consultation Type</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "online", label: "Online", icon: Video },
                  { id: "offline", label: "Offline", icon: Building },
                  { id: "both", label: "Both", icon: null }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setConsultType(opt.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-lg border transition-all text-xs gap-1",
                      consultType === opt.id 
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                    )}
                  >
                    {opt.icon && <opt.icon className="w-4 h-4" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Practice Area */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Practice Area</h4>
              <div className="flex flex-col gap-2">
                {(showMoreAreas ? P_AREAS : P_AREAS.slice(0, 6)).map(area => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedAreas.includes(area)}
                      onChange={() => toggleArray(selectedAreas, area, setSelectedAreas)}
                    />
                    <div className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border transition-all",
                      selectedAreas.includes(area) ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-transparent border-gray-500 group-hover:border-[#D4AF37]/50"
                    )}>
                      {selectedAreas.includes(area) && <div className="w-2 h-2 bg-[#102542] rounded-sm" />}
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{area}</span>
                  </label>
                ))}
                <button 
                  onClick={() => setShowMoreAreas(!showMoreAreas)}
                  className="text-xs text-[#D4AF37] hover:underline self-start mt-1"
                >
                  {showMoreAreas ? "Show less" : `Show ${P_AREAS.length - 6} more`}
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Experience</h4>
              <div className="flex flex-wrap gap-2">
                {EXPS.map(exp => (
                  <button
                    key={exp}
                    onClick={() => toggleArray(selectedExps, exp, setSelectedExps)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      selectedExps.includes(exp)
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                    )}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Minimum Rating</h4>
              <div className="flex flex-col gap-2">
                {RATINGS.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="rating"
                      className="hidden"
                      checked={ratingFilter === r}
                      onChange={() => setRatingFilter(r)}
                    />
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center border transition-all",
                      ratingFilter === r ? "border-[#D4AF37]" : "border-gray-500 group-hover:border-[#D4AF37]/50"
                    )}>
                      {ratingFilter === r && <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("w-3.5 h-3.5", i < r ? "text-[#D4AF37]" : "text-gray-600")} fill={i < r ? "#D4AF37" : "none"} />
                      ))}
                      <span className="ml-1">{r} Stars {r < 5 && "& up"}</span>
                    </div>
                  </label>
                ))}
                {ratingFilter > 0 && (
                  <button onClick={() => setRatingFilter(0)} className="text-xs text-gray-400 hover:text-white self-start mt-1">Any Rating</button>
                )}
              </div>
            </div>

            {/* Fee */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Consultation Fee</h4>
              <div className="flex flex-wrap gap-2">
                {FEES.map(fee => (
                  <button
                    key={fee}
                    onClick={() => toggleArray(selectedFees, fee, setSelectedFees)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      selectedFees.includes(fee)
                        ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                    )}
                  >
                    {fee}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-300">Location</h4>
              <FormSelect 
                label=""
                name="state"
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value)}
                options={states.map(s => ({ label: s, value: s }))}
                placeholder="Select State"
                className="!gap-0"
              />
            </div>

            {mobileFiltersOpen && (
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-[#D4AF37] text-[#102542] font-bold py-3 rounded-xl mt-4"
              >
                Apply Filters
              </button>
            )}

          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1 flex flex-col">
          
          <div className="hidden md:flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif">Showing {filteredLawyers.length} lawyers</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <FormSelect 
                label=""
                name="sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                options={[
                  { label: "Relevance", value: "relevance" },
                  { label: "Rating: High to Low", value: "rating_desc" },
                  { label: "Experience: High to Low", value: "exp_desc" },
                  { label: "Fee: Low to High", value: "fee_asc" },
                  { label: "Fee: High to Low", value: "fee_desc" },
                ]}
                className="w-48 !gap-0"
              />
            </div>
          </div>

          {currentLawyers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl">
              <Search className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">No lawyers found</h3>
              <p className="text-gray-400 mb-6 max-w-md">We couldn't find any lawyers matching your current filters. Try broadening your search criteria.</p>
              <button onClick={clearAll} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors font-medium">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.07 } }
                }}
              >
                {currentLawyers.map(lawyer => (
                  <motion.div 
                    key={lawyer.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="glass-card bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col"
                  >
                    <div className="flex gap-4 items-start mb-4">
                      <div className="relative shrink-0">
                        <div className={cn("w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center font-serif text-xl font-bold text-white shadow-inner", lawyer.avatarGradient, lawyer.isPremium ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#102542]" : "")}>
                          {lawyer.avatar}
                        </div>
                        {lawyer.availability !== "offline" && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#102542] rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/lawyers/${lawyer.slug}`} className="font-serif text-lg font-bold hover:text-[#D4AF37] transition-colors line-clamp-1">
                              {lawyer.name}
                            </Link>
                            <div className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mt-0.5">{lawyer.primarySpecialization}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1 font-bold text-lg leading-none">
                              <Star className="w-4 h-4 text-[#D4AF37]" fill="#D4AF37" /> {lawyer.rating}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{lawyer.reviewCount} reviews</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {lawyer.isVerified && (
                            <span className="flex items-center gap-1 text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/10">
                              <Shield className="w-3 h-3 text-[#D4AF37]" /> Verified
                            </span>
                          )}
                          {lawyer.isPremium && (
                            <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 py-4 border-y border-white/5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">{lawyer.experience} Years Exp</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="truncate">{lawyer.city}, {lawyer.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Languages className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="truncate">{lawyer.languages.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Building className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="truncate">{lawyer.officeAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Consultation Fee</div>
                        <div className="text-[#D4AF37] font-bold text-lg">₹{lawyer.consultationFee} <span className="text-xs font-normal text-gray-500">/ session</span></div>
                      </div>
                      {lawyer.isPremium && (
                        <div className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-1 rounded">
                          Free 15-min intro call
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <Link 
                        to={`/lawyers/${lawyer.slug}#book`}
                        className="flex-1 bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] text-sm font-bold py-2.5 rounded-xl text-center transition-all hover:-translate-y-0.5"
                      >
                        Book Appointment
                      </Link>
                      <Link 
                        to={`/lawyers/${lawyer.slug}`}
                        className="flex-1 bg-transparent hover:bg-white/10 text-white border border-white/30 text-sm font-semibold py-2.5 rounded-xl text-center transition-all hover:border-white/60"
                      >
                        View Profile
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 text-sm font-medium border border-white/20 rounded-lg disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border",
                        currentPage === i + 1 
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]" 
                          : "bg-transparent border-transparent hover:bg-white/5 text-gray-400"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 text-sm font-medium border border-white/20 rounded-lg disabled:opacity-50 hover:bg-white/5 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
