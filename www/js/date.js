// Swedish day and month names
const dayNamesShort = ['S', 'M', 'T', 'O', 'T', 'F', 'L'];
const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli',
                    'Augusti' , 'September' , 'Oktober', 'November', 'December'];

// Convert date to yyyy-mm-dd format
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm > 9 ? '' : '0') + mm,
          (dd > 9 ? '' : '0') + dd
         ].join('-');
};

// Convert date to 'd monthName yyyy'
Date.prototype.dateString = function() {
  return this.getDate() + ' ' + monthNames[this.getMonth()].toLowerCase() + ' ' + this.getFullYear();
};

// Pads minutes with zeros if needed
Date.prototype.getFullMinutes = function() {
  m = this.getMinutes();
  return (m < 10) ? `0${m}` : m ;
};

// Get time in h:mm format from a date
Date.prototype.hmm = function() {
  return this.getHours() + ':' + this.getFullMinutes();
}

// Checks if two dates have the same day
function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
