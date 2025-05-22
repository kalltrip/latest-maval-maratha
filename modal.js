document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading thali data...");

    // Fetch both JSON files in parallel
    Promise.all([
        fetch("../json/thali_veg.json").then(response => response.json()),
        fetch("../json/thali_non_veg.json").then(response => response.json())
    ])
        .then(([vegData, nonVegData]) => {
            console.log("thali JSON Loaded Successfully");

            // Populate separate menus
            populatethaliMenu(vegData, "thali-veg-menu");
            populatethaliMenu(nonVegData, "thali-nonveg-menu");
        })
        .catch(error => console.error("Error fetching thali data:", error));
});

function populatethaliMenu(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
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
                        data-short="${shortDesc}">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>
               <img src="${dish.image}" alt="${dish.name}" class="lazy-img" decoding="async" >
            </div>
        `;

        container.appendChild(dishElement);
    });

    console.log(`thali menu loaded successfully for ${containerId}`);

    handleReadMore();
    // lazyLoadImages();
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

// Create modal.js file for dish detail modal functionality
document.addEventListener("DOMContentLoaded", function() {
    // Create modal container and add to body
    const modalContainer = document.createElement('div');
    modalContainer.className = 'dish-modal-container';
    modalContainer.innerHTML = `
        <div class="dish-modal">
            <span class="close-modal">&times;</span>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-dish-name"></h2>
                    <div class="modal-dish-type"></div>
                </div>
                <div class="modal-body">
                    <div class="modal-image-container">
                        <img id="modal-dish-image" alt="Dish Image">
                    </div>
                    <div class="modal-info">
                        <div class="modal-price">Price: ₹<span id="modal-dish-price"></span></div>
                        <div class="modal-rating">Rating: <span id="modal-dish-rating"></span></div>
                        <p id="modal-dish-description"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    // Function to open modal with dish details
    window.openDishModal = function(dishData) {
        document.getElementById('modal-dish-name').textContent = dishData.name;
        document.getElementById('modal-dish-price').textContent = dishData.price;
        document.getElementById('modal-dish-rating').innerHTML = generateStars(dishData.rating) + ' (' + dishData.rating + ')';
        document.getElementById('modal-dish-description').textContent = dishData.description;
        document.getElementById('modal-dish-image').src = dishData.image;
        
        // Set vegetarian or non-vegetarian indicator
        const dishTypeEl = document.querySelector('.modal-dish-type');
        dishTypeEl.innerHTML = `
            <i class="fa fa-circle" style="font-size:14px; color: ${dishData.veg ? 'green' : 'red'};">
                <span class="${dishData.veg ? 'vegetarian' : 'non-vegetarian'}">
                    ${dishData.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                </span>
            </i>
        `;
        
        // Show modal
        modalContainer.style.display = 'flex';
        
        // Prevent page scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Close modal when clicking the X button
    document.querySelector('.close-modal').addEventListener('click', function() {
        modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside of it
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Modify the populateMenu function to add click events to dish images
let originalPopulateMenu = window.populateMenu;

window.populateMenu = function(data, containerId) {
    // Call the original function first
    originalPopulateMenu(data, containerId);
    
    // After the dishes are created, add click event listeners to images
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const dishImages = container.querySelectorAll('.dish img');
    dishImages.forEach((img, index) => {
        img.style.cursor = 'pointer'; // Make cursor indicate clickable
        img.addEventListener('click', function() {
            // Find the corresponding dish data
            const dishElement = this.closest('.dish');
            const dishName = dishElement.querySelector('.dish-name').textContent;
            const dishData = data.find(dish => dish.name === dishName);
            
            if (dishData) {
                openDishModal(dishData);
            }
        });
    });
};

// Add review button to all menu pages
document.addEventListener("DOMContentLoaded", function() {
    const footerElement = document.querySelector('.footer');
    
    if (footerElement) {
        const reviewButton = document.createElement('a');
        reviewButton.className = 'review-btn';
        reviewButton.textContent = 'Write a Review';
        reviewButton.href = '#review-form';
        reviewButton.addEventListener('click', openReviewForm);
        
        footerElement.appendChild(reviewButton);
    }
});

// Function to open review form popup
function openReviewForm(event) {
    event.preventDefault();
    
    // Create review form modal if it doesn't exist
    if (!document.querySelector('.review-modal-container')) {
        const reviewModal = document.createElement('div');
        reviewModal.className = 'review-modal-container';
        reviewModal.innerHTML = `
            <div class="review-modal">
                <span class="close-review-modal">&times;</span>
                <h2>Write Your Review</h2>
                <form id="review-form">
                    <div class="form-group">
                        <label for="review-name">Your Name</label>
                        <input type="text" id="review-name" required>
                    </div>
                    <div class="form-group">
                        <label for="review-email">Email</label>
                        <input type="email" id="review-email" required>
                    </div>
                    <div class="form-group">
                        <label>Rating</label>
                        <div class="rating-selector">
                            <i class="fa fa-star rating-star" data-rating="1"></i>
                            <i class="fa fa-star rating-star" data-rating="2"></i>
                            <i class="fa fa-star rating-star" data-rating="3"></i>
                            <i class="fa fa-star rating-star" data-rating="4"></i>
                            <i class="fa fa-star rating-star" data-rating="5"></i>
                            <input type="hidden" id="rating-value" value="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="review-text">Your Review</label>
                        <textarea id="review-text" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="submit-review">Submit Review</button>
                </form>
            </div>
        `;
        document.body.appendChild(reviewModal);
        
        // Handle star rating selection
        const stars = reviewModal.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                document.getElementById('rating-value').value = rating;
                
                // Update star appearance
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= rating) {
                        s.style.color = 'gold';  // Selected
                    } else {
                        s.style.color = 'gray';  // Unselected
                    }
                });
            });
        });
        
        // Close modal functionality
        reviewModal.querySelector('.close-review-modal').addEventListener('click', function() {
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Submit form functionality
        reviewModal.querySelector('#review-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const rating = document.getElementById('rating-value').value;
            
            // Simple validation
            if (rating === "0") {
                alert("Please select a rating");
                return;
            }
            
            // In a real app, we would send this data to a server
            alert(`Thank you ${name} for your ${rating}-star review!`);
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Show the review modal
    document.querySelector('.review-modal-container').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


//This is the code in thali.js in 1830 line for displaying both veg and non veg related dishes//
/*function findRelatedDishes(category, currentDishName) {
    console.log(`Finding related dishes for: ${currentDishName} in category: ${category}`);
    const relatedDishes = [];
    
    // Get all dishes from the same category
    let containerSelector = category === 'veg' ? '#thali-veg-menu .dish' : '#thali-nonveg-menu .dish';
    const allDishes = document.querySelectorAll(containerSelector);
    
    console.log(`Found ${allDishes.length} total dishes in category ${category}`);
    
    // If we don't have enough dishes in the specified container, use all dishes
    if (allDishes.length < 4) {
        console.log("Not enough dishes in container, using all dishes");
        containerSelector = '.dish';
        const allDishesBackup = document.querySelectorAll(containerSelector);
        // Process each dish
        allDishesBackup.forEach(dishElement => {
            if (!dishElement) return;
            
            const nameElement = dishElement.querySelector('.dish-name');
            if (!nameElement) return;
            
            const name = nameElement.textContent.trim();
            
            // Skip if it's the current dish
            if (name === currentDishName) return;
            
            const priceElement = dishElement.querySelector('.dish-price');
            const descElement = dishElement.querySelector('.dish-description');
            const imgElement = dishElement.querySelector('img');
            const ratingElement = dishElement.querySelector('.dish-rating');
            
            if (!priceElement || !descElement || !imgElement) return;
            
            const price = priceElement.textContent.trim();
            const description = descElement.getAttribute('data-full') || descElement.textContent.trim();
            const image = imgElement.getAttribute('src');
            const rating = ratingElement ? 
                           ratingElement.textContent.match(/\(([^)]+)\)/) ? 
                           ratingElement.textContent.match(/\(([^)]+)\)/)[1] : '4.0' 
                           : '4.0';
            const isVeg = dishElement.querySelector('.vegetarian') !== null;
            
            relatedDishes.push({
                name,
                price,
                description,
                image,
                rating,
                veg: isVeg,
                category: isVeg ? 'veg' : 'non-veg'
            });
        });
    } else {
        // Process each dish
        allDishes.forEach(dishElement => {
            if (!dishElement) return;
            
            const nameElement = dishElement.querySelector('.dish-name');
            if (!nameElement) return;
            
            const name = nameElement.textContent.trim();
            
            // Skip if it's the current dish
            if (name === currentDishName) return;
            
            const priceElement = dishElement.querySelector('.dish-price');
            const descElement = dishElement.querySelector('.dish-description');
            const imgElement = dishElement.querySelector('img');
            const ratingElement = dishElement.querySelector('.dish-rating');
            
            if (!priceElement || !descElement || !imgElement) return;
            
            const price = priceElement.textContent.trim();
            const description = descElement.getAttribute('data-full') || descElement.textContent.trim();
            const image = imgElement.getAttribute('src');
            const rating = ratingElement ? 
                           ratingElement.textContent.match(/\(([^)]+)\)/) ? 
                           ratingElement.textContent.match(/\(([^)]+)\)/)[1] : '4.0' 
                           : '4.0';
            const isVeg = dishElement.querySelector('.vegetarian') !== null;
            
            relatedDishes.push({
                name,
                price,
                description,
                image,
                rating,
                veg: isVeg,
                category
            });
        });
    }
    
    // Return 3-4 related dishes (or fewer if not enough dishes available)
    const maxDishes = Math.min(4, relatedDishes.length);
    console.log(`Returning ${maxDishes} related dishes`);
    return relatedDishes.slice(0, maxDishes);
}*/


/* Create modal.js file for dish detail modal functionality
document.addEventListener("DOMContentLoaded", function() {
    // Create modal container and add to body
    const modalContainer = document.createElement('div');
    img.addEventListener('click', () => {
  openDishModal({
    name: dish.name,
    image: dish.image,
    price: dish.price,
    rating: dish.rating || "⭐ 4.5", // fallback
    description: dish.description || "Tasty and delicious!"
  });
});

    modalContainer.className = 'dish-modal-container';
    modalContainer.innerHTML = `
        <div class="dish-modal">
            <span class="close-modal">&times;</span>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-dish-name"></h2>
                    <div class="modal-dish-type"></div>
                </div>
                <div class="modal-body">
                    <div class="modal-image-container">
                        <img id="modal-dish-image" alt="Dish Image">
                    </div>
                    <div class="modal-info">
                        <div class="modal-price">Price: ₹<span id="modal-dish-price"></span></div>
                        <div class="modal-rating">Rating: <span id="modal-dish-rating"></span></div>
                        <p id="modal-dish-description"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    // Function to open modal with dish details
    window.openDishModal = function(dishData) {
        document.getElementById('modal-dish-name').textContent = dishData.name;
        document.getElementById('modal-dish-price').textContent = dishData.price;
        document.getElementById('modal-dish-rating').innerHTML = generateStars(dishData.rating) + ' (' + dishData.rating + ')';
        document.getElementById('modal-dish-description').textContent = dishData.description;
        document.getElementById('modal-dish-image').src = dishData.image;
        
        // Set vegetarian or non-vegetarian indicator
        const dishTypeEl = document.querySelector('.modal-dish-type');
        dishTypeEl.innerHTML = `
            <i class="fa fa-circle" style="font-size:14px; color: ${dishData.veg ? 'green' : 'red'};">
                <span class="${dishData.veg ? 'vegetarian' : 'non-vegetarian'}">
                    ${dishData.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
                </span>
            </i>
        `;
        
        // Show modal
        modalContainer.style.display = 'flex';
        
        // Prevent page scrolling when modal is open
        document.body.style.overflow = 'hidden';
    };

    // Close modal when clicking the X button
    document.querySelector('.close-modal').addEventListener('click', function() {
        modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside of it
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            modalContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Modify the populateMenu function to add click events to dish images
let originalPopulateMenu = window.populateMenu;

window.populateMenu = function(data, containerId) {
    // Call the original function first
    originalPopulateMenu(data, containerId);
    
    // After the dishes are created, add click event listeners to images
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const dishImages = container.querySelectorAll('.dish img');
    dishImages.forEach((img, index) => {
        img.style.cursor = 'pointer'; // Make cursor indicate clickable
        img.addEventListener('click', function() {
            // Find the corresponding dish data
            const dishElement = this.closest('.dish');
            const dishName = dishElement.querySelector('.dish-name').textContent;
            const dishData = data.find(dish => dish.name === dishName);
            
            if (dishData) {
                openDishModal(dishData);
            }
        });
    });
};

// Add review button to all menu pages
document.addEventListener("DOMContentLoaded", function() {
    const footerElement = document.querySelector('.footer');
    
    if (footerElement) {
        const reviewButton = document.createElement('a');
        reviewButton.className = 'review-btn';
        reviewButton.textContent = 'Write a Review';
        reviewButton.href = '#review-form';
        reviewButton.addEventListener('click', openReviewForm);
        
        footerElement.appendChild(reviewButton);
    }
});


/*function openDishModal(dish) {
  document.getElementById("modal-dish-name").innerText = dish.name;
  document.getElementById("modal-dish-image").src = dish.image;
  document.getElementById("modal-dish-price").innerText = `₹${dish.price}`;
  document.getElementById("modal-dish-rating").innerText = dish.rating;
  document.getElementById("modal-dish-description").innerText = dish.description;
  document.getElementById("dish-modal").style.display = "flex";
}

function closeDishModal() {
  document.getElementById("dish-modal").style.display = "none";
}
*/
/* Function to open review form popup
function openReviewForm(event) {
    event.preventDefault();
    
    /* Create review form modal if it doesn't exist
    if (!document.querySelector('.review-modal-container')) {
        const reviewModal = document.createElement('div');
        reviewModal.className = 'review-modal-container';
        reviewModal.innerHTML = `
            <div class="review-modal">
                <span class="close-review-modal">&times;</span>
                <h2>Write Your Review</h2>
                <form id="review-form">
                    <div class="form-group">
                        <label for="review-name">Your Name</label>
                        <input type="text" id="review-name" required>
                    </div>
                    <div class="form-group">
                        <label for="review-email">Email</label>
                        <input type="email" id="review-email" required>
                    </div>
                    <div class="form-group">
                        <label>Rating</label>
                        <div class="rating-selector">
                            <i class="fa fa-star rating-star" data-rating="1"></i>
                            <i class="fa fa-star rating-star" data-rating="2"></i>
                            <i class="fa fa-star rating-star" data-rating="3"></i>
                            <i class="fa fa-star rating-star" data-rating="4"></i>
                            <i class="fa fa-star rating-star" data-rating="5"></i>
                            <input type="hidden" id="rating-value" value="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="review-text">Your Review</label>
                        <textarea id="review-text" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="submit-review">Submit Review</button>
                </form>
            </div>
        `;
        document.body.appendChild(reviewModal);
        
        // Handle star rating selection
        const stars = reviewModal.querySelectorAll('.rating-star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                document.getElementById('rating-value').value = rating;
                
                // Update star appearance
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= rating) {
                        s.style.color = 'gold';  // Selected
                    } else {
                        s.style.color = 'gray';  // Unselected
                    }
                });
            });
        });
        
        // Close modal functionality
        reviewModal.querySelector('.close-review-modal').addEventListener('click', function() {
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Submit form functionality
        reviewModal.querySelector('#review-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('review-name').value;
            const rating = document.getElementById('rating-value').value;
            
            // Simple validation
            if (rating === "0") {
                alert("Please select a rating");
                return;
            }
            
            // In a real app, we would send this data to a server
            alert(`Thank you ${name} for your ${rating}-star review!`);
            reviewModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Show the review modal
    document.querySelector('.review-modal-container').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}*/



/*
// Function to create and show dish detail modal when image is clicked
function showDishDetailModal(dishName, price, description, imageUrl, category, rating, veg,) {
    // Check if modal already exists and remove it
    const existingModal = document.querySelector('.dish-detail-modal');
    if (existingModal) existingModal.remove();
    
    // Get related dishes (3 dishes from the same category)
    const relatedDishes = findRelatedDishes(category, dishName, 3);
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'dish-detail-modal';
    
    // Generate stars for rating
    const stars = generateStars(rating);
    
    // Format dish price
    const priceNumber = parseFloat(price.match(/Rs (\d+)/)?.[1] || 0);
    const originalPrice = (priceNumber * 1.2).toFixed(0);

  

    // Create related dishes HTML
    let relatedDishesHTML = '';
    if (relatedDishes.length > 0) {
        relatedDishes.forEach(dish => {
            relatedDishesHTML += `
                <div class="related-dish" onclick="showDishDetailModal('${dish.name}', 'Rs ${dish.price}', '${dish.description.replace(/'/g, "\\'")}', '${dish.image}', '${dish.category}', ${dish.rating}, ${dish.veg})">
                    <img src="${dish.image}" alt="${dish.name}" />
                    <div class="related-dish-info">
                        <span class="related-dish-name">${dish.name}</span>
                        <span class="related-dish-price">Rs ${dish.price}</span>
                    </div>
                </div>
            `;
        });
    } else {
        relatedDishesHTML = '<p>No related dishes found.</p>';
    }
    
    // Modal content
    modalContainer.innerHTML = `
        <div class="dish-detail-content">
            <div class="dish-detail-header">
                <h2>${dishName}</h2>
                <button class="close-dish-modal">&times;</button>
            </div>

            <!-- Main Dish View -->
<div class="dish main-dish large-font">
  <div class="dish-content">
    <div class="dish-details">
      <div class="dish-header">
        <span class="dish-name">${dishName}</span>
      </div>
      <div class="dish-pricing">
        <span class="dish-price">Rs ${priceNumber}</span>
        <span class="original-price">Rs ${originalPrice}</span>
      </div>
      <span class="dish-rating">${stars} (${rating})</span>
      <p class="dish-description">${description}</p>
      <div class="dish-footer">
        <div class="dish-footer-left">
          <span class="tag">${category}</span>
        </div>
        <div class="dish-footer-right">
          <button class="btn order-btn" onclick="selectDish('${dishName} - Rs ${priceNumber}', this)">Add to Order</button>
        </div>
      </div>
    </div>
    <img src="${imageUrl}" alt="${dishName}" class="dish-image-large" />
  </div>
</div>

<!-- Related Dishes -->
<div class="related-dishes-section">
  <h3 style="margin-left: 14px;">Related Dishes</h3>
  <div class="related-dishes-horizontal" style="display: flex; overflow-x: auto; padding: 10px;">
    ${relatedDishes.map(dish => `
      <div class="related-dish-card" 
           onclick="showDishDetailModal('${dish.name}', 'Rs ${dish.price}', '${dish.description.replace(/'/g, "\\'")}', '${dish.image}', '${dish.category}', ${dish.rating}, ${dish.veg})"
           style="flex: 0 0 auto; width: 120px; margin-right: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); cursor: pointer;">
        <img src="${dish.image}" alt="${dish.name}" style="width: 100%; height: 80px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <div style="padding: 5px;">
          <div style="font-size: 13px; font-weight: bold;">${dish.name}</div>
          <div style="font-size: 12px; color: #E74C3C;">Rs ${dish.price}</div>
        </div>
      </div>
    `).join("")}
  </div>
</div>


           
    `;
    
    // Append modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners
    modalContainer.querySelector('.close-dish-modal').addEventListener('click', () => {
        modalContainer.classList.add('fade-out');
        setTimeout(() => modalContainer.remove(), 300);
    });
    
    // Close modal when clicking outside of it
    modalContainer.addEventListener('click', (event) => {
        if (event.target === modalContainer) {
            modalContainer.classList.add('fade-out');
            setTimeout(() => modalContainer.remove(), 300);
        }
    });
    
    // Add fade-in animation
    setTimeout(() => modalContainer.classList.add('active'), 10);
}

// Function to find related dishes based on category
function findRelatedDishes(category, currentDishName, count) {
    const allDishes = [];
    const dishes = document.querySelectorAll('.dish');
    
    dishes.forEach(dish => {
        const nameElement = dish.querySelector('.dish-name');
        const priceElement = dish.querySelector('.dish-price');
        const descElement = dish.querySelector('.dish-description');
        const imgElement = dish.querySelector('img');
        const tagElement = dish.querySelector('.tag');
        const ratingElement = dish.querySelector('.dish-rating');
        const vegIcon = dish.querySelector('.fa-circle');
        
        if (nameElement && priceElement && descElement && imgElement && tagElement) {
            const name = nameElement.textContent.trim();
            
            // Skip current dish
            if (name === currentDishName) return;
            
            // Check if dish is in the same category
            if (tagElement.textContent.trim() === category) {
                const price = priceElement.textContent.match(/\d+/)[0];
                const description = descElement.getAttribute('data-full') || descElement.textContent.trim();
                const image = imgElement.getAttribute('src') || imgElement.getAttribute('data-src');
                const rating = ratingElement ? parseFloat(ratingElement.textContent.match(/\d+(\.\d+)?/)[0]) : 4.0;
                const isVeg = vegIcon ? vegIcon.style.color.includes('green') : true;
                
                allDishes.push({
                    name,
                    price,
                    description,
                    image,
                    category,
                    rating,
                    veg: isVeg
                });
            }
        }
    });
    
    // Shuffle array to get random related dishes
    for (let i = allDishes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allDishes[i], allDishes[j]] = [allDishes[j], allDishes[i]];
    }
    
    return allDishes.slice(0, count);
}

// Modify the populateMenu function to add click events to dish images
function addImageClickEvents() {
    // Get all dish images
    const dishImages = document.querySelectorAll('.dish img');
    
    // Add click event to each image
    dishImages.forEach(img => {
        img.style.cursor = 'pointer'; // Add pointer cursor
        
        // Remove any existing event listeners
        img.removeEventListener('click', handleImageClick);
        
        // Add new click event listener
        img.addEventListener('click', handleImageClick);
    });
}

// Handle image click event
function handleImageClick(event) {
    const img = event.target;
    const dishElement = img.closest('.dish');
    
    if (dishElement) {
        const nameElement = dishElement.querySelector('.dish-name');
        const priceElement = dishElement.querySelector('.dish-price');
        const descElement = dishElement.querySelector('.dish-description');
        const tagElement = dishElement.querySelector('.tag');
        const ratingElement = dishElement.querySelector('.dish-rating');
        const vegIcon = dishElement.querySelector('.fa-circle');
        
        if (nameElement && priceElement && descElement && tagElement) {
            const name = nameElement.textContent.trim();
            const price = priceElement.textContent.trim();
            const description = descElement.getAttribute('data-full') || descElement.textContent.trim();
            const category = tagElement.textContent.trim();
            const image = img.getAttribute('src') || img.getAttribute('data-src');
            const rating = ratingElement ? parseFloat(ratingElement.textContent.match(/\d+(\.\d+)?/)[0]) : 4.0;
            const isVeg = vegIcon ? vegIcon.style.color.includes('green') : true;
            
            showDishDetailModal(name, price, description, image, category, rating, isVeg);
        }
    }
}

// Modify the existing populateMenu function to call our new function
const originalPopulateMenu = populateMenu;
populateMenu = function(data, containerId) {
    originalPopulateMenu(data, containerId);
    addImageClickEvents();
};

// Call this initially to add click events to images that are already loaded
document.addEventListener("DOMContentLoaded", function() {
    // This will be called after the original DOMContentLoaded handler
    setTimeout(addImageClickEvents, 1000);
});
updateTheme();
setInterval(updateTheme, 60000);  */


//charmi added code//
/* menu.js

let menuData = {};
let menuDataLoaded = false;

// Load JSON file based on page (example: thali)
fetch('../json/thali.json')
  .then(response => response.json())
  .then(data => {
    menuData = data;
    menuDataLoaded = true;
  })
  .catch(error => console.error('Error loading menu JSON:', error));

// Filter and render dishes into the page
function filterDishes(categoryKey) {
  const section = document.getElementById(`${categoryKey}-menu`);
  if (!section || !menuData[categoryKey]) return;

  menuData[categoryKey].forEach(dish => {
    const dishCard = renderDishItem(dish, categoryKey);
    section.appendChild(dishCard);
  });
}

// Render each individual dish card
function renderDishItem(dish, category) {
  const dishDiv = document.createElement("div");
  dishDiv.classList.add("dish");

  const img = document.createElement("img");
  img.src = dish.image;
  img.alt = dish.name;
  img.classList.add("dish-image");
  img.addEventListener("click", () => showDishModal(dish, category));

  const name = document.createElement("h3");
  name.classList.add("dish-name");
  name.textContent = dish.name;

  const price = document.createElement("p");
  price.classList.add("dish-price");
  price.textContent = `₹${dish.price}`;

  const desc = document.createElement("p");
  desc.classList.add("dish-description");
  desc.textContent = dish.description;

  dishDiv.appendChild(img);
  dishDiv.appendChild(name);
  dishDiv.appendChild(price);
  dishDiv.appendChild(desc);

  return dishDiv;
}

// Show dish modal popup
function showDishModal(dish, categoryKey) {
  const modal = document.createElement("div");
  modal.className = "dish-detail-modal active";

  modal.innerHTML = `
    <div class="dish-detail-content">
      <div class="dish-detail-header">
        <h2>${dish.name}</h2>
        <button class="close-dish-modal" onclick="this.closest('.dish-detail-modal').remove()">&times;</button>
      </div>
      <div class="dish-detail-body">
        <div class="dish-detail-image-container">
          <img class="dish-detail-image" src="${dish.image}" alt="${dish.name}">
        </div>
        <div class="dish-detail-info">
          <div class="dish-detail-price">
            <span class="detail-current-price">₹${dish.price}</span>
          </div>
          <p class="dish-detail-description">${dish.description}</p>
          ${dish.tags ? `<span class="detail-tag">${dish.tags}</span>` : ''}
        </div>
      </div>
      <div class="dish-detail-related">
        <h3>Related Dishes</h3>
        <div class="related-dishes-scroll">
          ${renderRelatedDishes(categoryKey, dish.name)}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Render related dishes (excluding current dish)
function renderRelatedDishes(categoryKey, excludeDishName) {
  const dishes = menuData[categoryKey] || [];
  return dishes
    .filter(d => d.name !== excludeDishName)
    .slice(0, 8)
    .map(dish => `
      <div class="related-dish-thumbnail" onclick='showDishModal(${JSON.stringify(dish)}, "${categoryKey}")'>
        <img src="${dish.image}" alt="${dish.name}">
        <div class="dish-title">${dish.name}</div>
        <div class="dish-price">₹${dish.price}</div>
      </div>
    `)
    .join("");
}


// Enhanced Dish Modal Implementation for menu.js

document.addEventListener("DOMContentLoaded", function() {
    // Add click event listeners to all dish images
    setTimeout(() => {
        const dishImages = document.querySelectorAll('.dish img');
        dishImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                // Find the parent dish element
                const dishElement = this.closest('.dish');
                if (!dishElement) return;
                
                // Extract dish information
                const name = dishElement.querySelector('.dish-name').textContent;
                const price = dishElement.querySelector('.dish-price').textContent.replace('Rs ', '');
                const description = dishElement.querySelector('.dish-description').getAttribute('data-full');
                const image = this.getAttribute('src') || this.getAttribute('data-src');
                
                // Get category from the tag if available
                let category = '';
                const tagElement = dishElement.querySelector('.tag');
                if (tagElement) {
                    category = tagElement.textContent;
                }
                
                // Get veg status
                const isVeg = dishElement.querySelector('.vegetarian') !== null;
                
                // Get rating if available
                let rating = '';
                const ratingElement = dishElement.querySelector('.dish-rating');
                if (ratingElement) {
                    rating = ratingElement.textContent.match(/\(([^)]+)\)/);
                    rating = rating ? rating[1] : 'N/A';
                }
                
                // Show dish modal with the extracted information
                showDishDetailModal({
                    name: name,
                    price: price,
                    description: description,
                    image: image,
                    rating: rating,
                    veg: isVeg,
                    category: category
                });
            });
        });
    }, 1000); // Delay to ensure all dish elements are loaded
});

/**
 * Shows the dish detail modal with the provided dish information
 * @param {Object} dish - The dish object containing name, price, description, etc.
 *
function showDishDetailModal(dish) {
    // Create modal element
    const modal = document.createElement("div");
    modal.className = "dish-detail-modal";
    document.body.appendChild(modal);
    
    // Add modal content
    modal.innerHTML = `
        <div class="dish-detail-content">
            <div class="dish-detail-header">
                <h2>${dish.name}</h2>
                <button class="close-dish-modal">&times;</button>
            </div>
            <div class="dish-detail-body">
                <div class="dish-detail-image-container">
                    <img class="dish-detail-image" src="${dish.image}" alt="${dish.name}">
                    <div class="dish-detail-veg-indicator" style="position: absolute; top: 10px; left: 10px; background-color: rgba(255,255,255,0.8); padding: 5px; border-radius: 50%;">
                        <i class="fa fa-circle" style="font-size:14px; color: ${dish.veg ? 'green' : 'red'};"></i>
                    </div>
                </div>
                <div class="dish-detail-info">
                    <div class="dish-detail-price">
                        <span class="detail-current-price">₹${dish.price}</span>
                    </div>
                    <div class="dish-detail-rating">
                        Rating: ${dish.rating} ${generateStarsHTML(dish.rating)}
                    </div>
                    <p class="dish-detail-description">${dish.description}</p>
                    ${dish.category ? `<span class="detail-tag">${dish.category}</span>` : ''}
                </div>
            </div>
            <div class="dish-detail-related">
                <h3>Related Dishes</h3>
                <div class="related-dishes-scroll" id="related-dishes-container">
                    <div class="loading-related">Loading related dishes...</div>
                </div>
            </div>
        </div>
    `;
    
    // Add animation class after a small delay to trigger animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal when clicking the close button
    modal.querySelector('.close-dish-modal').addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Find related dishes and populate the container
    findAndDisplayRelatedDishes(dish, modal.querySelector('#related-dishes-container'));
}

/**
 * Finds and displays related dishes based on the current dish
 * @param {Object} currentDish - The current dish being displayed
 * @param {HTMLElement} container - The container to display related dishes
 *
function findAndDisplayRelatedDishes(currentDish, container) {
    // Get all dishes from the current category
    const allDishes = [];
    document.querySelectorAll('.dish').forEach(dishElem => {
        const tagElem = dishElem.querySelector('.tag');
        if (!tagElem) return;
        
        const category = tagElem.textContent;
        if (category === currentDish.category) {
            const nameElem = dishElem.querySelector('.dish-name');
            if (!nameElem || nameElem.textContent === currentDish.name) return;
            
            const priceElem = dishElem.querySelector('.dish-price');
            const imgElem = dishElem.querySelector('img');
            const descElem = dishElem.querySelector('.dish-description');
            
            if (nameElem && priceElem && imgElem) {
                allDishes.push({
                    name: nameElem.textContent,
                    price: priceElem.textContent.replace('Rs ', ''),
                    image: imgElem.getAttribute('src') || imgElem.getAttribute('data-src'),
                    description: descElem ? (descElem.getAttribute('data-full') || descElem.textContent) : '',
                    veg: dishElem.querySelector('.vegetarian') !== null,
                    category: category
                });
            }
        }
    });
    
    // Display up to 6 related dishes
    container.innerHTML = '';
    
    if (allDishes.length === 0) {
        container.innerHTML = '<p>No related dishes found.</p>';
        return;
    }
    
    // Take a maximum of 6 dishes
    const relatedDishes = allDishes.slice(0, 6);
    
    relatedDishes.forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.className = 'related-dish-thumbnail';
        dishElement.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <div class="dish-title">${dish.name}</div>
            <div class="dish-price">₹${dish.price}</div>
        `;
        
        // Add click event to show the related dish details
        dishElement.addEventListener('click', () => {
            // First, remove the current modal
            const currentModal = document.querySelector('.dish-detail-modal');
            if (currentModal) {
                currentModal.classList.remove('active');
                setTimeout(() => {
                    currentModal.remove();
                    // Then show the new dish modal
                    showDishDetailModal(dish);
                }, 300);
            } else {
                showDishDetailModal(dish);
            }
        });
        
        container.appendChild(dishElement);
    });
}

/**
 * Generates HTML for star rating display
 * @param {number} rating - The rating value
 * @returns {string} HTML string with star icons
 *
function generateStarsHTML(rating) {
    if (!rating || isNaN(rating)) return '';
    
    rating = parseFloat(rating);
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa fa-star" style="color: gold;"></i> ';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fa fa-star-half" style="color: gold;"></i> ';
        } else {
            stars += '<i class="fa fa-star-o" style="color: #ccc;"></i> ';
        }
    }
    
    return stars;
}

// Make existing lazyLoadImages function available for loading images in the modal
window.lazyLoadImages = lazyLoadImages;
*/



/*===========================================//
document.addEventListener("DOMContentLoaded", function () {
    console.log("Loading thali data...");

    // Fetch both JSON files in parallel
    Promise.all([
        fetch("../json/thali_veg.json").then(response => response.json()),
        fetch("../json/thali_non_veg.json").then(response => response.json())
    ])
        .then(([vegData, nonVegData]) => {
            console.log("thali JSON Loaded Successfully");

            // Populate separate menus
            populatethaliMenu(vegData, "thali-veg-menu");
            populatethaliMenu(nonVegData, "thali-nonveg-menu");
            
            // Add click handlers to all dish images after populating menus
            addDishClickHandlers();
        })
        .catch(error => console.error("Error fetching thali data:", error));
});

function populatethaliMenu(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
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
                        data-category="${containerId === 'thali-veg-menu' ? 'veg' : 'non-veg'}">
                        ${window.innerWidth < 480 ? shortDesc + ' <span class="read-more" style="color: #31B404; cursor: pointer;">Read More</span>' : fullDesc}
                    </p>
                </div>
               <img src="${dish.image}" alt="${dish.name}" class="lazy-img dish-image-clickable" decoding="async">
            </div>
        `;

        container.appendChild(dishElement);
    });

    console.log(`thali menu loaded successfully for ${containerId}`);

    handleReadMore();
    lazyLoadImages();
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
    // Create modal container if it doesn't exist
    let modalContainer = document.querySelector('.dish-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.className = 'dish-modal-container';
        document.body.appendChild(modalContainer);
    }
    
    // Find related dishes based on category (veg/non-veg)
    const relatedDishes = findRelatedDishes(dish.category, dish.name);
    
    // Generate related dishes HTML
    let relatedDishesHTML = '';
    if (relatedDishes.length > 0) {
        relatedDishesHTML = `
            <div class="related-dishes">
                <h3>Related Dishes</h3>
                <div class="related-dishes-container">
                    ${relatedDishes.map(relDish => `
                        <div class="related-dish" data-dish='${JSON.stringify(relDish)}'>
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
                    <img src="${dish.image}" alt="${dish.name}">
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
            const relatedDishData = JSON.parse(this.getAttribute('data-dish'));
            // Close current modal
            modalContainer.style.display = 'none';
            // Open new modal with related dish
            setTimeout(() => {
                showDishModal(relatedDishData);
            }, 100);
        });
    });
}

// Function to find related dishes
function findRelatedDishes(category, currentDishName) {
    const relatedDishes = [];
    const allDishes = document.querySelectorAll(`.dish-description[data-category="${category}"]`);
    
    allDishes.forEach(dishDesc => {
        const dishElement = dishDesc.closest('.dish');
        if (!dishElement) return;
        
        const name = dishElement.querySelector('.dish-name').textContent;
        
        // Skip if it's the current dish
        if (name === currentDishName) return;
        
        const price = dishElement.querySelector('.dish-price').textContent;
        const description = dishDesc.getAttribute('data-full');
        const image = dishElement.querySelector('img').getAttribute('src');
        const ratingElement = dishElement.querySelector('.dish-rating');
        const rating = ratingElement ? ratingElement.textContent.match(/\(([^)]+)\)/)[1] : '4.0';
        const isVeg = dishElement.querySelector('.vegetarian') !== null;
        
        relatedDishes.push({
            name,
            price,
            description,
            image,
            rating,
            veg: isVeg,
            category
        });
    });
    
    // Return only 3-4 related dishes
    return relatedDishes.slice(0, 4);
}

// Add CSS for the modal
function addModalStyles() {
    const styleElement = document.createElement('style');
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
        
        .veg-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: white;
            padding: 5px 10px;
            border-radius: 4px;
            display: flex;
            align-items: center;
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

// Add modal styles when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    addModalStyles();
    
    // Load header data
    fetch('../json/header.json')
        .then(response => response.json())
        .then(data => {
            document.querySelector('.restaurant-name').textContent = data.restaurantName;
            document.querySelector('.restaurant-details').textContent = `${data.address} | ${data.contact}`;
        })
        .catch(error => console.error('Error loading header data:', error));
}); */