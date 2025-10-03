// JW Knitique - Shopping cart and form functionality

// Shopping cart state
let selectedHats = [];
let cartTotal = 0;
let orderNumber = '';

// Generate order number on page load
function generateOrderNumber() {
    orderNumber = Date.now().toString().slice(-6);
    const orderNumberField = document.getElementById('order-number');
    if (orderNumberField) {
        orderNumberField.value = orderNumber;
    }
}

// Initialize shopping cart
function initShoppingCart() {
    const checkboxes = document.querySelectorAll('.hat-checkbox');
    const floatingCart = document.getElementById('floating-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearBtn = document.getElementById('clear-cart');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    
    // Add event listeners to checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateCart(this);
        });
    });
    
    // Checkout button - scroll to form
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.querySelector('.contact').scrollIntoView({ 
                behavior: 'smooth' 
            });
            updateOrderSummary();
        });
    }
    
    // Clear cart button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
    
    // Continue shopping button - scroll back to gallery
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            document.querySelector('.hats-gallery').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
}

// Update cart when checkboxes change
function updateCart(checkboxElement) {
    const checkboxes = document.querySelectorAll('.hat-checkbox:checked');
    selectedHats = [];
    cartTotal = 0;
    
    checkboxes.forEach(checkbox => {
        const hatName = checkbox.dataset.hat;
        const hatPrice = parseInt(checkbox.dataset.price);
        selectedHats.push({ name: hatName, price: hatPrice });
        cartTotal += hatPrice;
    });
    
    updateFloatingCart();
    updateFormData();
    
    // Show encouraging message if a hat was just selected (not unselected)
    if (checkboxElement && checkboxElement.checked) {
        const hatDiv = checkboxElement.closest('.hat');
        showEncouragingMessage(hatDiv);
        
        // Add bounce animation to cart
        const floatingCart = document.getElementById('floating-cart');
        floatingCart.classList.add('bounce');
        setTimeout(() => floatingCart.classList.remove('bounce'), 500);
    }
}

// Update the floating cart display
function updateFloatingCart() {
    const floatingCart = document.getElementById('floating-cart');
    const cartCount = document.getElementById('cart-count');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (selectedHats.length > 0) {
        const hatText = selectedHats.length === 1 ? 'hat' : 'hats';
        cartCount.textContent = `${selectedHats.length} ${hatText}`;
        cartTotalElement.textContent = `$${cartTotal}`;
        floatingCart.classList.add('visible');
    } else {
        floatingCart.classList.remove('visible');
    }
}

// Update form with selected hats data
function updateFormData() {
    const selectedHatsField = document.getElementById('selected-hats');
    const orderTotalField = document.getElementById('order-total');
    
    const hatNames = selectedHats.map(hat => hat.name).join(', ');
    selectedHatsField.value = hatNames;
    orderTotalField.value = cartTotal;
}

// Update the order summary in the form
function updateOrderSummary() {
    const orderSummary = document.getElementById('order-summary');
    
    if (selectedHats.length > 0) {
        let summaryHTML = '<h3>Your Order:</h3>';
        
        selectedHats.forEach(hat => {
            summaryHTML += `<div class="order-item">
                <span>${hat.name}</span>
                <span>$${hat.price}</span>
            </div>`;
        });
        
        summaryHTML += `<div class="order-item order-total-line">
            <span><strong>Total:</strong></span>
            <span><strong>$${cartTotal}</strong></span>
        </div>`;
        
        orderSummary.innerHTML = summaryHTML;
        orderSummary.classList.add('visible');
    } else {
        orderSummary.classList.remove('visible');
    }
}

// Clear all selections
function clearCart() {
    const checkboxes = document.querySelectorAll('.hat-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateCart();
    updateOrderSummary();
}

// Update the subject line generation to include selected hats
function updateSubject() {
    const customerName = document.getElementById('customer-name').value;
    const subjectField = document.getElementById('dynamic-subject');
    
    const hatNames = selectedHats.map(hat => hat.name).join(', ');
    
    if (customerName && customerName.trim() !== '') {
        if (selectedHats.length > 0) {
            subjectField.value = `🧶 Hat Order from ${customerName.trim()} (#${orderNumber}) - ${hatNames}`;
        } else {
            subjectField.value = `🧶 Hat Order from ${customerName.trim()} (#${orderNumber})`;
        }
    } else {
        if (selectedHats.length > 0) {
            subjectField.value = `🧶 New Hat Order (#${orderNumber}) - ${hatNames}`;
        } else {
            subjectField.value = `🧶 New Hat Order (#${orderNumber})`;
        }
    }
}

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
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

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
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Encouraging messages that appear when selecting hats
const encouragingMessages = [
    "ohh that's a good one!",
    "you'll love this one!",
    "❤️ ❤️ ❤️",
    "very cozy!",
    "we worked hard on that one!",
    "can't wait to send it!",
    "excellent choice!",
    "that one's a favorite!",
    "so soft and warm!",
    "perfect for chilly days!",
    "knitted with love!",
    "this one's special!",
    "great taste!",
    "that's a beauty!",
    "we're excited for you!",
    "you picked a winner!",
    "handmade just for you!",
    "this one makes us smile!",
    "cozy vibes incoming!",
    "horse camp here we come!"
];

// Show encouraging message when hat is selected
function showEncouragingMessage(hatElement) {
    const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #32CD32, #228B22);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
        z-index: 100;
        animation: messagePopIn 2s ease-out forwards;
        box-shadow: 0 4px 12px rgba(50, 205, 50, 0.4);
    `;
    
    hatElement.style.position = 'relative';
    hatElement.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 2000);
}

// Add animations CSS dynamically
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
    
    @keyframes messagePopIn {
        0% {
            transform: scale(0) translateY(-20px);
            opacity: 0;
        }
        20% {
            transform: scale(1.1) translateY(0);
            opacity: 1;
        }
        80% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
        100% {
            transform: scale(0.8) translateY(-10px);
            opacity: 0;
        }
    }
    
    @keyframes cartBounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    .floating-cart.bounce {
        animation: cartBounce 0.5s ease;
    }
`;
document.head.appendChild(style);

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    
    // Generate order number
    generateOrderNumber();
    
    // Initialize shopping cart
    initShoppingCart();
    
    // Form submission handling
    const form = document.querySelector('form[name="hat-orders"]');
    console.log('Form found:', form);
    
    if (form) {
        console.log('Adding form submit listener...');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            console.log('Form submitted!');
            
            // Check if any hats are selected
            if (selectedHats.length === 0) {
                alert('Please select at least one hat before ordering!');
                return;
            }
            
            // Check honeypots first
            console.log('Checking honeypots...');
            const website = document.querySelector('input[name="website"]');
            const phone2 = document.querySelector('input[name="phone2"]');
            const backupEmail = document.querySelector('input[name="backup-email"]');
            
            console.log('Honeypot fields:', website, phone2, backupEmail);
            
            const websiteValue = website ? website.value : 'field not found';
            const phone2Value = phone2 ? phone2.value : 'field not found';
            const backupEmailValue = backupEmail ? backupEmail.value : 'field not found';
            
            console.log('Honeypot values:', websiteValue, phone2Value, backupEmailValue);
            
            if ((website && website.value) || (phone2 && phone2.value) || (backupEmail && backupEmail.value)) {
                console.log('Bot detected - preventing submission');
                return;
            }
            
            console.log('Honeypots passed, continuing...');
            
            // Update subject line and order summary
            updateSubject();
            updateOrderSummary();
            
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.textContent = 'Sending your order...';
            submitBtn.style.background = '#666';
            submitBtn.disabled = true;
            
            console.log('Submitting to Netlify...');
            
            // Submit to Netlify via fetch
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(new FormData(form)).toString()
            })
            .then(() => {
                console.log('Form submitted successfully, redirecting...');
                // Redirect to success page with order data
                const paymentChoice = document.getElementById('payment-timing').value;
                window.location.href = `/success?total=${cartTotal}&orderNumber=${orderNumber}&payment=${paymentChoice}`;
            })
            .catch((error) => {
                console.error('Form submission error:', error);
                alert('Error submitting form. Please try again.');
                submitBtn.textContent = 'Send My Order!';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            });
        });
        
        // Update subject as they type their name
        const nameField = document.getElementById('customer-name');
        if (nameField) {
            nameField.addEventListener('input', updateSubject);
        }
    } else {
        console.log('Form not found!');
    }
    
    // Setup lightbox for hat images
    const hatImages = document.querySelectorAll('.hat-image');
    hatImages.forEach(img => {
        img.addEventListener('click', function(e) {
            // Prevent checkbox from being toggled when clicking image
            e.preventDefault();
            e.stopPropagation();
            
            const hatDiv = this.closest('.hat');
            const hatName = hatDiv.querySelector('h3').textContent;
            const hatDescription = hatDiv.querySelector('.hat-info p').textContent;
            const priceElement = hatDiv.querySelector('.price');
            const hatPrice = priceElement ? priceElement.textContent : '';
            const isSold = hatDiv.classList.contains('sold');
            
            openLightbox(this.src, hatName, hatDescription, hatPrice, isSold);
        });
    });
    
    // Lightbox controls
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
});