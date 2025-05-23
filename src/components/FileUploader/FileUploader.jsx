// components/shared/FileUploader.jsx
const FileUploader = ({ accept, multiple, onFileChange, label }) => {
    const handleChange = (e) => {
      const files = multiple ? Array.from(e.target.files) : e.target.files[0];
      onFileChange(files);
    };
  
    return (
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer">
        <input 
          type="file" 
          className="hidden" 
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        <span className="text-blue-600 font-medium">{label}</span>
      </label>
    );
  };

export default FileUploader;