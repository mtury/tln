/* Blog Side Menu - On an entry page, lower opacity when scrolling down */

if (document.body.classList.contains("entry")) {
    var header = document.getElementById("header");

    window.addEventListener("scroll", function() {
        if (sidebar.contains(document.activeElement) ||
            header.contains(document.activeElement)) {
        // keep full opacity when tab-navigating the sidebar or top menu
            sidebar.classList.remove("semihidden");
        } else {
            if (window.scrollY == 0) {
                sidebar.classList.remove("semihidden");
            } else {
                sidebar.classList.add("semihidden");
            }
        }
    });

    window.addEventListener("click", function() {
        if (window.scrollY != 0) {
            if (sidebar.contains(document.activeElement) ||
                header.contains(document.activeElement)) {
                    sidebar.classList.remove("semihidden");
            } else {
                sidebar.classList.add("semihidden");
            }
        }
    });

    document.addEventListener("keyup", function(e) {
        if ((e.keyCode == 9) && (window.scrollY != 0)) {
            if (sidebar.contains(document.activeElement) ||
                header.contains(document.activeElement)) {
                    sidebar.classList.remove("semihidden");
            } else {
                sidebar.classList.add("semihidden");
            }
        }
    });
}


/* Blog Archive Widget - Expand/Collapse entries */

var widgetArchives = document.getElementById("widget-archives");

function addToggleListener(toggle) {
    toggle.addEventListener("click", function(e) {
        e.preventDefault();
        if (toggle.classList.contains("expanded")) {
            toggle.classList.add("collapsed");
            toggle.classList.remove("expanded");
        } else {
            toggle.classList.add("expanded");
            toggle.classList.remove("collapsed");
        }
    });
}

toggles = widgetArchives.getElementsByClassName("toggle");
[].forEach.call(toggles, addToggleListener);
