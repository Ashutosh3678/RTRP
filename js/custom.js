// Wrap everything in a try-catch to prevent crashes
try {
  (function ($) {
    "use strict";

    // MENU
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
      // Skip processing for student login links
      if ($(this).attr('href').includes('student-login.html')) {
        return true; // Allow default behavior for login links
      }
      
      try {
        var el = $(this).attr('href');
        var elWrapped = $(el);
        var header_height = $('.navbar').height();

        scrollToDiv(elWrapped,header_height);
      } catch (err) {
        console.error('Error in smoothscroll:', err);
        return true; // Allow default behavior on error
      }
      return false;

      function scrollToDiv(element,navheight){
        var offset = element.offset();
        var offsetTop = offset.top;
        var totalScroll = offsetTop-navheight;

        $('body,html').animate({
        scrollTop: totalScroll
        }, 300);
      }
    });

    // Direct navigation for login icons
    $('a.navbar-icon.bi-person').on('click', function(e) {
      if ($(this).attr('href').includes('student-login.html')) {
        e.preventDefault();
        window.location.href = $(this).attr('href');
        return false;
      }
    });

    $(window).on('scroll', function(){
      try {
        function isScrollIntoView(elem, index) {
          var docViewTop = $(window).scrollTop();
          var docViewBottom = docViewTop + $(window).height();
          var elemTop = $(elem).offset().top;
          var elemBottom = elemTop + $(window).height()*.5;
          if(elemBottom <= docViewBottom && elemTop >= docViewTop) {
            $(elem).addClass('active');
          }
          if(!(elemBottom <= docViewBottom)) {
            $(elem).removeClass('active');
          }
          var MainTimelineContainer = $('#vertical-scrollable-timeline')[0];
          if (MainTimelineContainer) {
            var MainTimelineContainerBottom = MainTimelineContainer.getBoundingClientRect().bottom - $(window).height()*.5;
            $(MainTimelineContainer).find('.inner').css('height',MainTimelineContainerBottom+'px');
          }
        }
        
        var timeline = $('#vertical-scrollable-timeline li');
        if (timeline.length > 0) {
          Array.from(timeline).forEach(isScrollIntoView);
        }
      } catch (err) {
        console.error('Error in scroll handler:', err);
      }
    });

  })(window.jQuery);
} catch (err) {
  console.error('Error in custom.js:', err);
}


// Search bar element handling wrapped in try-catch
try {
  // Get search elements
  const searchInput = document.getElementById("keywordhome");
  const searchButton = document.querySelector(".hero-section button[type='button']");

  // Setup event listeners
  if (searchInput && searchButton) {
    // Listen for button click
    searchButton.addEventListener("click", () => {
      performSearch();
    });

    // Listen for Enter key
    searchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        performSearch();
      }
    });
  }

  // Function to perform search using backend API
  async function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      // If empty search, just go to search page
      window.location.href = "html/search.html";
      return;
    }
    try {
      const response = await fetch(`/api/projects/search?keyword=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.success && data.data) {
        sessionStorage.setItem('searchResults', JSON.stringify({
          term: searchTerm,
          projects: data.data
        }));
      } else {
        sessionStorage.setItem('searchResults', JSON.stringify({
          term: searchTerm,
          projects: []
        }));
      }
    } catch (err) {
      sessionStorage.setItem('searchResults', JSON.stringify({
        term: searchTerm,
        projects: []
      }));
    }
    // Redirect to search page
    window.location.href = "html/search.html";
  }
} catch (err) {
  console.error('Error in search functionality:', err);
}

// Comment out the erroneous code that uses getElementByClass
// let con = document.getElementByClass("hello");
// con.addEventListener("click", (e) => {
//   let popup = alert("Coming Soon");
//   console.log(popup);
// });

