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

  // All projects data - consolidated from various sections of the site
  const allProjects = [
    // Web Development Projects from search page
    { title: "Career Guidance Website", description: "A website which guides you to select your career.", category: "Web Development", url: "html/careergui.html", popularity: 75 },
    { title: "Clubs @ MLRIT", description: "A website which displays different clubs at MLRIT.", category: "Web Development", url: "html/MLRITclubs.html", popularity: 65 },
    { title: "To Do App", description: "To Do app which records your tasks.", category: "Web Development", url: "html/ToDo.html", popularity: 100 },
    { title: "Student Management System", description: "A web application to manage student data", category: "Web Development", url: "html/search.html", popularity: 45 },
    
    // IOT Projects from search page
    { title: "Plant Watering System", description: "Automatic plant watering system using humidity sensor.", category: "IOT", url: "html/plantw.html", popularity: 30 },
    { title: "Water Level Checker", description: "A Device Which Checks Water Level To Avoid Floods", category: "IOT", url: "html/search.html", popularity: 65 },
    { title: "Water trash collector", description: "Collects trash from water bodies using solar", category: "IOT", url: "html/search.html", popularity: 50 },
    { title: "Smart Home Automation", description: "Control your home devices with a smartphone app", category: "IOT", url: "html/search.html", popularity: 80 },
    { title: "LPG Gas Leakage Detector", description: "LPG gas leak detector using arduino.", category: "IOT", url: "html/search.html", popularity: 75 },
    { title: "Automatic Car Parking", description: "Car parking system using arduino and ultrasonic sensor.", category: "IOT", url: "html/search.html", popularity: 70 },
    
    // Student Projects from repeated.html page
    { title: "Career Guidance Website", description: "A website which guides you to select your career.", category: "Web Development", student: "Ravi Kumar", rollNumber: "20B81A05G2", popularity: 75, url: "html/repeated.html" },
    { title: "Clubs @ MLRIT", description: "A website which displays different clubs at MLRIT.", category: "Web Development", student: "Priya Sharma", rollNumber: "21B81A05F3", popularity: 65, url: "html/repeated.html" },
    { title: "To Do App", description: "To Do app which records your tasks.", category: "Web Development", student: "Arun Singh", rollNumber: "19B81A05H1", popularity: 100, url: "html/repeated.html" },
    { title: "Plant Watering System", description: "Automatic plant watering system using humidity sensor.", category: "IOT", student: "Neha Gupta", rollNumber: "20B81A05J4", popularity: 30, url: "html/repeated.html" },
    { title: "Water Level Checker", description: "A Device Which Checks Water Level To Avoid Floods", category: "IOT", student: "Rahul Verma", rollNumber: "21B81A05K2", popularity: 65, url: "html/repeated.html" },
    { title: "Water trash collector", description: "Collects trash from water bodies using solar", category: "IOT", student: "Ananya Reddy", rollNumber: "19B81A05L7", popularity: 50, url: "html/repeated.html" },
    { title: "Student Management System", description: "A web application to manage student data", category: "Web Development", student: "Karthik Nair", rollNumber: "20B81A05M5", popularity: 45, url: "html/repeated.html" },
    { title: "Smart Home Automation", description: "Control your home devices with a smartphone app", category: "IOT", student: "Shreya Patel", rollNumber: "21B81A05N8", popularity: 80, url: "html/repeated.html" },
    
    // Additional student projects
    { title: "E-commerce Website", description: "Online shopping platform with payment integration.", category: "Web Development", student: "Vikram Joshi", rollNumber: "19B81A05P3", popularity: 85, url: "html/repeated.html" },
    { title: "Weather App", description: "Real-time weather forecast application.", category: "Web Development", student: "Sanjana Kapoor", rollNumber: "20B81A05Q6", popularity: 60, url: "html/repeated.html" },
    { title: "ChatBot", description: "AI-powered chatbot for customer service.", category: "AI", student: "Arjun Malhotra", rollNumber: "21B81A05R9", popularity: 90, url: "html/repeated.html" },
    { title: "Gesture Controlled Robot", description: "Robot that responds to hand gestures.", category: "IOT", student: "Tanvi Desai", rollNumber: "19B81A05S1", popularity: 75, url: "html/repeated.html" },
    { title: "Virtual Reality Game", description: "Immersive VR gaming experience.", category: "Game Development", student: "Rohan Mehta", rollNumber: "20B81A05T4", popularity: 95, url: "html/repeated.html" },
    { title: "Facial Recognition System", description: "Security system using facial recognition technology.", category: "AI", student: "Ishaan Choudhary", rollNumber: "21B81A05U7", popularity: 85, url: "html/repeated.html" }
  ];

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

  // Function to perform search
  function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
      // If empty search, just go to search page
      window.location.href = "html/search.html";
      return;
    }
    
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
    
    // Store filtered projects in sessionStorage
    sessionStorage.setItem('searchResults', JSON.stringify({
      term: searchTerm,
      projects: filteredProjects
    }));
    
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

