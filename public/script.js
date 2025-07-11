// Tab functionality with smooth transitions
function openTab(evt, tabName) {
    if (!evt || !tabName) {
        console.error('Invalid parameters for openTab:', evt, tabName);
        return;
    }
    
    const tabContents = document.getElementsByClassName('tab-content');
    const tabButtons = document.getElementsByClassName('tab-button');
    
    console.log('Opening tab:', tabName);
    console.log('Available tab contents:', Array.from(tabContents).map(el => el.id));
    
    // Hide all tab contents with fade out
    for (let content of tabContents) {
        if (content.classList.contains('active')) {
            content.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => {
                content.classList.remove('active');
                content.style.animation = '';
            }, 200);
        }
    }
    
    // Remove active class from all buttons
    for (let button of tabButtons) {
        button.classList.remove('active');
        console.log('Removed active from button:', button.textContent);
    }
    
    // Show the selected tab and mark button as active immediately (no delay)
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        setTimeout(() => {
            tabContent.classList.add('active');
            console.log('Added active to tab content:', tabName);
        }, 250);
    } else {
        console.error('Tab content not found:', tabName);
        console.log('All elements with IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    }
    
    if (evt.currentTarget) {
        evt.currentTarget.classList.add('active');
        console.log('Added active to button:', evt.currentTarget.textContent);
        console.log('Button classes:', evt.currentTarget.className);
    } else {
        console.error('Button target not found');
    }
}

// Add fadeOut keyframe if not exists
if (!document.querySelector('style[data-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-animations', 'true');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error">Error: ${message}</div>`;
    container.style.display = 'block';
}

function displayResult(content, contentId, containerId) {
    document.getElementById(contentId).textContent = content;
    document.getElementById(containerId).style.display = 'block';
}

// API call function
async function makeAPICall(endpoint, data) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
    }
    
    return await response.json();
}

// Plan Vacation Form Handler
document.getElementById('vacation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    try {
        const formData = new FormData(e.target);
        const data = {
            sourceCity: formData.get('sourceCity'),
            destination: formData.get('destination'),
            budgetAmount: parseInt(formData.get('budgetAmount')),
            currency: formData.get('currency'),
            duration: parseInt(formData.get('duration')),
            interests: formData.get('interests') ? 
                formData.get('interests').split(',').map(i => i.trim()).filter(i => i) : 
                ['sightseeing'],
            travelStyle: formData.get('travelStyle')
        };
        
        const result = await makeAPICall('/api/plan-vacation', data);
        displayResult(result.plan, 'vacation-plan', 'vacation-result');
        
    } catch (error) {
        showError(error.message, 'vacation-result');
    } finally {
        hideLoading();
    }
});

// Suggest Destinations Form Handler
document.getElementById('destinations-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    try {
        const formData = new FormData(e.target);
        const data = {
            sourceCity: formData.get('sourceCity'),
            climate: formData.get('climate'),
            activities: formData.get('activities') ? 
                formData.get('activities').split(',').map(a => a.trim()).filter(a => a) : 
                ['varied'],
            budgetAmount: formData.get('budgetAmount') ? parseInt(formData.get('budgetAmount')) : null,
            currency: formData.get('currency'),
            region: formData.get('region')
        };
        
        const result = await makeAPICall('/api/suggest-destinations', data);
        displayResult(result.suggestions, 'destinations-list', 'destinations-result');
        
    } catch (error) {
        showError(error.message, 'destinations-result');
    } finally {
        hideLoading();
    }
});

// Estimate Budget Form Handler
document.getElementById('budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    try {
        const formData = new FormData(e.target);
        const data = {
            sourceCity: formData.get('sourceCity'),
            destination: formData.get('destination'),
            duration: parseInt(formData.get('duration')),
            travelStyle: formData.get('travelStyle'),
            currency: formData.get('currency')
        };
        
        const result = await makeAPICall('/api/estimate-budget', data);
        displayResult(result.estimate, 'budget-estimate', 'budget-result');
        
    } catch (error) {
        showError(error.message, 'budget-result');
    } finally {
        hideLoading();
    }
});

// Auto-detect location on page load
async function autoDetectLocation() {
    if (!navigator.geolocation) {
        return; // Silently fail if geolocation not supported
    }
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false, // Use less accurate but faster detection
                timeout: 5000, // Shorter timeout for auto-detection
                maximumAge: 3600000 // 1 hour cache
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Get city name from coordinates
        const response = await fetch('/api/get-location-city', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Auto-fill all source city inputs
            const sourceCityInputs = document.querySelectorAll('input[name="sourceCity"]');
            sourceCityInputs.forEach(input => {
                if (!input.value) { // Only fill if empty
                    input.value = data.city;
                    input.style.background = 'rgba(74, 222, 128, 0.1)'; // Light green background
                    input.setAttribute('title', 'Auto-detected location');
                }
            });
        }
        
    } catch (error) {
        // Silently fail - don't show error for auto-detection
        console.log('Auto-location detection skipped:', error.message);
    }
}

// Enhanced form interactions and feedback
document.addEventListener('DOMContentLoaded', function() {
    // Auto-detect location on page load
    autoDetectLocation();
    
    // Add pulse animation to submit buttons when form is valid
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const submitBtn = form.querySelector('.btn-primary');
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        function checkFormValidity() {
            const isValid = Array.from(inputs).every(input => input.value.trim() !== '');
            if (isValid && !submitBtn.classList.contains('pulse')) {
                submitBtn.classList.add('pulse');
            } else if (!isValid && submitBtn.classList.contains('pulse')) {
                submitBtn.classList.remove('pulse');
            }
        }
        
        inputs.forEach(input => {
            input.addEventListener('input', checkFormValidity);
            input.addEventListener('change', checkFormValidity);
        });
        
        // Add focus/blur animations to form groups
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
                this.parentElement.style.transition = 'transform 0.3s ease';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
            });
        });
    });
    
    // Add loading state to submit buttons
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            submitBtn.classList.remove('pulse');
            
            // Reset button state if form submission fails
            setTimeout(() => {
                if (submitBtn.disabled) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }, 30000); // 30 second timeout
        });
    });
});

// Clear results when switching tabs with animation
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Hide all result containers with fade animation
        document.querySelectorAll('.result-container').forEach(container => {
            if (container.style.display !== 'none') {
                container.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    container.style.display = 'none';
                    container.style.animation = '';
                }, 300);
            }
        });
        
        // Reset all submit buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('pulse');
            if (btn.textContent.includes('Processing')) {
                btn.textContent = btn.textContent.replace('Processing...', 
                    btn.closest('form').id === 'vacation-form' ? 'Generate Vacation Plan' :
                    btn.closest('form').id === 'destinations-form' ? 'Get Suggestions' : 
                    'Estimate Budget');
            }
        });
    });
});

// Add smooth scroll to results
function displayResult(content, contentId, containerId) {
    document.getElementById(contentId).textContent = content;
    const container = document.getElementById(containerId);
    container.style.display = 'block';
    
    // Smooth scroll to result
    setTimeout(() => {
        container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest' 
        });
    }, 100);
}

// Enhanced error display with better animations
function showError(message, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="error">Error: ${message}</div>`;
    container.style.display = 'block';
    
    // Smooth scroll to error
    setTimeout(() => {
        container.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest' 
        });
    }, 100);
}

// Geolocation functionality
async function detectLocation(inputId) {
    const button = event.target;
    const input = document.getElementById(inputId);
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }
    
    button.classList.add('loading');
    button.textContent = '🔄';
    button.disabled = true;
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Get city name from coordinates
        const response = await fetch('/api/get-location-city', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
        });
        
        if (response.ok) {
            const data = await response.json();
            input.value = data.city;
            button.textContent = '✅';
            setTimeout(() => {
                button.textContent = '📍';
                button.classList.remove('loading');
                button.disabled = false;
            }, 2000);
        } else {
            throw new Error('Failed to get location');
        }
        
    } catch (error) {
        console.error('Geolocation error:', error);
        button.textContent = '❌';
        alert('Unable to detect location. Please enter manually.');
        setTimeout(() => {
            button.textContent = '📍';
            button.classList.remove('loading');
            button.disabled = false;
        }, 2000);
    }
}

// Advanced vacation planning with workflow
document.getElementById('vacation-advanced-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    
    const formData = new FormData(e.target);
    const data = {
        sourceCity: formData.get('sourceCity'),
        destination: formData.get('destination'),
        budgetAmount: parseInt(formData.get('budgetAmount')),
        currency: formData.get('currency'),
        duration: parseInt(formData.get('duration')),
        interests: formData.get('interests') ? 
            formData.get('interests').split(',').map(i => i.trim()).filter(i => i) : 
            ['sightseeing'],
        travelStyle: formData.get('travelStyle')
    };
    
    try {
        // For serverless deployment, we execute the workflow directly
        const response = await makeAPICall('/api/plan-vacation-advanced', data);
        
        if (response.status === 'completed') {
            hideLoading();
            displayResult(response.result.finalPlan, 'vacation-advanced-plan', 'vacation-advanced-result');
        } else if (response.workflowId) {
            // Fallback for full server deployment
            document.getElementById('workflow-progress').style.display = 'block';
            document.getElementById('vacation-advanced-result').style.display = 'none';
            hideLoading();
            pollWorkflowProgress(response.workflowId);
        } else {
            hideLoading();
            displayResult(response.plan || 'Advanced planning completed', 'vacation-advanced-plan', 'vacation-advanced-result');
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message, 'vacation-advanced-result');
    }
});

// Poll workflow progress
async function pollWorkflowProgress(workflowId) {
    const progressBar = document.getElementById('progress-fill');
    const messageEl = document.getElementById('workflow-message');
    const timeEl = document.getElementById('workflow-time');
    const steps = document.querySelectorAll('.workflow-steps .step');
    
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/workflow-status/${workflowId}`);
            const status = await response.json();
            
            if (status.status === 'completed') {
                clearInterval(pollInterval);
                
                // Update progress to 100%
                progressBar.style.width = '100%';
                messageEl.textContent = 'Planning completed! 🎉';
                
                // Mark all steps as completed
                steps.forEach(step => {
                    step.classList.remove('active');
                    step.classList.add('completed');
                });
                
                // Show results
                setTimeout(() => {
                    document.getElementById('workflow-progress').style.display = 'none';
                    displayResult(status.result.finalPlan, 'vacation-advanced-plan', 'vacation-advanced-result');
                }, 1500);
                
            } else if (status.status === 'running') {
                // Update progress (simulate based on time)
                const runtime = status.runtime || 0;
                const estimatedTotal = 180000; // 3 minutes
                const progress = Math.min((runtime / estimatedTotal) * 100, 95);
                
                progressBar.style.width = `${progress}%`;
                messageEl.textContent = 'AI agents working on your vacation plan...';
                timeEl.textContent = `Runtime: ${Math.floor(runtime / 1000)}s`;
                
                // Update step visualization (simulate)
                const activeStepIndex = Math.floor(progress / 10);
                steps.forEach((step, index) => {
                    step.classList.remove('active', 'completed');
                    if (index < activeStepIndex) {
                        step.classList.add('completed');
                    } else if (index === activeStepIndex) {
                        step.classList.add('active');
                    }
                });
            }
            
        } catch (error) {
            console.error('Error polling workflow status:', error);
            clearInterval(pollInterval);
            showError('Failed to track planning progress', 'vacation-advanced-result');
        }
    }, 2000); // Poll every 2 seconds
    
    // Timeout after 5 minutes
    setTimeout(() => {
        clearInterval(pollInterval);
        showError('Planning timeout - please try again', 'vacation-advanced-result');
    }, 300000);
}

// Currency conversion functionality
async function convertCurrency(amount, fromCurrency, toCurrency) {
    try {
        const response = await fetch('/api/convert-currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, fromCurrency, toCurrency })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Currency conversion failed');
        }
    } catch (error) {
        console.error('Currency conversion error:', error);
        return null;
    }
}

// Add currency conversion hints to budget inputs
document.addEventListener('DOMContentLoaded', function() {
    const budgetInputs = document.querySelectorAll('input[name="budgetAmount"]');
    const currencySelects = document.querySelectorAll('select[name="currency"]');
    
    function addCurrencyConverter() {
        budgetInputs.forEach((input, index) => {
            const currencySelect = currencySelects[index];
            if (!currencySelect) return;
            
            let conversionHint = input.parentElement.querySelector('.currency-hint');
            if (!conversionHint) {
                conversionHint = document.createElement('div');
                conversionHint.className = 'currency-hint';
                conversionHint.style.cssText = `
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 5px;
                    opacity: 0.8;
                `;
                input.parentElement.appendChild(conversionHint);
            }
            
            async function updateConversion() {
                const amount = parseFloat(input.value);
                const currency = currencySelect.value;
                
                if (amount && currency && currency !== 'USD') {
                    const conversion = await convertCurrency(amount, currency, 'USD');
                    if (conversion) {
                        conversionHint.textContent = `≈ $${conversion.convertedAmount} USD`;
                    }
                } else {
                    conversionHint.textContent = '';
                }
            }
            
            input.addEventListener('input', updateConversion);
            currencySelect.addEventListener('change', updateConversion);
        });
    }
    
    addCurrencyConverter();
});