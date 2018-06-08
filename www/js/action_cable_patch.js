/*
 * ---------------------------------------
 * ActionCable Token Authorization Patch
 * J. Navrozidis, navro@github, 2017
 * ---------------------------------------
 */

ActionCable.Connection.prototype.open = (function(original) {
  return function() {
    _this = this;
    _arguments = arguments;

    // If we have a token, reuse it if there is enough time
    var now = Math.floor(Date.now() / 1000);
    if (this.consumer.expires > now - 5) {
      return original.apply(this, arguments);
    }

    // Get a new token
    $.getJSON(AC_TOKEN_URL)
      .then(function(resp) {
        _this.consumer.expires = resp.expires;
        _this.consumer.url = _this.consumer.url.split('?')[0] + '?token=' + resp.token;

        // Run original function and save the return value
        ret = original.apply(_this, _arguments);

        // Reset the expiration time if a connection was established
        _this.webSocket.addEventListener('open', function resetListener() {
          _this.consumer.expires = 10;
          _this.webSocket.removeEventListener('open', resetListener);
        });

        return ret;
      })
      .fail(function(resp) {
        console.log('Could not obtain ActionCable token.');
        return false;
      });
  };
}(ActionCable.Connection.prototype.open));
