import React from 'react';

interface StatusTextInputProps {
  content: string;
  setContent: (val: string) => void;
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;
  textColor: string;
  setTextColor: (val: string) => void;
  backgroundColors: string[];
  textColors: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  handleMentionInput: (text: string) => void;
  showColorPickers: boolean;
}

const StatusTextInput: React.FC<StatusTextInputProps> = ({
  content,
  setContent,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  backgroundColors,
  textColors,
  textareaRef,
  handleMentionInput,
  showColorPickers
}) => (
  <>
    <div 
      className="relative rounded-lg p-6 min-h-[200px] flex items-center justify-center"
      style={{ backgroundColor }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleMentionInput(e.target.value);
        }}
        placeholder="What's on your mind?"
        className="w-full bg-transparent border-none outline-none resize-none text-center text-xl font-medium placeholder-opacity-70"
        style={{ color: textColor }}
        rows={4}
      />
    </div>
    {showColorPickers && (
      <div className="space-y-3 mt-2">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Background Color</p>
          <div className="flex flex-wrap gap-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  backgroundColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Text Color</p>
          <div className="flex gap-2">
            {textColors.map((color) => (
              <button
                key={color}
                onClick={() => setTextColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  textColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </>
);

export default StatusTextInput; 