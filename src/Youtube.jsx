import React, { useState, useEffect } from 'react';

const DocumentViewer = () => {
  const [document, setDocument] = useState({
    title: 'Sample Document',
    pages: [
      "This is the first page of the document. It contains some sample text.",
      "This is the second page. It demonstrates the page navigation feature.",
      "The third page shows how the search functionality works.",
      "On this fourth page, we can see the table of contents in action.",
      "This fifth and final page concludes our sample document."
    ],
    toc: [
      { title: 'Introduction', page: 1 },
      { title: 'Navigation', page: 2 },
      { title: 'Search', page: 3 },
      { title: 'Table of Contents', page: 4 },
      { title: 'Conclusion', page: 5 }
    ]
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highlightedText, setHighlightedText] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [editedPages, setEditedPages] = useState([...document.pages]);

  const [loading, setLoading] = useState(false); // For loading state
  const [autoSave, setAutoSave] = useState(false); // Auto-save feature
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle
  const [bookmarkedPages, setBookmarkedPages] = useState([]); // Bookmarked pages
  const [zoom, setZoom] = useState(100); // Zoom functionality

  // Auto-save the document every 5 seconds if enabled
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        saveDocument();
      }, 5000); // Save every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoSave]);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const results = document.pages.map((page, index) => {
        if (page.toLowerCase().includes(searchTerm.toLowerCase())) {
          return index + 1;
        }
        return null;
      }).filter(page => page !== null);
      setHighlightedText(results.join(', '));
    }
  }, [searchTerm, document.pages]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    setLoading(true);

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const pages = [];
      let page = [];
      lines.forEach(line => {
        if (line === '---') {
          pages.push(page.join('\n'));
          page = [];
        } else {
          page.push(line);
        }
      });
      if (page.length > 0) pages.push(page.join('\n')); // Add last page

      const toc = pages.map((_, index) => ({
        title: `Page ${index + 1}`,
        page: index + 1
      }));

      setDocument({
        title: file.name,
        pages: pages,
        toc: toc
      });

      setCurrentPage(1);
      setSearchTerm('');
      setHighlightedText('');
      setLoading(false);
      setEditedPages(pages); // Initialize edited pages with document pages
    };

    reader.readAsText(file);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= document.pages.length) {
      setCurrentPage(newPage);
    }
  };

  // Handle text editing
  const handleEditContent = (e, pageIndex) => {
    const updatedPages = [...editedPages];
    updatedPages[pageIndex] = e.target.innerText;

    // Save to undo stack
    setUndoStack([...undoStack, editedPages]);
    setRedoStack([]);

    setEditedPages(updatedPages);
  };

  // Undo functionality
  const undoEdit = () => {
    if (undoStack.length > 0) {
      const previousPages = undoStack[undoStack.length - 1];
      setRedoStack([editedPages, ...redoStack]);
      setEditedPages(previousPages);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  // Redo functionality
  const redoEdit = () => {
    if (redoStack.length > 0) {
      const nextPages = redoStack[0];
      setUndoStack([...undoStack, editedPages]);
      setEditedPages(nextPages);
      setRedoStack(redoStack.slice(1));
    }
  };

  // Save Document as text file
  const saveDocument = () => {
    const blob = new Blob([editedPages.join('\n---\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
  };

  // Replace text in the document
  const handleReplaceText = () => {
    if (!replaceTerm || !searchTerm) {
      return; // If no replace term or search term, return
    }

    const updatedPages = editedPages.map(page =>
      page.replace(new RegExp(searchTerm, 'gi'), replaceTerm) // Replace the term with the new one (case-insensitive)
    );

    setUndoStack([...undoStack, editedPages]);
    setRedoStack([]);

    setEditedPages(updatedPages); // Set the updated pages after replacement
    setSearchTerm(''); // Clear search term
    setReplaceTerm(''); // Clear replace term
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Bookmark Page
  const toggleBookmarkPage = (page) => {
    setBookmarkedPages(prev => 
      prev.includes(page) ? prev.filter(b => b !== page) : [...prev, page]
    );
  };

  // Zoom in/out functionality
  const zoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 10, 200));
  };

  const zoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 10, 50));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-lavender-100 to-peach-100'} flex justify-center items-center p-6`}>
      <div className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200">
        
        {/* Document title */}
        <h1 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-8">{document.title || 'No Document Loaded'}</h1>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 bg-gray-600 text-white rounded-full shadow-md hover:bg-gray-500 transition duration-300 ease-in-out"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* File upload */}
        <div className="mb-8">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:bg-gradient-to-l hover:from-purple-600 hover:to-indigo-500 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-600">Page {currentPage} of {document.pages.length}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 disabled:opacity-50"
            disabled={currentPage === document.pages.length}
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="mb-4">
          <button onClick={zoomOut} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full shadow-md hover:bg-gray-400 transition duration-300 ease-in-out">
            Zoom Out
          </button>
          <button onClick={zoomIn} className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-full shadow-md hover:bg-gray-400 transition duration-300 ease-in-out">
            Zoom In
          </button>
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Replace input */}
        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="w-full px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={handleReplaceText}
            className="ml-4 px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            Replace
          </button>
        </div>

        {/* Bookmarks */}
        <div className="mb-4">
          <span className="text-gray-800 font-semibold">Bookmarks: </span>
          <span className="text-gray-600">{bookmarkedPages.join(', ')}</span>
        </div>

        {/* Page content */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Page {currentPage}</h2>
          <div
            contentEditable
            onInput={(e) => handleEditContent(e, currentPage - 1)}
            style={{ fontSize: `${fontSize}px`, zoom: `${zoom}%` }}
            className="w-full min-h-[200px] p-6 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {editedPages[currentPage - 1]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
