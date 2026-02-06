import { useState } from 'react';
import { encodeSettings, decodeSettings, isValidSettingsCode } from '../constants/Settingscodec';
import './Importexportsettings.css';

const ImportExportSettings = ({ 
  daysOff, 
  timingsOff, 
  selectedCourses, 
  selectedTeachers,
  onImport 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'import'
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleExport = () => {
    try {
      const code = encodeSettings({
        daysOff,
        timingsOff,
        selectedCourses,
        selectedTeachers
      });
      setExportCode(code);
      setActiveTab('export');
      setShowModal(true);
    } catch (error) {
      alert('Failed to export settings. Please try again.');
    }
  };

  const handleImport = () => {
    setImportError('');
    
    if (!importCode.trim()) {
      setImportError('Please enter a settings code');
      return;
    }

    try {
      const settings = decodeSettings(importCode.trim());
      onImport(settings);
      setShowModal(false);
      setImportCode('');
      alert('Settings imported successfully!');
    } catch (error) {
      setImportError('Invalid settings code. Please check and try again.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = exportCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const openImportTab = () => {
    setActiveTab('import');
    setShowModal(true);
    setImportError('');
  };

  return (
    <>
      <div className="import-export-container filters">
        <button className="settings-btn " onClick={handleExport}>
          📤 Import/Export Settings
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings {activeTab === 'export' ? 'Export' : 'Import'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-tabs">
              <button 
                className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                Export
              </button>
              <button 
                className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                Import
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'export' ? (
                <div className="export-section">
                  <p className="info-text">
                    Share this code with others or save it to restore your settings later:
                  </p>
                  <div className="code-display-container">
                    <div className="code-display">
                      {exportCode}
                    </div>
                    <button 
                      className="copy-btn" 
                      onClick={handleCopyCode}
                    >
                      {copySuccess ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <p className="settings-summary">
                    <strong>Current settings:</strong><br/>
                    • {selectedCourses.length} course(s)<br/>
                    • {selectedTeachers.length} teacher(s)<br/>
                    • {daysOff.length} day(s) off<br/>
                    • {timingsOff.length} timing(s) off
                  </p>
                </div>
              ) : (
                <div className="import-section">
                  <p className="info-text">
                    Paste a settings code to restore saved preferences:
                  </p>
                  <textarea
                    className="import-input"
                    value={importCode}
                    onChange={(e) => {
                      setImportCode(e.target.value);
                      setImportError('');
                    }}
                    placeholder="Paste your settings code here..."
                    rows={4}
                  />
                  {importError && (
                    <p className="error-text">{importError}</p>
                  )}
                  <button 
                    className="import-submit-btn" 
                    onClick={handleImport}
                    disabled={!importCode.trim()}
                  >
                    Import Settings
                  </button>
                  <p className="warning-text">
                    ⚠️ Importing will replace your current settings
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExportSettings;