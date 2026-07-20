import { useState, useRef } from 'react';
import {
  Calendar, Upload, Zap, CheckCircle, AlertCircle, Download,
  RotateCcw, BarChart3, Users, Home, Cpu,
} from 'lucide-react';
import { PortalCard, PortalPageHeader, PortalButton } from '../../components/portal-ui';

type DatasetFile = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
};

type TimeSlot = {
  id: string;
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
};

type Constraint = {
  id: string;
  type: 'conflict' | 'availability' | 'room';
  severity: 'high' | 'medium' | 'low';
  description: string;
  resolved: boolean;
};

type Statistics = {
  totalClasses: number;
  teachers: number;
  rooms: number;
  optimizationScore: number;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SAMPLE_TIMETABLE: TimeSlot[] = [
  {
    id: '1',
    time: '09:00 - 10:00',
    monday: 'Data Structures (Dr. Ahmed) - Lab A',
    tuesday: 'Web Development (Ms. Fatima) - Room 101',
    wednesday: 'Database (Dr. Ali) - Lab B',
    thursday: 'OOP (Prof. Hassan) - Room 102',
    friday: 'Cloud Computing (Ms. Sara) - Lab C',
    saturday: 'Algorithms (Dr. Omar) - Room 103',
  },
  {
    id: '2',
    time: '10:15 - 11:15',
    monday: 'Web Development (Ms. Fatima) - Room 101',
    tuesday: 'Algorithms (Dr. Omar) - Room 103',
    wednesday: 'OOP (Prof. Hassan) - Lab A',
    thursday: 'Data Structures (Dr. Ahmed) - Room 102',
    friday: 'Database (Dr. Ali) - Lab B',
    saturday: 'Cloud Computing (Ms. Sara) - Room 101',
  },
  {
    id: '3',
    time: '11:30 - 12:30',
    monday: 'Database (Dr. Ali) - Lab B',
    tuesday: 'OOP (Prof. Hassan) - Room 102',
    wednesday: 'Cloud Computing (Ms. Sara) - Lab C',
    thursday: 'Web Development (Ms. Fatima) - Room 103',
    friday: 'Algorithms (Dr. Omar) - Lab A',
    saturday: 'Data Structures (Dr. Ahmed) - Room 101',
  },
  {
    id: '4',
    time: '13:30 - 14:30',
    monday: 'Cloud Computing (Ms. Sara) - Lab C',
    tuesday: 'Data Structures (Dr. Ahmed) - Lab A',
    wednesday: 'Web Development (Ms. Fatima) - Room 101',
    thursday: 'Database (Dr. Ali) - Lab B',
    friday: 'OOP (Prof. Hassan) - Room 102',
    saturday: 'Algorithms (Dr. Omar) - Room 103',
  },
  {
    id: '5',
    time: '14:45 - 15:45',
    monday: 'OOP (Prof. Hassan) - Room 102',
    tuesday: 'Cloud Computing (Ms. Sara) - Lab C',
    wednesday: 'Algorithms (Dr. Omar) - Room 103',
    thursday: 'Data Structures (Dr. Ahmed) - Lab A',
    friday: 'Web Development (Ms. Fatima) - Room 101',
    saturday: 'Database (Dr. Ali) - Lab B',
  },
];

const SAMPLE_CONSTRAINTS: Constraint[] = [
  { id: '1', type: 'conflict', severity: 'high', description: 'Dr. Ahmed cannot teach two classes simultaneously', resolved: true },
  { id: '2', type: 'availability', severity: 'medium', description: 'Ms. Fatima unavailable on Saturday mornings', resolved: true },
  { id: '3', type: 'room', severity: 'high', description: 'Lab A cannot host more than 40 students', resolved: true },
  { id: '4', type: 'conflict', severity: 'low', description: 'Data Structures and Algorithms should not overlap', resolved: true },
];

const SAMPLE_STATS: Statistics = {
  totalClasses: 24,
  teachers: 6,
  rooms: 5,
  optimizationScore: 94,
};

export default function AiTimetableGeneratorPage() {
  const [teacherFiles, setTeacherFiles] = useState<DatasetFile[]>([]);
  const [roomFiles, setRoomFiles] = useState<DatasetFile[]>([]);
  const [curriculumFiles, setCurriculumFiles] = useState<DatasetFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showTimetable, setShowTimetable] = useState(false);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const teacherFileRef = useRef<HTMLInputElement>(null);
  const roomFileRef = useRef<HTMLInputElement>(null);
  const curriculumFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'teacher' | 'room' | 'curriculum') => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newFile: DatasetFile = {
        id: `${fileType}-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toLocaleString(),
      };

      if (fileType === 'teacher') {
        setTeacherFiles([...teacherFiles, newFile]);
      } else if (fileType === 'room') {
        setRoomFiles([...roomFiles, newFile]);
      } else {
        setCurriculumFiles([...curriculumFiles, newFile]);
      }
    });
  };

  const handleRemoveFile = (fileId: string, fileType: 'teacher' | 'room' | 'curriculum') => {
    if (fileType === 'teacher') {
      setTeacherFiles(teacherFiles.filter((f) => f.id !== fileId));
    } else if (fileType === 'room') {
      setRoomFiles(roomFiles.filter((f) => f.id !== fileId));
    } else {
      setCurriculumFiles(curriculumFiles.filter((f) => f.id !== fileId));
    }
  };

  const handleGenerateTimetable = () => {
    if (teacherFiles.length === 0 || roomFiles.length === 0 || curriculumFiles.length === 0) {
      alert('Please upload all required datasets (Teachers, Rooms, and Curriculum)');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setShowTimetable(true);
          setConstraints(SAMPLE_CONSTRAINTS);
          setStatistics(SAMPLE_STATS);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 400);
  };

  const handleRegenerate = () => {
    setShowTimetable(false);
    setGenerationProgress(0);
    setConstraints([]);
    setStatistics(null);
    handleGenerateTimetable();
  };

  const handleDownloadPDF = () => {
    alert('PDF download feature - Integration ready');
  };

  const handleDownloadExcel = () => {
    alert('Excel download feature - Integration ready');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PortalPageHeader
        title="AI Timetable Generator"
        subtitle="Intelligent scheduling using constraint satisfaction algorithms"
        icon={Calendar}
      />

      {/* Dataset Upload Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Teacher Dataset */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <h3 className="font-bold text-ink-900">Teacher Dataset</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">
            Upload teacher availability and course assignments (CSV/JSON)
          </p>
          <button
            onClick={() => teacherFileRef.current?.click()}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 font-medium text-sm transition-colors mb-4"
          >
            <Upload size={18} className="mx-auto mb-2" />
            Choose File
          </button>
          <input
            ref={teacherFileRef}
            type="file"
            multiple
            accept=".csv,.json"
            onChange={(e) => handleFileUpload(e, 'teacher')}
            className="hidden"
          />
          <div className="space-y-2">
            {teacherFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{file.name}</p>
                  <p className="text-xs text-ink-500">{file.uploadedAt}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id, 'teacher')}
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </PortalCard>

        {/* Room Dataset */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Home className="text-purple-600" size={20} />
            </div>
            <h3 className="font-bold text-ink-900">Room Dataset</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">
            Upload room capacity, type, and features (CSV/JSON)
          </p>
          <button
            onClick={() => roomFileRef.current?.click()}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-400 text-purple-600 font-medium text-sm transition-colors mb-4"
          >
            <Upload size={18} className="mx-auto mb-2" />
            Choose File
          </button>
          <input
            ref={roomFileRef}
            type="file"
            multiple
            accept=".csv,.json"
            onChange={(e) => handleFileUpload(e, 'room')}
            className="hidden"
          />
          <div className="space-y-2">
            {roomFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{file.name}</p>
                  <p className="text-xs text-ink-500">{file.uploadedAt}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id, 'room')}
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </PortalCard>

        {/* Curriculum Dataset */}
        <PortalCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Cpu className="text-green-600" size={20} />
            </div>
            <h3 className="font-bold text-ink-900">Curriculum Dataset</h3>
          </div>
          <p className="text-sm text-ink-500 mb-4">
            Upload courses, prerequisites, and requirements (CSV/JSON)
          </p>
          <button
            onClick={() => curriculumFileRef.current?.click()}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-green-200 hover:border-green-400 text-green-600 font-medium text-sm transition-colors mb-4"
          >
            <Upload size={18} className="mx-auto mb-2" />
            Choose File
          </button>
          <input
            ref={curriculumFileRef}
            type="file"
            multiple
            accept=".csv,.json"
            onChange={(e) => handleFileUpload(e, 'curriculum')}
            className="hidden"
          />
          <div className="space-y-2">
            {curriculumFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{file.name}</p>
                  <p className="text-xs text-ink-500">{file.uploadedAt}</p>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id, 'curriculum')}
                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>

      {/* Generation Section */}
      <PortalCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-1">Generate Timetable</h3>
            <p className="text-sm text-ink-500">
              AI will optimize scheduling based on constraints and availability
            </p>
          </div>
          <button
            onClick={handleGenerateTimetable}
            disabled={isGenerating || teacherFiles.length === 0 || roomFiles.length === 0 || curriculumFiles.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Zap size={18} />
            {isGenerating ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-6 pt-6 border-t border-ink-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-ink-900">Generation Progress</span>
              <span className="text-sm text-ink-500">{Math.floor(generationProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-ink-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6 text-center">
              <div className={`p-3 rounded-lg ${generationProgress >= 25 ? 'bg-green-50' : 'bg-ink-50'}`}>
                <p className="text-xs text-ink-500">Parsing Data</p>
                {generationProgress >= 25 && <CheckCircle className="text-green-500 mx-auto mt-1" size={16} />}
              </div>
              <div className={`p-3 rounded-lg ${generationProgress >= 50 ? 'bg-green-50' : 'bg-ink-50'}`}>
                <p className="text-xs text-ink-500">Validating</p>
                {generationProgress >= 50 && <CheckCircle className="text-green-500 mx-auto mt-1" size={16} />}
              </div>
              <div className={`p-3 rounded-lg ${generationProgress >= 75 ? 'bg-green-50' : 'bg-ink-50'}`}>
                <p className="text-xs text-ink-500">Optimizing</p>
                {generationProgress >= 75 && <CheckCircle className="text-green-500 mx-auto mt-1" size={16} />}
              </div>
              <div className={`p-3 rounded-lg ${generationProgress >= 100 ? 'bg-green-50' : 'bg-ink-50'}`}>
                <p className="text-xs text-ink-500">Finalizing</p>
                {generationProgress >= 100 && <CheckCircle className="text-green-500 mx-auto mt-1" size={16} />}
              </div>
            </div>
          </div>
        )}
      </PortalCard>

      {/* Constraint Validation */}
      {showTimetable && constraints.length > 0 && (
        <PortalCard className="p-6">
          <h3 className="text-lg font-bold text-ink-900 mb-4">Constraint Validation</h3>
          <div className="space-y-3">
            {constraints.map((constraint) => (
              <div
                key={constraint.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  constraint.resolved
                    ? 'bg-green-50 border-green-200'
                    : constraint.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : constraint.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                {constraint.resolved ? (
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertCircle className={`${
                    constraint.severity === 'high' ? 'text-red-600' :
                    constraint.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  } flex-shrink-0 mt-0.5`} size={20} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-ink-900">
                      {constraint.type === 'conflict' ? 'Teacher Conflict' :
                       constraint.type === 'availability' ? 'Availability Issue' :
                       'Room Requirement'}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      constraint.resolved ? 'bg-green-200 text-green-800' :
                      constraint.severity === 'high' ? 'bg-red-200 text-red-800' :
                      constraint.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {constraint.resolved ? 'Resolved' : constraint.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-700">{constraint.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Generated Timetable */}
      {showTimetable && (
        <>
          <PortalCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-ink-900">Generated Weekly Timetable</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-900 font-medium text-sm transition-colors"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-900 font-medium text-sm transition-colors"
                >
                  <Download size={16} />
                  Excel
                </button>
              </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <th className="px-4 py-3 text-left text-sm font-bold text-ink-900 w-24">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="px-4 py-3 text-left text-sm font-bold text-ink-900">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_TIMETABLE.map((slot) => (
                    <tr key={slot.id} className="border-b border-ink-100 hover:bg-ink-50">
                      <td className="px-4 py-4 text-sm font-bold text-ink-900 bg-ink-50 w-24">
                        {slot.time}
                      </td>
                      {DAYS.map((day) => {
                        const dayKey = day.toLowerCase() as keyof TimeSlot;
                        return (
                          <td key={day} className="px-4 py-4">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
                              <p className="text-xs font-bold text-cyan-900">
                                {String(slot[dayKey]).split(' - ')[0]}
                              </p>
                              <p className="text-[10px] text-cyan-700 mt-1">
                                {String(slot[dayKey]).split(' - ')[1]}
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Regenerate Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-900 font-medium transition-colors"
              >
                <RotateCcw size={18} />
                Regenerate Timetable
              </button>
            </div>
          </PortalCard>

          {/* Statistics */}
          {statistics && (
            <PortalCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-ink-900">Optimization Statistics</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-2">Total Classes</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalClasses}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium mb-2">Teachers</p>
                  <p className="text-2xl font-bold text-purple-900">{statistics.teachers}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-2">Rooms</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.rooms}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
                  <p className="text-xs text-cyan-600 font-medium mb-2">Optimization Score</p>
                  <p className="text-2xl font-bold text-cyan-900">{statistics.optimizationScore}%</p>
                </div>
              </div>
            </PortalCard>
          )}
        </>
      )}
    </div>
  );
}

