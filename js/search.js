(function ($) {
  "use strict";

  // MENU
  $('.navbar-collapse a').on('click', function() {
    $(".navbar-collapse").collapse('hide');
  });
  
  // CUSTOM LINK
  $('.smoothscroll').click(function() {
    var el = $(this).attr('href');
    var elWrapped = $(el);
    var header_height = $('.navbar').height();

    scrollToDiv(elWrapped, header_height);
    return false;

    function scrollToDiv(element, navheight) {
      var offset = element.offset();
      var offsetTop = offset.top;
      var totalScroll = offsetTop - navheight;

      $('body,html').animate({
        scrollTop: totalScroll
      }, 300);
    }
  });

  $(window).on('scroll', function() {
    function isScrollIntoView(elem, index) {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();
      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(window).height() * .5;
      if (elemBottom <= docViewBottom && elemTop >= docViewTop) {
        $(elem).addClass('active');
      }
      if (!(elemBottom <= docViewBottom)) {
        $(elem).removeClass('active');
      }
      if ($('#vertical-scrollable-timeline')[0]) {
        var MainTimelineContainer = $('#vertical-scrollable-timeline')[0];
        var MainTimelineContainerBottom = MainTimelineContainer.getBoundingClientRect().bottom - $(window).height() * .5;
        $(MainTimelineContainer).find('.inner').css('height', MainTimelineContainerBottom + 'px');
      }
    }
    if ($('#vertical-scrollable-timeline li').length > 0) {
      var timeline = $('#vertical-scrollable-timeline li');
      Array.from(timeline).forEach(isScrollIntoView);
    }
  });

})(window.jQuery);

// Project search functionality
// Only use backend API for searching projects

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById("keyword");
  const searchButton = document.getElementById("mainsearch");
  const projectsList = document.getElementById("projects-list");

  // Check for search results in sessionStorage
  const searchResults = sessionStorage.getItem('searchResults');

  if (searchResults) {
    // Parse the search results
    const { term, projects } = JSON.parse(searchResults);

    // Update the search input with the search term
    if (searchInput) {
      searchInput.value = term;
    }

    // Display the filtered projects
    displayProjects(projects);

    // Clear the session storage to avoid persisting the search results
    sessionStorage.removeItem('searchResults');
  } else {
    // If no search results in session storage, fetch all projects from backend
    fetchAllProjects();
  }

  // Setup the local search functionality
  if (searchInput && searchButton) {
    // Listen for search button click
    searchButton.addEventListener("click", performSearch);

    // Listen for Enter key press
    searchInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        performSearch();
      }
    });
  }

  // Function to perform search from search page using backend
  async function performSearch() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      fetchAllProjects();
      return;
    }
    try {
      const response = await fetch(`/api/projects/search?keyword=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      displayProjects(data.data || []);
    } catch (err) {
      displayProjects([]);
    }
  }

  // Function to fetch all projects from backend
  async function fetchAllProjects() {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      displayProjects(data.data || []);
    } catch (err) {
      displayProjects([]);
    }
  }

  // Function to display projects
  function displayProjects(projects) {
    if (!projectsList) return;
    if (projects.length === 0) {
      projectsList.innerHTML = '<div class="col-12 text-center"><p>No projects found matching your search criteria.</p></div>';
      return;
    }
    let html = '';
    projects.forEach((project, index) => {
      // Determine the badge class based on category
      let badgeClass = "bg-design";
      if (project.category === "IOT") badgeClass = "bg-advertising";
      else if (project.category === "AI") badgeClass = "bg-finance";
      else if (project.category === "Game Development") badgeClass = "bg-music";
      // Student project info (if available)
      html += `
        <div class="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0" id="marginspace">
          <div class="custom-block bg-white shadow-lg">
            <a href="#">
              <div class="d-flex">
                <div>
                  <h5 class="mb-2">${project.title}</h5>
                  <p class="mb-0">${project.description}</p>
                  <p class="mb-1"><small class="text-muted">Category: ${project.category}</small></p>
                </div>
                <span class="badge ${badgeClass} rounded-pill ms-auto">${project.popularity || 75}</span>
              </div>
              <img src="${project.imageUrl || '../images/topics/undraw_Redesign_feedback_re_jvm0.png'}" class="custom-block-image img-fluid" alt="">
            </a>
          </div>
        </div>
      `;
      // Add row divider every 3 projects
      if ((index + 1) % 3 === 0 && index < projects.length - 1) {
        html += '</div><div class="row mt-4">';
      }
    });
    projectsList.innerHTML = html;
  }
});