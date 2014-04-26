var fs = require('fs'),
    gui = require('nw.gui'),
    win = gui.Window.get(),
    platform = /^win/.test(process.platform) ? 'win' : 'mac',
    template,
    hosts,
    view,
    source,
    setting,
    tray,
    e;

define(function(require) {
  var shortcut,
      $doc = $(document);

  function initDom() {
    $doc.on('dblclick', '.js-custom a', function(e) {
      var index = $(this).parent().prevAll('li').length;
      view.active(index);
      view.use(index - 2);
      hosts.active(index);
      hosts.use(index);
      e.preventDefault();
    });

    $doc.on('click', '.js-add', function(e) {
      hosts.add();
    });

    $doc.on('click', '.js-del', function(e) {
      var $item = $('.active'),
          index = $item.prevAll('li:not(#js-list-hosts)').length;

      if (index < 2) { return false; }

      $item.prev().addClass('active');
      $item.remove();
      hosts.del(index);
      hosts.active(index - 1);
      view.active(index - 1);
    });

    $doc.on('shown.bs.tab', '[data-toggle=tab]', function (e) {
      var id = $(this).attr('href');
      $(id).find('.CodeMirror').get(0).CodeMirror.refresh();
    });

    $doc.on('dragstart', '#js-list li.js-switcher-nav', function(e) {
      var $this = $(this);

      setTimeout(function() {
        $this
          .addClass('draggable-dragging')
          .hide()
          .next('.draggable-placeholder')
            .hide()
            .css('height', '39')
            .show();

        setTimeout(function() {
          $('.draggable-placeholder').css('transition', 'all .1s ease-in');
        }, 0);
      }, 0);
    });

    $doc.on('dragend', '#js-list li', function(e) {
      $('.draggable-placeholder').css({
        height: 0,
        transition: 'none'
      });

      $('.draggable-dragging')
        .removeClass('draggable-dragging')
        .show();

      $('.draggable-over-this').removeClass('draggable-over-this');
    });

    $doc.on('dragenter', '#js-list li.js-switcher-nav', function(e) {
      $('.draggable-placeholder')
        .css('height', '0')
        .removeClass('draggable-over-this');

      $(this).next('.draggable-placeholder')
        .css('height', '39')
        .addClass('draggable-over-this');
    });

    $doc.on('dragenter dragover', '#js-list li', function(e) {
      e.preventDefault();
    });

    $doc.on('drop', '#js-list li.js-switcher-nav', function(e) {
      e.preventDefault();
      $(this).next('.draggable-placeholder').trigger('drop');
    });

    $doc.on('drop', '#js-list li.draggable-placeholder', function(e) {
      var $placeholders = $('.draggable-placeholder'),
          $placeholder = $placeholders.filter('.draggable-over-this'),
          index = $placeholders.index($placeholder);

      if (index != -1) {
        var dragging = $('.draggable-dragging'),
            draggingPlaceholder = $('.draggable-dragging + .draggable-placeholder'),
            draggingIndex = $placeholders.index(draggingPlaceholder);

        dragging.add(draggingPlaceholder).insertAfter($placeholder);

        hosts.reorder(draggingIndex, index);
      }
    });
  }

  function initModules() {
    var rename;

    template = require('./template'),
    hosts = require('./host'),
    view = require('./view'),
    source = require('./source');
    setting = require('./setting');
    rename = require('./rename');
    //tray = require('./tray');

    rename.init(jQuery);

    hosts.init();
    view.init(hosts.hosts);
    setting.init();
    //tray.init();
  }

  e = $({});

  initDom();
  initModules();

  win.show();
  win.focus();
});
