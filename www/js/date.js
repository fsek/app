// Swedish day and month names
const dayNamesShort = ['S', 'M', 'T', 'O', 'T', 'F', 'L'];
const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli',
  'Augusti' , 'September' , 'Oktober', 'November', 'December'];
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul',
  'Aug' , 'Sep' , 'Okt', 'Nov', 'Dec'];

// Convert date to yyyy-mm-dd format
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

// Convert date to 'hh:mm, d monthName yyyy'
Date.prototype.fullDate= function() {
  return this.hhmm() + ', ' + this.dateString();
};

// Convert date to 'd monthName yyyy'
Date.prototype.dateString = function() {
  return this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase() + ' ' + this.getFullYear();
};

// Convert date to 'hh:mm, d monthName'
Date.prototype.timeDateString = function() {
  return this.hhmm() + ', ' + this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase();
};

// Pads minutes with zeros if needed
Date.prototype.getFullMinutes = function() {
  m = this.getMinutes();
  return m < 10 ? `0${m}` : m;
};

// Pads hours with zeros if needed
Date.prototype.getFullHours = function() {
  h = this.getHours();
  return h < 10 ? `0${h}` : h;
};

// Get time in hh:mm format from a date
Date.prototype.hhmm = function() {
  return this.getFullHours() + ':' + this.getFullMinutes();
};

// Get the name of a day
Date.prototype.getDayName = function() {
  return dayNames[this.getDay()];
};

// Get time in dayName, d monthName
Date.prototype.getDayMonthName = function() {
  return dayNames[this.getDay()] + ', ' + this.getDate() + ' ' + monthNamesShort[this.getMonth()].toLowerCase();
};

// Get time for dots in events
Date.prototype.timeWithoutDot = function() {
  return this.getFullHours() + ', ' + this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase();
};

Date.prototype.timeSingleDot = function() {
  return this.getFullHours() + ' (.), ' + this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase();
};

Date.prototype.timeDoubleDot = function() {
  return this.getFullHours() + ' (..), ' + this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase();
};

// Checks if two dates have the same day
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
