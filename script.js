// JW Knitique - Simple JavaScript for hat ordering and lightbox

// Lightbox functionality
function openLightbox(imageSrc, hatName, hatDescription, hatPrice, isSold) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxInfo = document.getElementById('lightbox-info');
    
    lightboxImg.src = imageSrc;
    lightboxImg.alt = hatName + ' Hat';
    
    let infoHTML = `<h3>${hatName}</h3><p>${hatDescription}</p>`;
    if (!isSold) {
        infoHTML += `<p class="price">${hatPrice}</p>`;
    } else {
        infoHTML += `<p class="sold-badge">SOLD!</p>`;
    }
    
    lightboxInfo.innerHTML = infoHTML;
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Function called when "I want [Hat Name]!" button is clicked
function orderHat(hatName) {
    // Scroll to the contact form
    document.querySelector('.contact').scrollIntoView({ 
        behavior: 'smooth' 
    });
    
    // Wait a moment for scroll to complete, then select the hat
    setTimeout(() => {
        const hatSelect = document.getElementById('hat-choice');
        
        // Find the option that matches the hat name
        for (let option of hatSelect.options) {
            if (option.value === hatName) {
                hatSelect.value = hatName;
                break;
            }
        }
        
        // Add a little visual feedback
        hatSelect.style.background = '#fff2e6';
        setTimeout(() => {
            hatSelect.style.background = '';
        }, 1000);
        
        // Focus on the name field so they can start typing
        document.getElementById('customer-name').focus();
    }, 500);
}

// Update subject line with customer name and order number
function updateSubject() {
    const customerName = document.getElementById('customer-name').value;
    const subjectField = document.getElementById('dynamic-subject');
    
    // Generate a simple order number based on timestamp
    const orderNumber = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    
    if (customerName && customerName.trim() !== '') {
        subjectField.value = `🧶 Hat Order from ${customerName.trim()} (#${orderNumber})`;
    } else {
        subjectField.value = `🧶 New Hat Order (#${orderNumber})`;
    }
}

// Form submission feedback
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[name="hat-orders"]');
    
    if (form) {
        // Update subject line right before form submission
        form.addEventListener('submit', function(e) {
            updateSubject(); // Set the subject line with customer name
            
            const submitBtn = document.querySelector('.submit-btn');
            
            // Change button text to show it's working
            submitBtn.textContent = 'Sending your order...';
            submitBtn.style.background = '#666';
            submitBtn.disabled = true;
        });
        
        // Also update subject as they type their name (optional, for real-time preview)
        const nameField = document.getElementById('customer-name');
        if (nameField) {
            nameField.addEventListener('input', updateSubject);
        }
    }
    
    // Check if we're on the success page (Netlify redirects here after form submission)
    if (window.location.search.includes('success')) {
        showSuccessMessage();
    }
});

// Show success message after form submission
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #228B22, #32CD32);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
            font-weight: bold;
            font-size: 1.1rem;
        ">
            🎉 Order received! We'll email you soon at cozy@jwknitique.com! 🎉
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove the message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Add some fun interactions for the girls
function addSparkle(element) {
    element.style.position = 'relative';
    const sparkle = document.createElement('span');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.top = '-10px';
    sparkle.style.right = '-10px';
    sparkle.style.fontSize = '1.5rem';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    
    element.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Add sparkle animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% { 
            transform: scale(0) rotate(0deg);
            opacity: 0;
        }
        50% { 
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
        }
        100% { 
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
    
    .order-btn:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

// Add sparkle effect to order buttons and setup lightbox
document.addEventListener('DOMContentLoaded', function() {
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            addSparkle(this);
        });
    });
    
    // Add click listeners to all hat images
    const hatImages = document.querySelectorAll('.hat-image');
    hatImages.forEach(img => {
        img.addEventListener('click', function() {
            const hatDiv = this.closest('.hat');
            const hatName = hatDiv.querySelector('h3').textContent;
            const hatDescription = hatDiv.querySelector('.hat-info p').textContent;
            const priceElement = hatDiv.querySelector('.price');
            const hatPrice = priceElement ? priceElement.textContent : '';
            const isSold = hatDiv.classList.contains('sold');
            
            openLightbox(this.src, hatName, hatDescription, hatPrice, isSold);
        });
    });
    
    // Close lightbox when clicking outside the image
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
});