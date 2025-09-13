// JW Knitique - Simple JavaScript for hat ordering

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

// Form submission feedback
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[name="hat-orders"]');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            const submitBtn = document.querySelector('.submit-btn');
            
            // Change button text to show it's working
            submitBtn.textContent = 'Sending your order...';
            submitBtn.style.background = '#666';
            submitBtn.disabled = true;
        });
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

// Add sparkle effect to order buttons
document.addEventListener('DOMContentLoaded', function() {
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            addSparkle(this);
        });
    });
});
