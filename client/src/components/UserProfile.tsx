import React, { useState, useRef } from 'react';

interface UserProfileProps {
  currentName: string;
  currentImage: string; // URL to current profile image
  onSave: (name: string, imageFile: File | null) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentName, currentImage, onSave }) => {
  const [name, setName] = useState(currentName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, imageFile);
  };

  return (
    <form onSubmit={handleSave} className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex flex-col items-center mb-6">
        <img
          src={preview}
          alt="Profile Preview"
          className="w-24 h-24 rounded-full object-cover border-2 border-primary mb-2"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
        >
          Change Photo
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
      >
        Save Changes
      </button>
    </form>
  );
};

export default UserProfile;
