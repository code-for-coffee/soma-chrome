class SomaPlayerOptions
  constructor: ->
    @status_area = $('#status-message')
    @lastfm_button = $('button.lastfm-auth')
    @disable_scrobbling = $('#disable_scrobbling')
    @enable_scrobbling = $('#enable_scrobbling')
    @disable_notifications = $('#disable_notifications')
    @enable_notifications = $('#enable_notifications')
    @lastfm_connected_message = $('#lastfm-is-authenticated')
    @lastfm_not_connected_message = $('#lastfm-is-not-authenticated')
    @lastfm_user = $('#lastfm-user')
    @lastfm_disconnect = $('#lastfm-disconnect')
    @lastfm_token = SomaPlayerUtil.get_url_param('token')
    @options = {scrobbling: false, notifications: true}
    @lastfm_button.click =>
      @init_authenticate_lastfm()
    @lastfm_disconnect.click (event) =>
      event.preventDefault()
      @disconnect_from_lastfm()
    $('input[name="scrobbling"]').change =>
      @save_options()
    $('input[name="notifications"]').change =>
      @save_options()
    @restore_options()
    @authenticate_lastfm()

  restore_options: ->
    SomaPlayerUtil.get_options (opts) =>
      if opts.lastfm_session_key
        @lastfm_connected_message.removeClass 'hidden'
        @enable_scrobbling.removeAttr 'disabled'
      else
        @lastfm_not_connected_message.removeClass 'hidden'
      if opts.lastfm_user
        @lastfm_user.text opts.lastfm_user
        @lastfm_user.attr 'href', "http://last.fm/user/#{opts.lastfm_user}"
      if opts.scrobbling
        @enable_scrobbling.attr 'checked', 'checked'
      if opts.notifications == false
        @disable_notifications.attr 'checked', 'checked'
      for key, value of opts
        @options[key] = value
      $('.controls.hidden').removeClass 'hidden'
      console.debug 'SomaPlayer options:', @options
      @lastfm_button.removeClass 'hidden'

  disconnect_from_lastfm: ->
    console.debug 'disconnecting from Last.fm...'
    @options.lastfm_session_key = null
    @options.lastfm_user = null
    @options.scrobbling = false
    SomaPlayerUtil.set_options @options, =>
      @status_area.text('Disconnected from Last.fm!').fadeIn =>
        setTimeout (=> @status_area.fadeOut()), 2000
      @lastfm_user.text ''
      @lastfm_connected_message.addClass 'hidden'
      @lastfm_not_connected_message.removeClass 'hidden'
      @enable_scrobbling.attr 'disabled', 'disabled'
      @enable_scrobbling.removeAttr 'checked'
      @disable_scrobbling.attr 'checked', 'checked'

  save_options: ->
    @options.scrobbling = $('input[name="scrobbling"]:checked').val() == 'enabled'
    @options.notifications = $('input[name="notifications"]:checked').val() == 'enabled'
    SomaPlayerUtil.set_options @options, =>
      @status_area.text('Saved your options!').fadeIn =>
        setTimeout (=> @status_area.fadeOut()), 2000

  init_authenticate_lastfm: ->
    window.location.href = 'http://www.last.fm/api/auth/' +
                           '?api_key=' + SomaPlayerConfig.lastfm_api_key +
                           '&cb=' + window.location.href

  authenticate_lastfm: ->
    return if @lastfm_token == ''
    console.debug 'authenticating with Last.fm token...'
    lastfm = SomaPlayerUtil.get_lastfm_connection()
    lastfm.auth.getSession {token: @lastfm_token},
      success: (data) =>
        @options.lastfm_session_key = data.session.key
        @options.lastfm_user = data.session.name
        @options.scrobbling = true
        SomaPlayerUtil.set_options @options, =>
          @status_area.text('Connected to Last.fm!').fadeIn =>
            setTimeout (=> @status_area.fadeOut()), 2000
          @lastfm_user.text @options.lastfm_user
          @lastfm_connected_message.removeClass 'hidden'
          @lastfm_not_connected_message.addClass 'hidden'
          @enable_scrobbling.removeAttr 'disabled'
          @enable_scrobbling.attr 'checked', 'checked'
      error: (data) =>
        console.error 'Last.fm error:', data.error, ',', data.message
        delete @options['lastfm_session_key']
        delete @options['lastfm_user']
        SomaPlayerUtil.set_options @options, =>
          @status_area.text('Error authenticating with Last.fm.').fadeIn =>
            setTimeout (=> @status_area.fadeOut()), 2000

$ ->
  new SomaPlayerOptions()
