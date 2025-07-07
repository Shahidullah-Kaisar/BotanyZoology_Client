import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import readXlsxFile from 'read-excel-file';
import { Modal } from './components/Modal';
import bg from './assets/bg1.jpg';

interface SubjectData {
  branch: string;
  topic: string;
  subtopic: string;
  description: string;
  image?: string;
  video?: string;
}

type ScrollableElement = HTMLElement;
type ItemRefs = Record<string, ScrollableElement | null>;

function App() {
  const [expandedSubjects, setExpandedSubjects] = useState<{
    botany: boolean;
    zoology: boolean;
  }>({ botany: false, zoology: false });
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedSubtopic, setExpandedSubtopic] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>(undefined);
  const [botanyData, setBotanyData] = useState<SubjectData[]>([]);
  const [zoologyData, setZoologyData] = useState<SubjectData[]>([]);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState<number>(-1);
  const [currentSubtopicList, setCurrentSubtopicList] = useState<{subtopic: string, description: string, image?: string, video?: string}[]>([]);
  const itemRefs = useRef<ItemRefs>({});

  useEffect(() => {
    // Load Botany data
    fetch('/botany.xlsx')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => readXlsxFile(arrayBuffer, { sheet: 'Botany' }))
      .then((rows) => {
        const dataRows = rows.slice(1);
        const parsedData: SubjectData[] = dataRows.map((row) => ({
          branch: row[0]?.toString() || '',
          topic: row[1]?.toString() || '',
          subtopic: row[2]?.toString() || '',
          description: row[3]?.toString() || '',
          image: row[4]?.toString() || undefined,
          video: row[5]?.toString() || undefined,
        })).filter(item => item.branch && item.subtopic);
        setBotanyData(parsedData);
      })
      .catch(console.error);

    // Load Zoology data
    fetch('/botany.xlsx')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => readXlsxFile(arrayBuffer, { sheet: 'Zoology' }))
      .then((rows) => {
        const dataRows = rows.slice(1);
        const parsedData: SubjectData[] = dataRows.map((row) => ({
          branch: row[0]?.toString() || '',
          topic: row[1]?.toString() || '',
          subtopic: row[2]?.toString() || '',
          description: row[3]?.toString() || '',
          image: row[4]?.toString() || undefined,
          video: row[5]?.toString() || undefined,
        })).filter(item => item.branch && item.subtopic);
        setZoologyData(parsedData);
      })
      .catch(console.error);
  }, []);

  const scrollToItem = (id: string) => {
    setTimeout(() => {
      const element = itemRefs.current[id];
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleSubjectClick = (subject: 'botany' | 'zoology') => {
    setExpandedSubjects(prev => ({
      botany: subject === 'botany' ? !prev.botany : false,
      zoology: subject === 'zoology' ? !prev.zoology : false,
    }));
    setExpandedBranch(null);
    setExpandedTopic(null);
    setExpandedSubtopic(null);
  };

  const handleBranchClick = (branch: string) => {
    setExpandedBranch(expandedBranch === branch ? null : branch);
    setExpandedTopic(null);
    setExpandedSubtopic(null);
    scrollToItem(`branch-${branch}`);
  };

  const handleTopicClick = (topic: string) => {
    setExpandedTopic(expandedTopic === topic ? null : topic);
    setExpandedSubtopic(null);
    scrollToItem(`topic-${topic}`);
  };

  const handleSubtopicClick = (subtopic: string, description: string, branch: string, topic?: string) => {
    setExpandedSubtopic(expandedSubtopic === subtopic ? null : subtopic);
    setSelectedDescription(description);
    
    const currentData = expandedSubjects.botany ? botanyData : zoologyData;
    const subtopics = topic
      ? currentData.filter(item => item.branch === branch && item.topic === topic)
                   .map(item => ({ 
                     subtopic: item.subtopic, 
                     description: item.description,
                     image: item.image,
                     video: item.video
                   }))
      : currentData.filter(item => item.branch === branch && !item.topic)
                   .map(item => ({ 
                     subtopic: item.subtopic, 
                     description: item.description,
                     image: item.image,
                     video: item.video
                   }));
    
    setCurrentSubtopicList(subtopics);
    const foundIndex = subtopics.findIndex(item => item.subtopic === subtopic);
    setCurrentSubtopicIndex(foundIndex);
    setSelectedImage(subtopics[foundIndex]?.image);
    setSelectedVideo(subtopics[foundIndex]?.video);
  };

  const handlePreviousTopic = () => {
    if (currentSubtopicIndex > 0) {
      const prevSubtopic = currentSubtopicList[currentSubtopicIndex - 1];
      setCurrentSubtopicIndex(prev => prev - 1);
      setExpandedSubtopic(prevSubtopic.subtopic);
      setSelectedDescription(prevSubtopic.description);
      setSelectedImage(prevSubtopic.image);
      setSelectedVideo(prevSubtopic.video);
    }
  };

  const handleNextTopic = () => {
    if (currentSubtopicIndex < currentSubtopicList.length - 1) {
      const nextSubtopic = currentSubtopicList[currentSubtopicIndex + 1];
      setCurrentSubtopicIndex(prev => prev + 1);
      setExpandedSubtopic(nextSubtopic.subtopic);
      setSelectedDescription(nextSubtopic.description);
      setSelectedImage(nextSubtopic.image);
      setSelectedVideo(nextSubtopic.video);
    } else {
      setCurrentSubtopicIndex(-1);
      setSelectedDescription(null);
      setSelectedImage(undefined);
      setSelectedVideo(undefined);
    }
  };

  const getBranches = (data: SubjectData[]) => [...new Set(data.map(item => item.branch))];
  const getTopics = (data: SubjectData[], branch: string) => 
    [...new Set(data.filter(item => item.branch === branch && item.topic).map(item => item.topic))];
  const hasDirectSubtopics = (data: SubjectData[], branch: string) => 
    data.some(item => item.branch === branch && !item.topic);
  const getDirectSubtopics = (data: SubjectData[], branch: string) => 
    data.filter(item => item.branch === branch && !item.topic)
        .map(item => ({ 
          subtopic: item.subtopic, 
          description: item.description,
          image: item.image
        }));

  const setItemRef = (id: string) => (el: ScrollableElement | null) => {
    if (el) itemRefs.current[id] = el;
    else delete itemRefs.current[id];
  };

  const renderSubjectContent = (data: SubjectData[]) => {
    return getBranches(data).map((branch) => (
      <div key={branch} id={`branch-${branch}`} ref={setItemRef(`branch-${branch}`)}>
        <button
          onClick={() => handleBranchClick(branch)}
          className="sub-glow w-full p-4 flex items-center justify-between rounded-lg transition-all duration-200"
        >
          <span className="text-xl font-semibold text-white">{branch}</span>
          {expandedBranch === branch ? <ChevronDown className="text-white" /> : <ChevronRight className="text-white" />}
        </button>

        {expandedBranch === branch && (
          <div className="px-4 pb-4 space-y-2 animate-fade-in mt-2">
            {getTopics(data, branch).length > 0 ? (
              getTopics(data, branch).map((topic) => (
                <div key={topic} id={`topic-${topic}`} ref={setItemRef(`topic-${topic}`)} className="ml-4">
                  <button
                    onClick={() => handleTopicClick(topic)}
                    className="btn1 sub-glow chapter-glow w-full p-3 flex items-center justify-between text-sm rounded-lg transition-all duration-200"
                  >
                    <span className="text-lg font-semibold text-white">{topic}</span>
                    {expandedTopic === topic ? (
                      <ChevronDown className="text-white" size={18} />
                    ) : (
                      <ChevronRight className="text-white" size={18} />
                    )}
                  </button>

                  {expandedTopic === topic && (
                    <div className="ml-4 mt-2 space-y-2">
                      {data.filter(item => item.branch === branch && item.topic === topic)
                        .map((item) => (
                          <button
                            key={item.subtopic}
                            onClick={() => handleSubtopicClick(item.subtopic, item.description, branch, topic)}
                            className="topic-glow bdr w-full p-2 text-left text-sm font-semibold rounded-lg transition-all duration-200"
                          >
                            <span className="text-white">{item.subtopic}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))
            ) : hasDirectSubtopics(data, branch) ? (
              <div className="ml-4 mt-2 space-y-2">
                {getDirectSubtopics(data, branch).map((item) => (
                  <button
                    key={item.subtopic}
                    onClick={() => handleSubtopicClick(item.subtopic, item.description, branch)}
                    className="bdr topic-glow w-full p-2 text-left font-semibold text-sm rounded-lg transition-all duration-200"
                  >
                    <span className="text-white">{item.subtopic}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-[#161616] p-4 md:p-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-4xl mx-auto mt-7">
        {/* Botany Button */}
        <div className="mb-4">
          <button
            onClick={() => handleSubjectClick('botany')}
            className={`btn btn-glow w-full rounded-lg p-4 flex items-center justify-between transition-all duration-200 group ${expandedSubjects.botany ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-white">বোটানি</span>
            </div>
            {expandedSubjects.botany ? <ChevronDown className="text-white" /> : <ChevronRight className="text-white" />}
          </button>
          
          {expandedSubjects.botany && (
            <div className="space-y-4 animate-fade-in mt-4">
              {renderSubjectContent(botanyData)}
            </div>
          )}
        </div>

        {/* Zoology Button */}
        <div className="mb-6">
          <button
            onClick={() => handleSubjectClick('zoology')}
            className={`btn btn-glow w-full rounded-lg p-4 flex items-center justify-between transition-all duration-200 group ${expandedSubjects.zoology ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-white group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-white">জুলজি</span>
            </div>
            {expandedSubjects.zoology ? <ChevronDown className="text-white" /> : <ChevronRight className="text-white" />}
          </button>
          
          {expandedSubjects.zoology && (
            <div className="space-y-4 animate-fade-in mt-4">
              {renderSubjectContent(zoologyData)}
            </div>
          )}
        </div>

        {/* Description Modal */}
        <Modal
          isOpen={selectedDescription !== null}
          onClose={() => {
            setSelectedDescription(null);
            setCurrentSubtopicIndex(-1);
            setSelectedImage(undefined);
            setSelectedVideo(undefined);
          }}
          title={expandedSubtopic || ''}
          description={selectedDescription || ''}
          onPreviousTopic={handlePreviousTopic}
          onNextTopic={handleNextTopic}
          showPreviousButton={currentSubtopicIndex > 0}
          showNextButton={currentSubtopicIndex < currentSubtopicList.length - 1}
          image={selectedImage}
          video={selectedVideo}
        />
      </div>
    </div>
  );
}

export default App;