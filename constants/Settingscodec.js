// Utility functions for encoding/decoding settings to/from a compact code

/**
 * Encodes settings into a base64 string code
 * @param {Object} settings - The settings object
 * @param {Array<string>} settings.daysOff - Selected days off
 * @param {Array<number>} settings.timingsOff - Selected timings off
 * @param {Array<string>} settings.selectedCourses - Selected courses
 * @param {Array<string>} settings.selectedTeachers - Selected teachers
 * @returns {string} - Encoded settings code
 */
export function encodeSettings(settings) {
  try {
    const settingsJSON = JSON.stringify({
      d: settings.daysOff || [],
      t: settings.timingsOff || [],
      c: settings.selectedCourses || [],
      te: settings.selectedTeachers || []
    });
    
    // Convert to base64 and make URL-safe
    const encoded = btoa(settingsJSON)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); // Remove padding
    
    return encoded;
  } catch (error) {
    console.error('Error encoding settings:', error);
    throw new Error('Failed to encode settings');
  }
}

/**
 * Decodes a settings code back into settings object
 * @param {string} code - The encoded settings code
 * @returns {Object} - Decoded settings object
 */
export function decodeSettings(code) {
  try {
    // Restore URL-safe base64 to standard base64
    let base64 = code.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const settingsJSON = atob(base64);
    const parsed = JSON.parse(settingsJSON);
    
    return {
      daysOff: parsed.d || [],
      timingsOff: parsed.t || [],
      selectedCourses: parsed.c || [],
      selectedTeachers: parsed.te || []
    };
  } catch (error) {
    console.error('Error decoding settings:', error);
    throw new Error('Invalid settings code');
  }
}

/**
 * Validates if a code is a valid settings code
 * @param {string} code - The code to validate
 * @returns {boolean} - True if valid
 */
export function isValidSettingsCode(code) {
  try {
    decodeSettings(code);
    return true;
  } catch {
    return false;
  }
}