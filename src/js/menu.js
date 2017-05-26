jQuery(document).ready(function($) {
  /*
  * Expandable Search Bar
  */
  var $ntsearch = $('#nt-search'),
  $ntsearchinput = $ntsearch.find('input.nt-search-input'),
  $body = $('html,body'),
  openSearch = function() {
    $ntsearch.data('open', true).addClass('nt-search-open');
    $ntsearchinput.focus();
    return false;
  },
  closeSearch = function() {
    $ntsearch.data('open', false).removeClass('nt-search-open');
  };

  $ntsearchinput.on('click', function(e) {
    e.stopPropagation();
    $ntsearch.data('open', true);
  });

  $ntsearch.on('click', function(e) {
    e.stopPropagation();
    if (!$ntsearch.data('open')) {
      openSearch();
      $body.off('click').on('click', function(e) {
        closeSearch();
      });
    } else {
      if ($ntsearchinput.val() === '') {
        closeSearch();
        return false;
      }
    }
  });
});
(function (window, document) {
  var menu = document.getElementById('menu'),
  WINDOW_CHANGE_EVENT = ('onorientationchange' in window) ? 'orientationchange':'resize';

  function toggleHorizontal() {
    [].forEach.call(
      document.getElementById('menu').querySelectorAll('.custom-can-transform'),
      function(el){
        el.classList.toggle('pure-menu-horizontal');
      }
    );
  };

  function toggleMenu() {
    // set timeout so that the panel has a chance to roll up
    // before the menu switches states
    if (menu.classList.contains('open')) {
      setTimeout(toggleHorizontal, 500);
    }
    else {
      toggleHorizontal();
    }
    menu.classList.toggle('open');
    document.getElementById('toggle').classList.toggle('x');
  };

  function closeMenu() {
    if (menu.classList.contains('open')) {
      toggleMenu();
    }
  }

  document.getElementById('toggle').addEventListener('click', function (e) {
    toggleMenu();
  });

  window.addEventListener(WINDOW_CHANGE_EVENT, closeMenu);
})(this, this.document);
