document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading soup data...");

    // Fetch soup data from soup.json
    fetch("../json/soup.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load soup.json: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Soup JSON Loaded Successfully", data);
            populateSoupMenu(data);
        })
        .catch(error => console.error("Error fetching soup.json:", error));
});

// Function to populate soup menu dynamically
function populateSoupMenu(data) {
    const container = document.getElementById("soup-menu");

    if (!container) {
        console.error("Container with ID 'soup-menu' not found.");
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
              <img src="${dish.image}" alt="${dish.name}" class="lazy-img" decoding="async" >

            </div>
        `;

        container.appendChild(dishElement);
    });
    handleReadMore();

    console.log("Soup Menu Loaded Successfully");
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
//======================================================//
//charmi added code//
//======================================================//
document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading soup data...");

    // Add modal styles right away
    addModalStyles();

    // Check if container exists before fetching data
    const soupContainer = document.getElementById("soup-menu");

    if (!soupContainer) {
        console.error("Soup menu container not found on page. Check your HTML.");
        return;
    }

    // Fallback data in case JSON loading fails
    const fallbackSoupData = [
        {
            name: "Tomato Soup",
            price: 120,
            description: "Creamy tomato soup with herbs and spices.",
            image: "../images/soup/tomato-soup.jpg",
            rating: 4.3,
            veg: true
        },
        {
            name: "Sweet Corn Soup",
            price: 130,
            description: "Classic sweet corn soup with vegetables.",
            image: "../images/soup/sweet-corn-soup.jpg",
            rating: 4.5,
            veg: true
        },
        {
            name: "Hot and Sour Soup",
            price: 140,
            description: "Spicy and tangy soup with vegetables and tofu.",
            image: "../images/soup/hot-and-sour-soup.jpg",
            rating: 4.4,
            veg: true
        },
        {
            name: "Chicken Sweet Corn Soup",
            price: 150,
            description: "Sweet corn soup with tender chicken pieces.",
            image: "../images/soup/chicken-sweet-corn-soup.jpg",
            rating: 4.7,
            veg: false
        },
        {
            name: "Chicken Hot and Sour Soup",
            price: 160,
            description: "Spicy and tangy soup with chicken and vegetables.",
            image: "../images/soup/chicken-hot-and-sour-soup.jpg",
            rating: 4.6,
            veg: false
        }
    ];

    // Fetch soup data from soup.json
    fetch("../json/soup.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load soup.json: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Soup JSON Loaded Successfully", data);
            populateSoupMenu(data);
            
            // Add click handlers to all dish images after populating menu
            setTimeout(addDishClickHandlers, 500);
        })
        .catch(error => {
            console.error("Error fetching soup.json:", error);
            // Use fallback data if fetch fails
            console.log("Using fallback soup data");
            populateSoupMenu(fallbackSoupData);
            
            // Add click handlers to all dish images after populating menu
            setTimeout(addDishClickHandlers, 500);
        });
});

// Function to populate soup menu dynamically
function populateSoupMenu(data) {
    const container = document.getElementById("soup-menu");

    if (!container) {
        console.error("Container with ID 'soup-menu' not found.");
        return;
    }

    container.innerHTML = ""; // Clear previous content if any

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
                        data-short="${shortDesc}"
                        data-category="soup">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>
                <img src="${dish.image}" alt="${dish.name}" class="dish-image-clickable" decoding="async">
            </div>
        `;

        container.appendChild(dishElement);
    });
    handleReadMore();

    console.log("Soup Menu Loaded Successfully");
}

// Function to add click handlers to all dish images
function addDishClickHandlers() {
    const dishImages = document.querySelectorAll('.dish-image-clickable');
    dishImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            const dishElement = this.closest('.dish');
            if (!dishElement) return;
            
            const dishName = dishElement.querySelector('.dish-name').textContent;
            const dishPrice = dishElement.querySelector('.dish-price').textContent;
            const dishDesc = dishElement.querySelector('.dish-description').getAttribute('data-full');
            const dishCategory = dishElement.querySelector('.dish-description').getAttribute('data-category');
            const dishRating = dishElement.querySelector('.dish-rating').textContent.match(/\(([^)]+)\)/)[1];
            const dishImage = this.getAttribute('src');
            const isVeg = dishElement.querySelector('.vegetarian') !== null;
            
            // Show dish modal with extracted data
            showDishModal({
                name: dishName,
                price: dishPrice,
                description: dishDesc,
                image: dishImage,
                rating: dishRating,
                veg: isVeg,
                category: dishCategory
            });
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

// Function to show dish modal with related dishes
function showDishModal(dish) {
    console.log("Opening modal for dish:", dish.name, "Image path:", dish.image);
    
    // Create modal container if it doesn't exist
    let modalContainer = document.querySelector('.dish-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'dish-modal-container';
        document.body.appendChild(modalContainer);
    }
    
    // Find related dishes based on vegetarian status
    const relatedDishes = findRelatedDishes(dish.veg, dish.name);
    console.log(`Found ${relatedDishes.length} related dishes for ${dish.name}`);
    
    // Generate related dishes HTML
    let relatedDishesHTML = '';
    if (relatedDishes.length > 0) {
        relatedDishesHTML = `
            <div class="related-dishes">
                <h3>Related Soups</h3>
                <div class="related-dishes-container">
                    ${relatedDishes.map(relDish => `
                        <div class="related-dish" data-dish='${JSON.stringify(relDish).replace(/'/g, "&apos;")}'>
                            <img src="${relDish.image}" alt="${relDish.name}" class="related-dish-image">
                            <div class="related-dish-info">
                                <div class="related-dish-name">${relDish.name}</div>
                                <div class="related-dish-price">${relDish.price}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Set modal content
    modalContainer.innerHTML = `
        <div class="dish-modal">
            <div class="modal-header">
                <h2>${dish.name}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-content">
                <div class="modal-image">
                    <img src="${dish.image}" alt="${dish.name}" onerror="this.onerror=null; this.src='../images/default-dish.jpg';">
                    <div class="veg-indicator">
                        <span class="circle ${dish.veg ? 'veg' : 'non-veg'}"></span>
                        <span class="${dish.veg ? 'vegetarian' : 'non-vegetarian'}">
                            ${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                        </span>
                    </div>
                </div>
                <div class="modal-details">
                    <div class="modal-price">${dish.price}</div>
                    <div class="modal-rating">${generateStars(dish.rating)} (${dish.rating})</div>
                    <div class="modal-description">${dish.description}</div>
                </div>
            </div>
            ${relatedDishesHTML}
        </div>
    `;
    
    // Show modal
    modalContainer.style.display = 'flex';
    
    // Add event listeners
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
        modalContainer.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
        }
    });
    
    // Add click event to related dishes
    const relatedDishElements = modalContainer.querySelectorAll('.related-dish');
    relatedDishElements.forEach(element => {
        element.addEventListener('click', function() {
            try {
                const relatedDishData = JSON.parse(this.getAttribute('data-dish'));
                console.log("Clicked related dish:", relatedDishData.name);
                // Close current modal
                modalContainer.style.display = 'none';
                // Open new modal with related dish
                setTimeout(() => {
                    showDishModal(relatedDishData);
                }, 100);
            } catch (error) {
                console.error("Error parsing related dish data:", error);
            }
        });
    });
}

// Function to find related dishes
function findRelatedDishes(isVeg, currentDishName) {
    const relatedDishes = [];
    const allDishes = document.querySelectorAll('#soup-menu .dish');

    allDishes.forEach(dishElement => {
        const name = dishElement.querySelector('.dish-name')?.textContent.trim();
        if (!name || name === currentDishName) return;

        const dishVeg = dishElement.querySelector('.vegetarian') !== null;
        // Only include dishes with the same vegetarian status
        if (dishVeg !== isVeg) return;

        const price = dishElement.querySelector('.dish-price')?.textContent.trim();
        const description = dishElement.querySelector('.dish-description')?.getAttribute('data-full');
        const image = dishElement.querySelector('img')?.getAttribute('src');
        const rating = dishElement.querySelector('.dish-rating')?.textContent.match(/\(([^)]+)\)/)?.[1] || '4.0';

        relatedDishes.push({
            name,
            price,
            description,
            image,
            rating,
            veg: dishVeg,
            category: 'soup'
        });
    });

    // Limit to 4 related dishes
    return relatedDishes.slice(0, 4);
}

// Add CSS for the modal
function addModalStyles() {
    // Check if styles are already added
    if (document.getElementById('dish-modal-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dish-modal-styles';
    styleElement.textContent = `
        .dish-modal-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .dish-modal {
            background-color: white;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            border-radius: 8px;
            overflow-y: auto;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 24px;
        }
        
        .close-modal {
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .modal-content {
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        @media (min-width: 768px) {
            .modal-content {
                flex-direction: row;
            }
        }
        
        .modal-image {
            flex: 1;
            position: relative;
            margin-bottom: 20px;
        }
        
        @media (min-width: 768px) {
            .modal-image {
                margin-bottom: 0;
                margin-right: 20px;
            }
        }
        
        .modal-image img {
            width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        .modal-details {
            flex: 1;
        }
        
        .modal-price {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .modal-rating {
            margin-bottom: 15px;
        }
        
        .modal-description {
            line-height: 1.6;
        }
        
        .related-dishes {
            padding: 20px;
            border-top: 1px solid #eee;
        }
        
        .related-dishes h3 {
            margin-top: 0;
            margin-bottom: 15px;
        }
        
        .related-dishes-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .related-dish {
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .related-dish:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .related-dish-image {
            width: 100%;
            height: 100px;
            object-fit: cover;
        }
        
        .related-dish-info {
            padding: 10px;
        }
        
        .related-dish-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .related-dish-price {
            color: #31B404;
        }
        
        .dish-image-clickable {
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .dish-image-clickable:hover {
            transform: scale(1.05);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Load header data
fetch('../json/header.json')
    .then(response => response.json())
    .then(data => {
        document.querySelector('.restaurant-name').textContent = data.restaurantName;
        document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
    })
    .catch(error => console.error('Error loading header data:', error));
