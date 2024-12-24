import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { AstronomicalObject, generateTags } from '@/utils/astronomyUtils';
import { DataProcessor, ProcessedData } from '@/utils/dataProcessing';

interface AstronomicalListProps {
  objects: AstronomicalObject[];
  onObjectSelect?: (object: AstronomicalObject) => void;
  onObjectUpdate?: (object: AstronomicalObject) => void;
  onObjectDelete?: (object: AstronomicalObject) => void;
}

const AstronomicalList: React.FC<AstronomicalListProps> = ({
  objects,
  onObjectSelect,
  onObjectUpdate,
  onObjectDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<AstronomicalObject[]>(objects);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [editObject, setEditObject] = useState<AstronomicalObject | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    const processor = new DataProcessor(objects);
    setProcessedData(processor.getProcessedData());
  }, [objects]);

  useEffect(() => {
    filterObjects();
  }, [searchTerm, selectedTags, objects]);

  const filterObjects = () => {
    let filtered = objects;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(searchLower) ||
        obj.description.toLowerCase().includes(searchLower) ||
        obj.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(obj =>
        selectedTags.every(tag => obj.tags.includes(tag))
      );
    }

    setFilteredObjects(filtered);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEdit = (object: AstronomicalObject) => {
    setEditObject(object);
    setShowEditDialog(true);
  };

  const handleSave = () => {
    if (editObject && onObjectUpdate) {
      // Auto-generate new tags based on updated properties
      const updatedObject = {
        ...editObject,
        tags: generateTags(editObject),
        lastUpdated: new Date().toISOString(),
      };
      onObjectUpdate(updatedObject);
      setShowEditDialog(false);
      setEditObject(null);
    }
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    objects.forEach(obj => obj.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search objects..."
          className="p-2 border border-gray-400 rounded-lg"
        />
        <div className="flex flex-wrap space-x-2">
          {getAllTags().map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-2 py-1 border border-gray-400 rounded-lg ${selectedTags.includes(tag) ? 'bg-blue-400 text-white' : 'bg-white text-gray-600'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {filteredObjects.map((object, index) => (
        <motion.div
          key={object.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4"
        >
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-semibold text-blue-400">{object.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Type:</span>
              <span className="text-sm text-blue-400 capitalize">{object.type}</span>
            </div>
            <p className="text-gray-300">{object.description}</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(object);
                }}
                className="px-2 py-1 border border-gray-400 rounded-lg bg-white text-gray-600"
              >
                Edit
              </button>
              {onObjectDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onObjectDelete(object);
                  }}
                  className="px-2 py-1 border border-gray-400 rounded-lg bg-white text-gray-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {showEditDialog && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-1/2">
            <h2 className="text-lg font-semibold text-blue-400">Edit Object</h2>
            {editObject && (
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={editObject.name}
                  onChange={(e) => setEditObject({ ...editObject, name: e.target.value })}
                  placeholder="Name"
                  className="p-2 border border-gray-400 rounded-lg"
                />
                <textarea
                  value={editObject.description}
                  onChange={(e) => setEditObject({ ...editObject, description: e.target.value })}
                  placeholder="Description"
                  className="p-2 border border-gray-400 rounded-lg"
                />
                <input
                  type="text"
                  value={editObject.type}
                  onChange={(e) => setEditObject({ ...editObject, type: e.target.value })}
                  placeholder="Type"
                  className="p-2 border border-gray-400 rounded-lg"
                />
                <input
                  type="text"
                  value={editObject.ra}
                  onChange={(e) => setEditObject({ ...editObject, ra: e.target.value })}
                  placeholder="RA"
                  className="p-2 border border-gray-400 rounded-lg"
                />
                <input
                  type="text"
                  value={editObject.dec}
                  onChange={(e) => setEditObject({ ...editObject, dec: e.target.value })}
                  placeholder="Dec"
                  className="p-2 border border-gray-400 rounded-lg"
                />
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditDialog(false)}
                className="px-2 py-1 border border-gray-400 rounded-lg bg-white text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 border border-gray-400 rounded-lg bg-blue-400 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstronomicalList;
