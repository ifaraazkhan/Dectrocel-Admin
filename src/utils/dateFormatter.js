/**
 * Date and Time formatting utilities
 * All dates are displayed in IST (Indian Standard Time)
 */

/**
 * Format date as dd-mm-yyyy in IST
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (dd-mm-yyyy)
 */
export const formatDate = (date) => {
  if (!date) return '-';

  try {
    const dateObj = new Date(date);

    // Convert to IST (UTC+5:30)
    const istDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const year = istDate.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Format time as hh:mm in IST (24-hour format)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted time (hh:mm)
 */
export const formatTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = new Date(date);

    // Convert to IST (UTC+5:30)
    const istDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Format datetime as dd-mm-yyyy hh:mm in IST
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime (dd-mm-yyyy hh:mm)
 */
export const formatDateTime = (date) => {
  if (!date) return '-';

  try {
    return `${formatDate(date)} ${formatTime(date)}`;
  } catch (error) {
    return '-';
  }
};

/**
 * Get current date and time in IST
 * @returns {object} Current date and time {date, time, datetime}
 */
export const getCurrentIST = () => {
  const now = new Date();
  return {
    date: formatDate(now),
    time: formatTime(now),
    datetime: formatDateTime(now)
  };
};
