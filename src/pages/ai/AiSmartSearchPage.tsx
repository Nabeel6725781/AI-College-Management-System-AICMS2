import { useState, useRef, useEffect } from 'react';
import {
  Search, Sparkles, Users, GraduationCap, FileText, BarChart3,
  Clock, TrendingUp, Brain, Zap, Filter, ChevronRight, Hash,
} from 'lucide-react';
import {
  PortalCard, PortalPageHeader, PortalButton, Badge, EmptyState,
} from '../../components/portal-ui';

type SearchResult = {
  id: string;
  type: 'student' | 'course' | 'document' | 'report' | 'faculty';
  title: string;
  snippet: string;
  relevance: number;
  meta: string;
};

const TYPE_FILTERS = [
  { value: 'all', label: 'All Types' },
  { value: 'student', label: 'Students' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'course', label: 'Courses' },
  { value: 'document', label: 'Documents' },
  { value: 'report', label: 'Reports' },
];

const DEPARTMENTS = [
  { value: 'all', label: 'All Departments' },
  { value: 'cs', label: 'Computer Science' },
  { value: 'bus', label: 'Business' },
  { value: 'eng', label: 'Engineering' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'sci', label: 'Science' },
];

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'quarter', label: 'Past Quarter' },
  { value: 'year', label: 'Past Year' },
];

const SAMPLE_RESULTS: SearchResult[] = [
  // Students
  { id: 'r1', type: 'student', title: 'Ahmed Hassan — Grade 10-A', snippet: 'Enrolled in Computer Science program. Current GPA 3.8. Attendance rate 94%. Active in Robotics Club and Debate Team.', relevance: 96, meta: 'Student ID: STU-2025-0142 · CS Department' },
  { id: 'r2', type: 'student', title: 'Ahmed Raza — Grade 11-B', snippet: 'Transfer student from Cambridge Institute. Enrolled in Engineering. GPA 3.5. Member of the Science Olympiad team.', relevance: 89, meta: 'Student ID: STU-2025-0089 · Engineering' },
  { id: 'r3', type: 'student', title: 'Sara Ahmed — Grade 9-A', snippet: 'Top performer in Business department. GPA 3.9. Winner of the Regional Business Plan Competition 2025.', relevance: 84, meta: 'Student ID: STU-2025-0312 · Business' },
  { id: 'r4', type: 'student', title: 'Bilal Ahmed — Grade 12-C', snippet: 'At-risk student flagged by AI: declining attendance (72%) and 4 missed assignments. Intervention recommended.', relevance: 78, meta: 'Student ID: STU-2024-0567 · Arts' },
  // Faculty
  { id: 'r5', type: 'faculty', title: 'Dr. Ahmed Siddiqui — Professor', snippet: 'Department Head, Computer Science. Teaches Advanced Algorithms and Data Structures. 12 years at Meridian.', relevance: 91, meta: 'Faculty ID: FAC-2013-003 · CS Department' },
  { id: 'r6', type: 'faculty', title: 'Prof. Sara Malik — Associate Professor', snippet: 'Business Department. Teaches Financial Accounting and Strategic Management. Published 15 research papers.', relevance: 82, meta: 'Faculty ID: FAC-2018-021 · Business' },
  // Courses
  { id: 'r7', type: 'course', title: 'Advanced Computer Science — CS401', snippet: 'Fourth-year course covering algorithms, data structures, and computational complexity. Prerequisites: CS301, CS302.', relevance: 93, meta: '4 Credits · 42 Students Enrolled · CS Dept' },
  { id: 'r8', type: 'course', title: 'Business Analytics — BUS320', snippet: 'Data-driven decision making for business. Covers predictive modeling, forecasting, and KPI dashboards.', relevance: 87, meta: '3 Credits · 38 Students Enrolled · Business' },
  { id: 'r9', type: 'course', title: 'Engineering Mathematics — ENG210', snippet: 'Calculus, linear algebra, and differential equations for engineering students. Lab component included.', relevance: 75, meta: '4 Credits · 51 Students Enrolled · Engineering' },
  // Documents
  { id: 'r10', type: 'document', title: 'Enrollment Report Q4 2025.pdf', snippet: 'Quarterly enrollment analysis showing 8% growth. Department-wise breakdown, demographic trends, and projections for next semester.', relevance: 94, meta: 'PDF · 24 pages · Generated Nov 1, 2025' },
  { id: 'r11', type: 'document', title: 'Student Handbook 2025-2026.pdf', snippet: 'Comprehensive guide covering academic policies, attendance requirements, grading system, and code of conduct for all students.', relevance: 72, meta: 'PDF · 86 pages · Updated Aug 2025' },
  { id: 'r12', type: 'document', title: 'Financial Aid Policy.docx', snippet: 'Scholarship and financial aid guidelines. Eligibility criteria, application process, and disbursement schedules.', relevance: 68, meta: 'DOCX · 12 pages · Updated Sep 2025' },
  // Reports
  { id: 'r13', type: 'report', title: 'Academic Performance Report — Fall 2025', snippet: 'AI-generated report analyzing student performance across all departments. Includes GPA trends, pass rates, and at-risk indicators.', relevance: 88, meta: 'AI Report · 18 insights · Generated Oct 28' },
  { id: 'r14', type: 'report', title: 'Attendance Analytics — November 2025', snippet: 'Monthly attendance analysis with day-of-week patterns, department comparisons, and predictive forecasts for December.', relevance: 81, meta: 'AI Report · 12 insights · Generated Nov 5' },
];

const SEARCH_HISTORY = [
  'enrollment trends fall 2025',
  'at-risk students engineering',
  'revenue report Q3',
  'Dr. Ahmed Siddiqui courses',
  'attendance patterns Friday',
];

const TRENDING_SEARCHES = [
  'enrollment forecast',
  'at-risk students',
  'revenue insights',
  'attendance trends',
  'top performers',
  'fee defaulters',
  'faculty workload',
  'course popularity',
];

function highlightTerms(text: string, query: string) {
  if (!query.trim()) return text;
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return text;
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'));
  return parts.map((part, i) => {
    if (terms.some((t) => part.toLowerCase() === t.toLowerCase())) {
      return (
        <mark key={i} className="bg-cyan-100 text-cyan-900 rounded px-0.5 font-medium">
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Users; color: string }> = {
  student: { label: 'Student', icon: Users, color: 'bg-cyan-100 text-cyan-700' },
  faculty: { label: 'Faculty', icon: GraduationCap, color: 'bg-teal-100 text-teal-700' },
  course: { label: 'Course', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  document: { label: 'Document', icon: FileText, color: 'bg-amber-100 text-amber-700' },
  report: { label: 'Report', icon: BarChart3, color: 'bg-ink-100 text-ink-700' },
};

export default function AiSmartSearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [relatedSuggestions, setRelatedSuggestions] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setQuery(q);
    setSearching(true);
    setHasSearched(false);
    setResults([]);

    const t = setTimeout(() => {
      // Filter results based on query and filters
      const lower = q.toLowerCase();
      let filtered = SAMPLE_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(lower) ||
          r.snippet.toLowerCase().includes(lower) ||
          r.meta.toLowerCase().includes(lower)
      );

      if (typeFilter !== 'all') {
        filtered = filtered.filter((r) => r.type === typeFilter);
      }

      // If no matches, show all (simulating fuzzy matching)
      if (filtered.length === 0) {
        filtered = SAMPLE_RESULTS.filter(
          (r) => typeFilter === 'all' || r.type === typeFilter
        ).slice(0, 6);
      }

      // Sort by relevance
      filtered.sort((a, b) => b.relevance - a.relevance);
      setResults(filtered);

      // Generate AI insight
      setAiInsight(
        `I understood you're looking for "${q}". I searched across students, faculty, courses, documents, and reports using semantic matching. I found ${filtered.length} relevant results, with the top match at ${filtered[0]?.relevance || 0}% relevance. The results are grouped by type for easier navigation.`
      );
      setRelatedSuggestions([
        `${q} statistics`,
        `${q} trends 2025`,
        `top performers in ${q}`,
        `${q} department breakdown`,
      ]);

      setSearching(false);
      setHasSearched(true);
    }, 1200);
    timersRef.current.push(t);
  };

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const typeOrder = ['student', 'faculty', 'course', 'document', 'report'];

  return (
    <div className="animate-fade-in">
      <PortalPageHeader
        title="Smart Search"
        subtitle="AI-powered semantic search across all institutional records"
        icon={Search}
        action={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200">
            <Sparkles size={14} className="text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">Semantic AI</span>
          </div>
        }
      />

      {/* Search Bar */}
      <PortalCard className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <Brain className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search anything... students, courses, documents, reports..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-ink-200 bg-ink-50 text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>
          <PortalButton onClick={() => handleSearch()} disabled={searching || !query.trim()} className="flex-shrink-0">
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} /> Search
              </>
            )}
          </PortalButton>
        </div>

        {/* Search Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-ink-400 flex-shrink-0" />
          <span className="text-xs font-medium text-ink-500 flex-shrink-0">Filters:</span>
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="flex-1 min-w-[140px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {TYPE_FILTERS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {DATE_RANGES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-ink-900 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {DEPARTMENTS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="flex items-center gap-2 flex-wrap">
          <TrendingUp size={14} className="text-cyan-500 flex-shrink-0" />
          <span className="text-xs font-medium text-ink-500">Trending:</span>
          {TRENDING_SEARCHES.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s); }}
              className="text-xs px-3 py-1 rounded-full bg-ink-50 hover:bg-cyan-50 hover:text-cyan-700 text-ink-600 border border-ink-100 hover:border-cyan-200 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </PortalCard>

      {/* Searching state */}
      {searching && (
        <PortalCard className="p-6 mb-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4">
              <Brain className="text-white animate-pulse" size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink-900 mb-1">AI is analyzing your query...</h3>
            <p className="text-xs text-ink-500">Applying semantic matching and fuzzy search across all records</p>
            <div className="flex gap-1.5 mt-4">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </PortalCard>
      )}

      {/* Search Results */}
      {hasSearched && !searching && (
        <>
          {/* AI Search Insights */}
          <PortalCard className="p-6 mb-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-ink-900">AI Search Insights</h3>
                  <Badge variant="info">Semantic Analysis</Badge>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-3">{aiInsight}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-ink-500">Related searches:</span>
                  {relatedSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setQuery(s); handleSearch(s); }}
                      className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PortalCard>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-900">
              AI Search Results <span className="text-ink-500 font-normal text-sm">({results.length} matches)</span>
            </h3>
            <Badge variant="success">Sorted by relevance</Badge>
          </div>

          {results.length === 0 ? (
            <PortalCard className="p-6">
              <EmptyState
                icon={Search}
                title="No Results Found"
                message="Try adjusting your search terms or filters. The AI search supports fuzzy matching and semantic queries."
              />
            </PortalCard>
          ) : (
            /* Results grouped by type */
            <div className="space-y-6">
              {typeOrder.map((type) => {
                const items = grouped[type];
                if (!items || items.length === 0) return null;
                const config = TYPE_CONFIG[type];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                        <config.icon size={16} />
                      </div>
                      <h4 className="text-sm font-bold text-ink-900">
                        {config.label}s Matching
                      </h4>
                      <Badge variant="default">{items.length}</Badge>
                    </div>
                    <div className="grid gap-3">
                      {items.map((r) => (
                        <PortalCard key={r.id} className="p-4 hover:border-cyan-200 transition-all duration-200 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                              <config.icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h5 className="text-sm font-bold text-ink-900">{r.title}</h5>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center gap-1">
                                    <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-600"
                                        style={{ width: `${r.relevance}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-cyan-600">{r.relevance}%</span>
                                  </div>
                                  <ChevronRight size={16} className="text-ink-300" />
                                </div>
                              </div>
                              <p className="text-sm text-ink-600 leading-relaxed mb-2">
                                {highlightTerms(r.snippet, query)}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="default">{config.label}</Badge>
                                <span className="text-xs text-ink-400">{r.meta}</span>
                              </div>
                            </div>
                          </div>
                        </PortalCard>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Search History & Capabilities */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Search History */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-ink-500" />
            <h3 className="text-sm font-bold text-ink-900">Search History</h3>
          </div>
          <div className="space-y-2">
            {SEARCH_HISTORY.map((h, i) => (
              <button
                key={i}
                onClick={() => { setQuery(h); handleSearch(h); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-all text-left group"
              >
                <Clock size={14} className="text-ink-400 flex-shrink-0" />
                <span className="text-sm text-ink-600 group-hover:text-ink-900 flex-1 truncate">{h}</span>
                <ChevronRight size={14} className="text-ink-300 group-hover:text-cyan-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </PortalCard>

        {/* AI Search Capabilities */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-cyan-500" />
            <h3 className="text-sm font-bold text-ink-900">AI Search Capabilities</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50 border border-cyan-100">
              <Brain size={18} className="text-cyan-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-ink-900">Semantic Search</div>
                <div className="text-xs text-ink-500 mt-0.5">Understands meaning, not just keywords. Finds results even when exact terms don't match.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-50 border border-teal-100">
              <Search size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-ink-900">Fuzzy Matching</div>
                <div className="text-xs text-ink-500 mt-0.5">Handles typos, partial matches, and variations in search queries automatically.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-ink-50 border border-ink-100">
              <Hash size={18} className="text-ink-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-ink-900">Auto-Categorization</div>
                <div className="text-xs text-ink-500 mt-0.5">Automatically groups results by type and ranks them by relevance score.</div>
              </div>
            </div>
          </div>
        </PortalCard>
      </div>
    </div>
  );
}
