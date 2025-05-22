document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading beverages data...");

    // Fetch beverages data from beverages.json
    fetch("../json/beverages.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load beverages.json: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("beverages JSON Loaded Successfully", data);
            populatebeveragesMenu(data);
        })
        .catch(error => console.error("Error fetching beverages.json:", error));
});

// Function to populate beverages menu dynamically
function populatebeveragesMenu(data) {
    const container = document.getElementById("beverages-menu");

    if (!container) {
        console.error("Container with ID 'beverages-menu' not found.");
        return;
    }

    data.forEach(dish => {
        const dishElement = document.createElement("div");
        dishElement.classList.add("dish");
        let shortDesc = dish.description.length > 30 ? dish.description.substring(0, 30) + "..." : dish.description;
        let fullDesc = dish.description;

        dishElement.innerHTML = `
            <div class="veg-container">
                <span class="circle ${dish.veg ? 'veg' : 'non-veg'}"></span>
                <span class="${dish.veg ? 'vegetarian' : 'non-vegetarian'}">
                    ${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                </span>
            </div>

            <div class="dish-content">
                <div class="dish-details">
                    <div class="dish-header">
                        <span class="dish-name">${dish.name}</span>
                    </div>
                    <div class="dish-pricing">
                        <span class="dish-price">Rs ${dish.price}</span>
                    </div>
                    <span class="dish-rating">${generateStars(dish.rating)} (${dish.rating})</span>
                    <p class="dish-description" 
                        data-full="${fullDesc}" 
                        data-short="${shortDesc}">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>               
                   <img src="${dish.image}" alt="${dish.name}" class="lazy-img" decoding="async">                
                </div>
                `;
                // <img src="${dish.image}" alt="${dish.name}" class="lazy-img" loading="lazy"/>
                // <img src="${dish.image}" alt="${dish.name}" class="lazy-img" loading="lazy" decoding="async" data-nimg="fill">  
        container.appendChild(dishElement);
    });
    handleReadMore();
    console.log("beverages Menu Loaded Successfully");
}
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "getData") {
//         fetchSomeData().then(data => {
//             sendResponse({ success: true, data });
//         }).catch(error => {
//             sendResponse({ success: false, error });
//         });
//         return true; // Ensures sendResponse is called asynchronously
//     }
// });

document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded");
});

// self.addEventListener('fetch', event => {
//     event.respondWith(fetch(event.request));
// });


// async function fetchData() {
//     try {
//         let response = await fetch("beverages.html");
//         let data = await response.text();
//         console.log(data);
//     } catch (error) {
//         console.error("Fetch error:", error);
//     }
// }
// fetchData();

fetch('../json/header.json')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.restaurant-name').textContent = data.restaurantName;
        document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
    })
    .catch(error => console.error('Error loading header data:', error));

// Function to handle "Read More" functionality
function handleReadMore() {
    if (window.innerWidth >= 480) return;

    document.querySelectorAll(".dish-description").forEach(desc => {
        let shortText = desc.getAttribute("data-short");
        let fullText = desc.getAttribute("data-full");

        desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';

        desc.addEventListener("click", function (event) {
            if (event.target.classList.contains("read-more")) {
                desc.innerHTML = fullText + ' <span class="read-less" style="color: #31B404; cursor: pointer;">Read Less</span>';
            } else if (event.target.classList.contains("read-less")) {
                desc.innerHTML = shortText + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>';
            }
        });
    });
}
// Function to lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll(".lazy-img");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src; // Load actual image
                    observer.unobserve(img); // Stop observing after loading
                }
            });
        }, {
            rootMargin: "100px", // Preload images slightly before they appear
            threshold: 0.1
        });

        images.forEach(img => observer.observe(img));
    } else {
        // Fallback for older browsers (loads all images at once)
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Call lazyLoadImages after images are added dynamically
lazyLoadImages();

// function generateStars(rating) {
//     let fullStars = Math.floor(rating);
//     let halfStar = rating % 1 !== 0;
//     let starHTML = "";
//     for (let i = 0; i < fullStars; i++) {
//         starHTML += `<i class="fa fa-star" style="color: gold;"></i> `;
//     }
//     if (halfStar) {
//         starHTML += `<i class="fa fa-star-half" style="color: gold;"></i> `;
//     }
//     return starHTML;
// }

function generateStars(rating) {
    let fullStars = Math.floor(rating);
    let halfStar = rating % 1 !== 0;
    let totalStars = 5; // Standard 5-star rating system
    let starHTML = "";

    for (let i = 0; i < fullStars; i++) {
        starHTML += `<span class="star full"></span>`;
    }

    if (halfStar) {
        starHTML += `<span class="star half"></span>`;
    }

    let remainingStars = totalStars - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
        starHTML += `<span class="star"></span>`;
    }

    return starHTML;
}

// Example Usage:
// document.getElementById("star-container").innerHTML = generateStars(4.5);