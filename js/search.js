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
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const searchInput = document.getElementById("keyword");
  const searchButton = document.getElementById("mainsearch");
  const projectsContainer = document.getElementById("design-tab-pane");
  const projectsList = document.getElementById("projects-list");
  
  // All projects that will be displayed and searchable on the search page
  const allProjects = [
    // Projects from search.html
    { title: "Career Guidance Website", description: "A website which guides you to select your career.", category: "Web Development", url: "careergui.html", popularity: 75 },
    { title: "Clubs @ MLRIT", description: "A website which displays different clubs at MLRIT.", category: "Web Development", url: "MLRITclubs.html", popularity: 65 },
    { title: "To Do App", description: "To Do app which records your tasks.", category: "Web Development", url: "ToDo.html", popularity: 100 },
    { title: "LPG Gas Leakage Detector", description: "LPG gas leak detector using arduino.", category: "IOT", url: "#", popularity: 75 },
    
    // Student Projects from repeated.html page
    { title: "Career Guidance Website", description: "A website which guides you to select your career.", category: "Web Development", student: "Ravi Kumar", rollNumber: "20B81A05G2", popularity: 75, imageUrl: "../images/topics/undraw_Redesign_feedback_re_jvm0.png", url: "repeated.html" },
    { title: "Clubs @ MLRIT", description: "A website which displays different clubs at MLRIT.", category: "Web Development", student: "Priya Sharma", rollNumber: "21B81A05F3", popularity: 65, imageUrl: "../images/topics/undraw_Remote_design_team_re_urdx.png", url: "repeated.html" },
    { title: "To Do App", description: "To Do app which records your tasks.", category: "Web Development", student: "Arun Singh", rollNumber: "19B81A05H1", popularity: 100, imageUrl: "../images/topics/colleagues-working-cozy-office-medium-shot.png", url: "repeated.html" },
    { title: "Plant Watering System", description: "Automatic plant watering system using humidity sensor.", category: "IOT", student: "Neha Gupta", rollNumber: "20B81A05J4", popularity: 30, imageUrl: "../images/topics/undraw_online_ad_re_ol62.png", url: "repeated.html" },
    { title: "Water Level Checker", description: "A Device Which Checks Water Level To Avoid Floods", category: "IOT", student: "Rahul Verma", rollNumber: "21B81A05K2", popularity: 65, imageUrl: "../images/topics/undraw_Group_video_re_btu7.png", url: "repeated.html" },
    { title: "Water trash collector", description: "Collects trash from water bodies using solar", category: "IOT", student: "Ananya Reddy", rollNumber: "19B81A05L7", popularity: 50, imageUrl: "../images/topics/undraw_viral_tweet_gndb.png", url: "repeated.html" },
    { title: "Student Management System", description: "A web application to manage student data", category: "Web Development", student: "Karthik Nair", rollNumber: "20B81A05M5", popularity: 45, imageUrl: "../images/topics/undraw_happy_music_g6wc.png", url: "repeated.html" },
    { title: "Smart Home Automation", description: "Control your home devices with a smartphone app", category: "IOT", student: "Shreya Patel", rollNumber: "21B81A05N8", popularity: 80, imageUrl: "../images/topics/undraw_Educator_re_ju47.png", url: "repeated.html" },
    
    // Additional student projects
    { title: "E-commerce Website", description: "Online shopping platform with payment integration.", category: "Web Development", student: "Vikram Joshi", rollNumber: "19B81A05P3", popularity: 85, imageUrl: "../images/topics/undraw_Redesign_feedback_re_jvm0.png", url: "repeated.html" },
    { title: "Weather App", description: "Real-time weather forecast application.", category: "Web Development", student: "Sanjana Kapoor", rollNumber: "20B81A05Q6", popularity: 60, imageUrl: "../images/topics/undraw_Remote_design_team_re_urdx.png", url: "repeated.html" },
    { title: "ChatBot", description: "AI-powered chatbot for customer service.", category: "AI", student: "Arjun Malhotra", rollNumber: "21B81A05R9", popularity: 90, imageUrl: "../images/topics/colleagues-working-cozy-office-medium-shot.png", url: "repeated.html" },
    { title: "Gesture Controlled Robot", description: "Robot that responds to hand gestures.", category: "IOT", student: "Tanvi Desai", rollNumber: "19B81A05S1", popularity: 75, imageUrl: "../images/topics/undraw_online_ad_re_ol62.png", url: "repeated.html" },
    { title: "Virtual Reality Game", description: "Immersive VR gaming experience.", category: "Game Development", student: "Rohan Mehta", rollNumber: "20B81A05T4", popularity: 95, imageUrl: "../images/topics/undraw_Group_video_re_btu7.png", url: "repeated.html" },
    { title: "Facial Recognition System", description: "Security system using facial recognition technology.", category: "AI", student: "Ishaan Choudhary", rollNumber: "21B81A05U7", popularity: 85, imageUrl: "../images/topics/undraw_viral_tweet_gndb.png", url: "repeated.html" }
  ];
  
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
    // If no search results in session storage, display all projects
    displayProjects(allProjects);
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
    
    // Listen for keyup event to filter in real-time
    searchInput.addEventListener("keyup", (event) => {
      // Only do real-time filtering if not pressed Enter (which triggers the full search)
      if (event.key !== "Enter") {
        const searchQuery = event.target.value.toLowerCase();
        filterProjectElements(searchQuery);
      }
    });
  }
  
  // Function to perform search from search page
  function performSearch() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
      // If empty search, show all default projects
      displayProjects(defaultProjects);
      return;
    }
    
    // All projects data (same as in custom.js)
    // Use the same projects as defined at the top of the file
    // No need to redefine them here as we're using the allProjects array
    
    // Filter projects based on search term
    const filteredProjects = allProjects.filter(project => {
      return (
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.category.toLowerCase().includes(searchTerm) ||
        (project.student && project.student.toLowerCase().includes(searchTerm)) ||
        (project.rollNumber && project.rollNumber.toLowerCase().includes(searchTerm))
      );
    });
    
    // Display the filtered projects
    displayProjects(filteredProjects);
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
      
      // Determine if this is a student project (has student and rollNumber properties)
      const isStudentProject = project.student && project.rollNumber;
      
      html += `
        <div class="col-lg-4 col-md-6 col-12 mb-4 mb-lg-0" id="marginspace">
          <div class="custom-block bg-white shadow-lg">
            <a href="${project.url}">
              <div class="d-flex">
                <div>
                  <h5 class="mb-2">${project.title}</h5>
                  <p class="mb-0">${project.description}</p>
                  <p class="mb-1"><small class="text-muted">Category: ${project.category}</small></p>
                  ${isStudentProject ? `<p class="mb-1"><small class="text-muted">Student: ${project.student} (${project.rollNumber})</small></p>` : ''}
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
  
  // Function to filter project elements in the DOM (for real-time filtering)
  function filterProjectElements(searchQuery) {
    const projectElements = document.querySelectorAll("#marginspace");
    
    projectElements.forEach(element => {
      const text = element.textContent.toLowerCase();
      
      if (text.includes(searchQuery)) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    });
  }
});