var SomaPlayerPopup;

SomaPlayerPopup = (function() {
  function SomaPlayerPopup() {
    this.base = this;
    this.station_list = this.fetch_soma_channels;
    this.station_select = $('#station');
    this.play_button = $('#play');
    this.pause_button = $('#pause');
    this.current_info_el = $('#currently-playing');
    this.title_el = $('span#title');
    this.artist_el = $('span#artist');
    this.load_current_info();
    this.handle_links();
    this.fetch_soma_channels();
    this.station_select.change((function(_this) {
      return function() {
        return _this.station_changed();
      };
    })(this));
    this.play_button.click((function(_this) {
      return function() {
        return _this.play();
      };
    })(this));
    this.pause_button.click((function(_this) {
      return function() {
        return _this.pause();
      };
    })(this));
    this.station_select.keypress((function(_this) {
      return function(e) {
        if (e.keyCode === 13) {
          if (_this.station_select.val() === '') {
            return;
          }
          if (!(_this.play_button.is(':disabled') || _this.play_button.hasClass('hidden'))) {
            console.debug('pressing play button');
            _this.play_button.click();
          }
          if (!(_this.pause_button.is(':disabled') || _this.pause_button.hasClass('hidden'))) {
            console.debug('pressing pause button');
            return _this.pause_button.click();
          }
        }
      };
    })(this));
  }

  SomaPlayerPopup.prototype.fetch_soma_channels = function() {
    var on_error, on_success, url;
    console.log('Fetching channels.json...');
    url = 'http://api.somafm.com/channels.json';
    on_success = function(data) {
      var station, _i, _len, _ref, _results;
      this.station_select_list = $('#station');
      _ref = data.channels;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        station = _ref[_i];
        console.log(station);
        _results.push(this.station_select_list.append('<option value="' + station.id + '">' + station.title + '</option>'));
      }
      return _results;
    };
    on_error = function(jq_xhr, status, error) {
      console.error('failed to fetch Soma.fm channels', error);
      return this.station_select_list.append('<option value="sadness :(">Failed to retreive channel listing.</option>');
    };
    return $.ajax({
      dataType: 'json',
      url: url,
      success: on_success,
      error: on_error
    });
  };

  SomaPlayerPopup.prototype.display_track_info = function(info) {
    if (info.artist || info.title) {
      this.title_el.text(info.title);
      this.artist_el.text(info.artist);
      return this.current_info_el.removeClass('hidden');
    }
  };

  SomaPlayerPopup.prototype.hide_track_info = function() {
    this.title_el.text('');
    this.artist_el.text('');
    return this.current_info_el.addClass('hidden');
  };

  SomaPlayerPopup.prototype.load_current_info = function() {
    this.station_select.attr('disabled', 'disabled');
    return SomaPlayerUtil.send_message({
      action: 'info'
    }, (function(_this) {
      return function(info) {
        console.debug('finished info request, info', info);
        _this.station_select.val(info.station);
        _this.station_select.trigger('change');
        if (info.is_paused) {
          _this.station_is_paused();
        } else {
          _this.station_is_playing();
        }
        return _this.display_track_info(info);
      };
    })(this));
  };

  SomaPlayerPopup.prototype.station_is_playing = function() {
    this.pause_button.removeClass('hidden');
    this.play_button.addClass('hidden');
    this.station_select.attr('disabled', 'disabled');
    return this.pause_button.focus();
  };

  SomaPlayerPopup.prototype.station_is_paused = function() {
    this.pause_button.addClass('hidden');
    this.play_button.removeClass('hidden');
    this.station_select.removeAttr('disabled');
    return this.play_button.focus();
  };

  SomaPlayerPopup.prototype.play = function() {
    var station;
    this.station_select.attr('disabled', 'disabled');
    station = this.station_select.val();
    console.debug('play button clicked, station', station);
    return SomaPlayerUtil.send_message({
      action: 'play',
      station: station
    }, (function(_this) {
      return function() {
        console.debug('finishing telling station to play');
        _this.station_is_playing();
        return SomaPlayerUtil.send_message({
          action: 'info'
        }, function(info) {
          if (info.artist !== '' || info.title !== '') {
            return _this.display_track_info(info);
          } else {
            return SomaPlayerUtil.get_current_track_info(station, function(info) {
              return _this.display_track_info(info);
            });
          }
        });
      };
    })(this));
  };

  SomaPlayerPopup.prototype.pause = function() {
    var station;
    station = this.station_select.val();
    console.debug('pause button clicked, station', station);
    return SomaPlayerUtil.send_message({
      action: 'pause',
      station: station
    }, (function(_this) {
      return function() {
        console.debug('finished telling station to pause');
        _this.station_is_paused();
        _this.hide_track_info();
        return _this.station_select.focus();
      };
    })(this));
  };

  SomaPlayerPopup.prototype.station_changed = function() {
    var station;
    station = this.station_select.val();
    console.debug('station changed to', station);
    if (station === '') {
      return this.play_button.attr('disabled', 'disabled');
    } else {
      return this.play_button.removeAttr('disabled');
    }
  };

  SomaPlayerPopup.prototype.handle_links = function() {
    return $('a').click(function(e) {
      var link, url;
      e.preventDefault();
      link = $(this);
      if (link.attr('href') === '#options') {
        url = chrome.extension.getURL('options.html');
      } else {
        url = link.attr('href');
      }
      chrome.tabs.create({
        url: url
      });
      return false;
    });
  };

  return SomaPlayerPopup;

})();

document.addEventListener('DOMContentLoaded', function() {
  return new SomaPlayerPopup();
});
