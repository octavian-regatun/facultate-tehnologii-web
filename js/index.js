//
//
// FADERS OBSERVER
//
//


const faders = document.querySelectorAll('.fader');
const optionsFaders = {
    root: null,
    rootMargin: "-20%",
    threshold: 0.5
};

const observerFaders = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            entry.target.style.opacity = "0.5";
        }
        else {
            entry.target.style.opacity = "1";
            observerFaders.unobserve(entry.target);
        }
    });
}, optionsFaders);


faders.forEach(fader => {
    observerFaders.observe(fader);
});


//
//
// TRANSLATE X OBSERVER
//
//

const translaters = document.querySelectorAll('.translateX');
const optionsTranslaters = {
    root: null,
    rootMargin: "-20%",
    threshold: 0
};

const observerTranslaters = new IntersectionObserver(function (entries, observer) {
    entries.forEach((entry, index) => {
        if (!entry.isIntersecting) {
            if (index % 2 == 1) {
                entry.target.style.transform = "translateX(-50%)";
            } else {
                entry.target.style.transform = "translateX(50%)";
            }

        }
        else {
            entry.target.style.transform = "translateX(0%)";
            observerTranslaters.unobserve(entry.target);
        }
    });
}, optionsTranslaters);


translaters.forEach(translater => {
    observerTranslaters.observe(translater);
});