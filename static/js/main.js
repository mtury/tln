var isIE10 = 'behavior' in document.documentElement.style && '-ms-user-select' in document.documentElement.style;
var isIE11 = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style;


/* Top Navigation - Deactivate hoverable photos link on mobile devices */

function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints;
}

var topNavPhotoButton = document.getElementById("photos-dropdown-link");
if (isTouchDevice()) {
    topNavPhotoButton.addEventListener("click", function (e) {
        e.preventDefault();
    });
}


/* Top Navigation - Access admin codes input on mobile devices */

var dummyInput = document.getElementById("dummy_input");
if (isTouchDevice()) {
    topNavPhotoButton.addEventListener("touchstart", function (e) {
        if (document.activeElement == e.target) {
            e.preventDefault();
            dummyInput.focus();
        }
    });
}


/* Top Navigation - Enable tab navigation with photos dropdown menu */

var photosDropdownMenu = document.getElementById("photos-dropdown-menu");

topNavPhotoButton.addEventListener("focus", function () {
    photosDropdownMenu.classList.add("expanded");
});

function collapseDropdownMenu () {
    if (!photosDropdownMenu.contains(document.activeElement)) {
        photosDropdownMenu.classList.remove("expanded");
    }
}

document.addEventListener("click", collapseDropdownMenu)
document.addEventListener("focusin", collapseDropdownMenu)


/* Overlays - Reveal appropriate overlay through keyboard inputs */

function getSearchInput() {
    return null;
}

function focusOn(overlay, objId) {
    objInput = document.getElementById(objId);
    $(overlay).one("transitionend",
        function() { objInput.focus(); });
}

var loginForm = document.getElementById("login_form");
var codes = {"login": loginForm,
             "logout": true,
             "admin": true,
             "s": true }

var activeCode = "";
var cachedCode = "";

function activateOverlayIf(e) {
    var possibleCode = false;
    var codeFound = false;
    for (var key in codes) {
        if (codes.hasOwnProperty(key)) {
            if (key.startsWith(cachedCode)) {
                possibleCode = true;
                if ((cachedCode === key) && (codes[key])) {
                    activeCode = key;
                    codeFound = true;
                }
            }
        }
    }
    if (!possibleCode) {
        cachedCode = "";
    } else if (codeFound) {
        cachedCode = "";
        var input = getSearchInput();
        if (activeCode == "s") {
            activeCode = "";
            if (input != null) {
                var searchFocusAfterEsc = ((document.activeElement == input) &&
                                           (!input.parentElement.parentElement.parentElement.classList.contains("expanded")));
                if ((document.activeElement != input) | searchFocusAfterEsc) {
                    e.preventDefault();
                    if (searchFocusAfterEsc) { input.blur(); }
                    input.focus();
                }
            }
        } else {
            if ((input != null) &&
                (document.activeElement == input) &&
                (input.parentElement.parentElement.parentElement.classList.contains("expanded"))) { return }
            if (activeCode == "logout") {
                activeCode = "";
                if (userIsAuthenticated) { window.location.href = "/logout"; }
            } else if (activeCode == "admin") {
                activeCode = "";
                if (userIsSuperuser) { window.location.href = "/admin"; }
            } else if (activeCode == "s") {
                activeCode = "";
                var input = getSearchInput();
                if (input != null) {
                    var searchFocusAfterEsc = ((document.activeElement == input) &&
                                               (!input.parentElement.parentElement.parentElement.classList.contains("expanded")));
                    if ((document.activeElement != input) | searchFocusAfterEsc) {
                        e.preventDefault();
                        if (searchFocusAfterEsc) { input.blur(); }
                        input.focus();
                    }
                }
            } else {
                var overlay = codes[activeCode].parentElement;
                overlay.classList.add("revealed");
                if (activeCode == "login") { e.preventDefault(); focusOn(overlay, "id_username"); }
                else if (activeCode == "adds") { e.preventDefault(); focusOn(overlay, "id_empty_seance_cinema"); }
            }
        }
    }
}

if (isTouchDevice()) {
    dummyInput.addEventListener("input", function (e) {
        cachedCode += e.target.value;
        e.target.value = ""
        activateOverlayIf(e);
    });
} else {
    document.addEventListener("keydown", function (e) {
        if (!activeCode) {
            var k = e.keyCode;
            var keyCode = (96 <= k && k <= 105)? k-48 : k;
            cachedCode += String.fromCharCode(keyCode).toLowerCase();
            activateOverlayIf(e);
        }
    });
}

document.addEventListener("keydown", function (e) {
    if (activeCode && (e.keyCode == 27)) {      // ESC keyCode
        codes[activeCode].parentElement.classList.remove("revealed");
        activeCode = "";
    }
});

if (loginForm) {
    loginForm.addEventListener("reset", function (e) {
        e.target.parentElement.classList.remove("revealed");
        activeCode = "";
    });
}


/* Login - Show login prompt on appropriate URLs */

var hash = window.location.hash.substr(1);

if (hash == "login") {
    loginForm.parentElement.classList.add("revealed");
    focusOn(loginForm.parentElement, "id_username");
    activeCode = "login";
}


/* Forms - Validate form inputs */

function warningOnElementIf(elem, test) {
    if (test) {
        elem.classList.add("bad-input");
    } else {
        elem.classList.remove("bad-input");
    }
}

function addInputListener(element, atInit) {
    if (atInit) {
        warningOnElementIf(element[0],
                           element[1](element[0].value));
    }
    element[0].addEventListener("blur", function (e) {
        warningOnElementIf(e.target, element[1](e.target.value));});
    element[0].addEventListener("input", function (e) {
        warningOnElementIf(e.target, element[1](e.target.value));});
}

function addInputsListener(validatedElements, atInit) {
    for (i=0; i<validatedElements.length; i++) {
        addInputListener(validatedElements[i], atInit);
    }
}

function addSubmitListener(form, validatedElements) {
    form.addEventListener("submit", function (e) {
        var dataOk = true;
        for (i=0; i<validatedElements.length; i++) {
            if (validatedElements[i][0].classList.contains("bad-input")) {
                dataOk = false;
            }
        };
        if (!dataOk) {
            e.preventDefault();
            // stop the AJAX submit handler in tln.js
            e.stopImmediatePropagation();
        }
    });
}


/* Pagination - Navigate with arrow keys */

var pagination = document.getElementById("pagination");
if (pagination) {
    document.addEventListener("keydown", function (e) {
        if (getSearchInput() != document.activeElement) {
            if ((e.keyCode == 37) && prevPageUrl && !(activeCode)) {
                window.location.href = prevPageUrl;
            } else if ((e.keyCode == 39) && nextPageUrl && !(activeCode)) {
                window.location.href = nextPageUrl;
            }
        }
    });
}
