jQuery(window).on('load', function() {
  "use strict";
  setTimeout(function(){
    jQuery('#gr_iframe').attr('src', 'https://goodreads.com/widgets/user_update_widget?num_updates=5&user=18849983');
  }, 1000)
  jQuery('#gr_iframe').on('load', function(){
      jQuery(this).show();
      jQuery('.loading-basic').hide();
  });
});
