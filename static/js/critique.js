/* Critique Skip-to-main Link - Avoid header covering content */

var skipLink = document.getElementById("skip-link");
skipLink.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("content").focus();
    window.scrollTo(0, 0);
});


/* Critique Navigation Bars - Reveal and resize bars */

var topNavBar = document.getElementById("top-nav-h");
var topNavTrigger = document.getElementById("top-nav-trigger");
var mainNavBar = document.getElementById("main-nav");
var subNavTrigger = document.getElementById("sub-nav-trigger");
var subNavBar = document.getElementById("sub-nav");
var mainNavLinksH = document.getElementById("main-nav-links-h");
var mainNavLinksV = document.getElementById("main-nav-links-v");
var subNavLinksV = document.getElementById("sub-nav-links-v");

/* Reveal the topNavBar on clicking the utmost left link */
topNavTrigger.addEventListener("click", function(e) {
    e.preventDefault();
    if (!topNavTrigger.displayAdminInput) {
        topNavBar.classList.toggle("expanded");
    } else {
        adminInput.focus();
    }
});

/* Reveal the subNavBar on clicking the utmost right link */
subNavTrigger.addEventListener("click", function (e) {
    e.preventDefault();
    subNavBar.classList.toggle("expanded");
});

/* Place the top texts link according to window width */
var widthTriggerCritiqueNavLayout = 1210;
var widthTriggerTopTextesPosition = 880;
var topTextesMain = mainNavLinksV.getElementsByClassName("top-textes")[0];
var topTextesSub = subNavLinksV.getElementsByClassName("top-textes")[0];
function setTopTextesPosition() {
    if (window.innerWidth < widthTriggerCritiqueNavLayout) {
        if (window.innerWidth < widthTriggerTopTextesPosition) {
            topTextesMain.style.display = "none";
            topTextesSub.style.display = "list-item";
        } else {
            topTextesMain.style.display = "list-item";
            topTextesSub.style.display = "none";
        }
    }
}
setTopTextesPosition();
window.addEventListener("resize", setTopTextesPosition);

/* Hide menus when scrolling down */
var lastKnownScrollPosition = 0;
var ticking = false;
window.addEventListener("scroll", function () {
    if (!ticking) {
        window.requestAnimationFrame(function () {
            if (window.scrollY > lastKnownScrollPosition) {
                topNavBar.classList.remove("expanded");
                subNavBar.classList.remove("expanded");
            }
            lastKnownScrollPosition = window.scrollY;
            ticking = false;
        });
        ticking = true;
    }
});

/* Hide menus when clicking outside the menus */
var contentWrap = document.getElementById("content-wrap");
contentWrap.addEventListener("click", function () {
    topNavBar.classList.remove("expanded");
    subNavBar.classList.remove("expanded");
});

/* Hide menus when clicking on the transparent part of the subNavBar */
subNavLinksV.addEventListener("click", function (e) {
    e.stopPropagation();
});
subNavBar.addEventListener("click", function () {
    if (subNavBar.classList.contains("v")) {
        topNavBar.classList.remove("expanded");
        subNavBar.classList.remove("expanded");
    }
});


/* Critique Search Bar - Reveal search bar */

var critiqueSearch = document.getElementById("critique-search");
var critiqueSearchButton = document.getElementById("critique-search-button");
var critiqueSearchEndButton = document.getElementById("critique-searchend-button");
var critiqueSearchM = document.getElementById("critique-search-m");
var critiqueSearchEndButtonM = document.getElementById("critique-searchend-button-m");

var searchInput = document.getElementById("critique-search-input");
var searchInputM = document.getElementById("critique-search-input-m");
var searchPlaceholderPrev = document.getElementById("critique-search-placeholder-prev");
var searchPlaceholderNext = document.getElementById("critique-search-placeholder-next");
var searchResultsList = document.getElementById("critique-search-results-list");
var searchResultsListM = document.getElementById("critique-search-results-list-m");
var critiqueSearchX; var searchInputX; var searchResultsListX;   /* agnostic versions */

var widthTriggerMobileSearch = 700;
getSearchInput = function() {
    return ((window.innerWidth > widthTriggerMobileSearch)? searchInput : searchInputM ) }
function updateAgnosticSearchElements() {
    searchInputX = getSearchInput();
    critiqueSearchX = searchInputX.parentElement.parentElement.parentElement;
    searchResultsListX = critiqueSearchX.getElementsByTagName("div")[1].firstElementChild;
}


function hideSearchInput(prev) {
    updateAgnosticSearchElements();
    if (!critiqueSearchX.classList.contains("expanded")) { return }

    while (searchResultsListX.lastChild) {
        searchResultsListX.removeChild(searchResultsListX.lastChild);
    }
    searchInputX.value = "";
    critiqueSearchX.classList.remove("expanded");
    if (searchInputX == searchInput) {
        subNavTrigger.classList.remove("reduced");
    } else {
        searchInputM.setAttribute("tabindex", "-1");
        if (prev) {
            searchPlaceholderPrev.focus();
        } else {
            searchPlaceholderNext.focus();
        }
    }
}

critiqueSearchButton.addEventListener("click", function () {
    getSearchInput().focus();
});
critiqueSearchEndButton.addEventListener("click", hideSearchInput);
critiqueSearchEndButtonM.addEventListener("click", hideSearchInput);

searchInput.addEventListener("focus", function () {
    if (getSearchInput() == searchInputM) {
        searchInputM.focus();
    } else {
        subNavTrigger.classList.add("reduced");
        critiqueSearch.classList.add("expanded");
        searchResultsList.parentElement.classList.add("expanded");
        searchResultsList.classList.add("highlight-ok");
    }
});
searchInputM.addEventListener("focus", function () {
    topNavBar.classList.remove("expanded");
    subNavBar.classList.remove("expanded");
    critiqueSearchM.classList.add("expanded");
    searchInputM.setAttribute("tabindex", "0");
});

searchInputM.addEventListener("keydown", function (e) {
    if (e.keyCode == 9) {
        updateAgnosticSearchElements();
        if (e.shiftKey) {
            hideSearchInput(true);
        } else if (searchResultsListX.children.length == 0) {
            hideSearchInput(false);
        }
    }
});
document.addEventListener("click", function () {
    updateAgnosticSearchElements();
    if (!critiqueSearchX.contains(document.activeElement)) {
        if (critiqueSearchX == critiqueSearch) {
            searchResultsList.parentElement.classList.remove("expanded");
        } else {
            hideSearchInput();
        }
    }
});

searchResultsList.addEventListener("mouseleave", function () {
    searchResultsList.classList.remove("highlight-ok"); });
searchResultsListM.addEventListener("mouseleave", function () {
    searchResultsListM.classList.remove("highlight-ok"); });


/* Critique Search Bar - Navigate with arrow keys and ESC */

var activeElementSearch;
document.addEventListener("keydown", function (e) {
    if (e.keyCode == 27) { hideSearchInput(); return }

    activeElementSearch = document.activeElement;
    updateAgnosticSearchElements();
    if (critiqueSearchX.contains(activeElementSearch)) {
        if (e.keyCode == 38) {
            e.preventDefault();
            if (activeElementSearch != searchInputX) {
                if (activeElementSearch == searchResultsListX.firstChild.firstChild) {
                    searchInputX.focus();
                } else {
                    activeElementSearch.parentElement.previousSibling.firstChild.focus();
                }
            }
        } else if (e.keyCode == 40) {
            e.preventDefault();
            if (activeElementSearch == searchInputX) {
                if (!searchResultsListX.firstChild.classList.contains("empty")) {
                    searchResultsListX.firstChild.firstChild.focus();
                }
            } else {
                if (activeElementSearch != searchResultsListX.lastChild.firstChild) {
                    activeElementSearch.parentElement.nextSibling.firstChild.focus();
                }
            }
        }
    }
});


/* Critique Search Bar - AJAX Search */

var emptyElementSearchResult = document.createElement("li");
emptyElementSearchResult.classList.add("empty");
emptyElementSearchResult.innerHTML = "Aucun résultat";

function createElementSearchResult() {
    var li = document.createElement("li");
    var a = document.createElement("a"); li.appendChild(a);
    var p0 = document.createElement("p"); a.appendChild(p0);
    var div = document.createElement("div"); a.appendChild(div);
    var p1 = document.createElement("p"); div.appendChild(p1);
    var p2 = document.createElement("p"); div.appendChild(p2);
    return li
}

function setElementSearchResult(li, res) {
    var a = li.firstChild;
    a.setAttribute("href", "/critique/oeuvre/" + res.slug);
    var p0 = a.firstChild;
    p0.innerHTML = res.vf;
    var div = a.lastChild; var p1 = div.firstChild; var p2 = div.lastChild;
    if (res.vo) {
        p1.innerHTML = res.vo;
    } else {
        p1.innerHTML = "";
    }
    p2.innerHTML = "(" + res.year + ")";

    a.addEventListener("mouseenter", function (e) {
        if (document.activeElement == e.target) {
            e.target.parentElement.parentElement.classList.add("highlight-ok");
        } else {
            e.target.focus();
        }
    });
    a.addEventListener("focus", function (e) {
        e.target.parentElement.parentElement.classList.add("highlight-ok");
    });
}

var currentSearchRequest = new XMLHttpRequest();
function displaySearchResults(e) {
    updateAgnosticSearchElements();

    if (e.target.value.length > 2) {

        currentSearchRequest.abort();
        var request = new XMLHttpRequest();
        request.open("GET", "/critique/search/" + e.target.value, true);
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        request.onreadystatechange = function() {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                var response = JSON.parse(request.responseText);

                if (response.length == 0) {

                    if ((!searchResultsListX.firstChild) ||
                        ((searchResultsListX.firstChild) &&
                         (!searchResultsListX.firstChild.classList.contains("empty")))) {
                        while (searchResultsListX.lastChild) {
                            searchResultsListX.removeChild(searchResultsListX.lastChild);
                        }
                        searchResultsListX.appendChild(emptyElementSearchResult);
                    }

                } else {

                    if ((searchResultsListX.firstChild) &&
                        (searchResultsListX.firstChild.classList.contains("empty"))) {
                        searchResultsListX.removeChild(searchResultsListX.firstChild);
                    }

                    var diff = response.length - searchResultsListX.children.length;
                    if (diff > 0) {
                        for (var i=0; i<diff; i++) {
                            searchResultsListX.appendChild(createElementSearchResult());
                        }
                        if (searchResultsListX == searchResultsListM) {
                            var lastLink = searchResultsListX.lastChild.firstChild;
                            lastLink.addEventListener("keydown", function (e) {
                                if (!e.shiftKey && (e.keyCode == 9)) {
                                    hideSearchInput();
                                }
                            });
                        }
                    } else if (diff < 0) {
                        for (var i=diff; i<0; i++) {
                            searchResultsListX.removeChild(searchResultsListX.firstChild);
                        }
                    }

                    for (var i=0; i<response.length; i++) {
                        var li = searchResultsListX.children[i];
                        setElementSearchResult(li, response[i]);
                    }
                }
            }
        }

        currentSearchRequest = request;
        request.send();

    } else {
        while (searchResultsListX.lastChild) {
            searchResultsListX.removeChild(searchResultsListX.lastChild);
        }
    }
}

searchInput.addEventListener("input", displaySearchResults);
searchInputM.addEventListener("input", displaySearchResults);


/* Filter Bar - Highlight selected media type or year */

var filterBar = document.getElementsByClassName("filter-navbar")[0];
if (filterBar) {
    var filter = filterBar.classList[2];
    var links = filterBar.getElementsByTagName("li");
    for (var i=0; i<links.length; i++) {
        var link = links[i].getElementsByTagName("a")[0]
        if (link.getAttribute("desc") == filter) {
            link.classList.add("selected");
        }
    }
}


/* Forms - Validate form inputs */

var oeuvreFormEmpty = document.getElementById("oeuvre_form_empty");
if (oeuvreFormEmpty) {
    titleVf = document.getElementById("id_empty_title_vf");
    titleVo = document.getElementById("id_empty_title_vo");
    titleAlt = document.getElementById("id_empty_title_alt");
    artists = document.getElementById("id_empty_artists");
    year = document.getElementById("id_empty_year");
    imdbId = document.getElementById("id_empty_imdb_id");
    validatedElements = [
        [titleVf, x => ((x.length > 1000) || (x == ""))],
        [titleVo, x => (x.length > 1000)],
        [titleAlt, x => (x.length > 1000)],
        [artists, x => ((x.length > 1000) || (x == ""))],
        [year, x => ((x > 2100) || (x == ""))],
        [imdbId, x => !x.match(/^tt\d{7,8}$|^$/)]
    ];
    addInputsListener(validatedElements, true);
    addSubmitListener(oeuvreFormEmpty, validatedElements);
}

var oeuvreForm = document.getElementById("oeuvre_form");
if (oeuvreForm) {
    titleVf = document.getElementById("id_title_vf");
    titleVo = document.getElementById("id_title_vo");
    titleAlt = document.getElementById("id_title_alt");
    artists = document.getElementById("id_artists");
    year = document.getElementById("id_year");
    imdbId = document.getElementById("id_imdb_id");
    validatedElements = [
        [titleVf, x => ((x.length > 1000) || (x == ""))],
        [titleVo, x => (x.length > 1000)],
        [titleAlt, x => (x.length > 1000)],
        [artists, x => ((x.length > 1000) || (x == ""))],
        [year, x => ((x > 2100) || (x == ""))],
        [imdbId, x => !x.match(/^tt\d{7,8}$|^$/)]
    ];
    addInputsListener(validatedElements, true);
    addSubmitListener(oeuvreForm, validatedElements);
}

var commentFormEmpty = document.getElementById("comment_form_empty");
if (commentFormEmpty) {
    date = document.getElementById("id_empty_date");
    comment_content = document.getElementById("id_empty_content");
    validatedElements = [
        [date, x => (x == "")],
        [comment_content, x => (x == "")]
    ];
    addInputsListener(validatedElements, true);
    addSubmitListener(commentFormEmpty, validatedElements);
}

var commentForm = document.getElementById("comment_form");
if (commentForm) {
    date = document.getElementById("id_date");
    comment_content = document.getElementById("id_content");
    validatedElements = [
        [date, x => (x == "")],
        [comment_content, x => (x == "")]
    ];
    addInputsListener(validatedElements, true);
    addSubmitListener(commentForm, validatedElements);
}

var cinemaForm = document.getElementById("cinema_form");
if (cinemaForm) {
    nameInput = document.getElementById("id_name");
    comment = document.getElementById("id_comment");
    visited = document.getElementById("id_visited");
    validatedElements = [
        [nameInput, x => (x == "")],
        [comment, x => (x == "")],
        [visited, x => (x == "")]
    ];
    addInputsListener(validatedElements, true);
    addSubmitListener(cinemaForm, validatedElements);
}

var seanceFormEmpty = document.getElementById("seance_form_empty");
if (seanceFormEmpty) {
    cinema = document.getElementById("id_empty_seance_cinema");
    date = document.getElementById("id_empty_seance_date");
    hour = document.getElementById("id_empty_seance_hour");
    validatedElements = [
        [cinema, x => ((x.length > 1000) || (x == ""))],
        [date, x => (x == "")],
        [hour, x => ((x.length != 5) || (x.charAt(2) != ":") || (parseInt(x.charAt(0), 10) > 2) || (parseInt(x.charAt(3), 10) > 5))],
    ];
    addInputsListener(validatedElements, true);

    /* exactly one of these must be filled */
    filmSlug = document.getElementById("id_empty_seance_film_slug");
    seanceTitle = document.getElementById("id_empty_seance_seance_title");

    validatedElementsComplete = validatedElements.slice()
    validatedElementsComplete.push([filmSlug, null]);
    validatedElementsComplete.push([seanceTitle, null]);
    addSubmitListener(seanceFormEmpty, validatedElementsComplete);

    warningOnElementIf(filmSlug, true);
    warningOnElementIf(seanceTitle, true);
    filmSlug.addEventListener("blur", function(e) {
        var seanceFormError = (((filmSlug.value == "") && (seanceTitle.value == "")) ||
                               ((filmSlug.value != "") && (seanceTitle.value != "")))
        warningOnElementIf(filmSlug, seanceFormError);
        warningOnElementIf(seanceTitle, seanceFormError);
    });
    seanceTitle.addEventListener("blur", function(e) {
        var seanceFormError = (((filmSlug.value == "") && (seanceTitle.value == "")) ||
                               ((filmSlug.value != "") && (seanceTitle.value != "")))
        warningOnElementIf(filmSlug, seanceFormError);
        warningOnElementIf(seanceTitle, seanceFormError);
    });
    filmSlug.addEventListener("input", function(e) {
        var seanceFormError = (((filmSlug.value == "") && (seanceTitle.value == "")) ||
                               ((filmSlug.value != "") && (seanceTitle.value != "")))
        warningOnElementIf(filmSlug, seanceFormError);
        warningOnElementIf(seanceTitle, seanceFormError);
    });
    seanceTitle.addEventListener("input", function(e) {
        var seanceFormError = (((filmSlug.value == "") && (seanceTitle.value == "")) ||
                               ((filmSlug.value != "") && (seanceTitle.value != "")))
        warningOnElementIf(filmSlug, seanceFormError);
        warningOnElementIf(seanceTitle, seanceFormError);
    });
}


/* Critique Admin Codes - Register admin inputs */

function deployAdminInputLogic() {
    function displayAdminInput() {
        topNavTrigger.displayAdminInput = true;
        adminInput.style.display = "initial"; }
    function hideAdminInput() {
        adminInput.style.display = "none"; }

    var admin_cnt = 0;
    topNavTrigger.addEventListener("touchstart", function (e) {
        if (++admin_cnt >= 5) {
            displayAdminInput();
            admin_cnt = 0;
        }
    });

    adminInput.addEventListener("input", function (e) {
        cachedCode = e.target.value;
        if (activateOverlayIf(e)) { hideAdminInput(); }
    });
}


codes["edito"] = oeuvreForm;
codes["addo"] = oeuvreFormEmpty;
codes["editc"] = commentForm;
codes["addc"] = commentFormEmpty;
codes["editi"] = cinemaForm;
codes["adde"] = seanceFormEmpty;

for (var key in codes) {
    if (codes.hasOwnProperty(key)) {
        if ((["s", "login", "logout", "admin"].indexOf(key) < 0) && (codes[key])) {
            codes[key].addEventListener("reset", function (e) {
                e.preventDefault();
                e.target.parentElement.classList.remove("revealed");
                activeCode = "";
            });
        }
    }
}
