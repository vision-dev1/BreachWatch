document.addEventListener('DOMContentLoaded', () => {
    const checkForm = document.getElementById('checkForm');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    
    // UI Elements for updates
    const riskScoreValue = document.getElementById('riskScoreValue');
    const gaugeCircle = document.getElementById('gaugeCircle');
    const matchBadge = document.getElementById('matchBadge');
    const breachList = document.getElementById('breachList');
    const reportTitle = document.getElementById('reportTitle');

    // Gauge constants
    const CIRCUMFERENCE = 552.92;

    checkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;

        // Reset UI
        submitBtn.disabled = true;
        submitBtn.innerText = 'Scanning...';
        
        // Initial reset of values
        updateGauge(0);
        riskScoreValue.innerText = '0';
        matchBadge.innerText = 'Analyzing...';
        breachList.innerHTML = '<div class="text-center py-8 text-on-surface-variant/40">Searching databases...</div>';

        try {
            const response = await fetch('/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            submitBtn.disabled = false;
            submitBtn.innerText = 'Check Breach';

            if (response.ok) {
                renderResults(data);
            } else {
                renderError(data.error || 'Check failed');
            }

        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Check Breach';
            renderError('Connection lost');
        }
    });

    function updateGauge(score) {
        // Score is 0-100 based on risk
        const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
        gaugeCircle.style.strokeDashoffset = offset;
        
        // Change color based on score
        if (score > 60) {
            gaugeCircle.classList.remove('text-accent-green', 'text-yellow-500');
            gaugeCircle.classList.add('text-primary');
        } else if (score > 30) {
            gaugeCircle.classList.remove('text-primary', 'text-accent-green');
            gaugeCircle.classList.add('text-yellow-500');
        } else {
            gaugeCircle.classList.remove('text-primary', 'text-yellow-500');
            gaugeCircle.classList.add('text-accent-green');
        }
    }

    function renderResults(data) {
        breachList.innerHTML = '';
        
        if (data.status === 'clean' || !data.breaches_found) {
            riskScoreValue.innerText = '0';
            updateGauge(5); // Low offset for show
            matchBadge.innerText = '0 Matches';
            matchBadge.className = 'text-xs font-bold text-accent-green tracking-widest uppercase bg-green-500/10 px-3 py-1 rounded-full';
            breachList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-center">
                    <span class="material-symbols-outlined text-accent-green text-5xl mb-4">verified_user</span>
                    <h4 class="text-xl font-bold mb-2">Email is Secure</h4>
                    <p class="text-on-surface-variant/60 max-w-sm">No recorded exposures found in our database for this account.</p>
                </div>
            `;
        } else {
            const count = data.count;
            const score = Math.min(count * 5, 100); // 1 count = 5 score for gauge visibility
            riskScoreValue.innerText = score;
            updateGauge(score);
            
            matchBadge.innerText = `${count} Matches Detected`;
            matchBadge.className = 'text-xs font-bold text-primary tracking-widest uppercase bg-error-container/30 px-3 py-1 rounded-full';
            
            // Limit shown breaches to 50 for performance
            const displayLimit = 50;
            const displayBreaches = data.breaches.slice(0, displayLimit);

            displayBreaches.forEach(breach => {
                const item = document.createElement('div');
                item.className = 'flex items-center justify-between group cursor-default animate-fade-in';
                
                let icon = 'security';
                const lowerName = breach.name.toLowerCase();
                if (lowerName.includes('linkedin')) icon = 'work';
                else if (lowerName.includes('adobe')) icon = 'brush';
                else if (lowerName.includes('canva')) icon = 'palette';
                else if (lowerName.includes('facebook')) icon = 'group';
                else if (lowerName.includes('twitter')) icon = 'chat';

                item.innerHTML = `
                    <div class="flex items-center gap-6">
                        <div class="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-on-surface-variant">${icon}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-on-surface text-lg">${breach.name}</h4>
                            <p class="text-sm text-on-surface-variant/60">Risk Source • Verified Database</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-on-error-container bg-error-container px-3 py-1 rounded-full uppercase tracking-tighter">Exposed</span>
                `;
                breachList.appendChild(item);
            });

            if (count > displayLimit) {
                const moreItem = document.createElement('div');
                moreItem.className = 'py-4 text-center text-on-surface-variant/40 border-t border-outline-variant/10 text-sm font-medium';
                moreItem.innerText = `+ ${count - displayLimit} more exposures identified`;
                breachList.appendChild(moreItem);
            }
        }
    }

    function renderError(message) {
        riskScoreValue.innerText = '!';
        updateGauge(0);
        matchBadge.innerText = 'Error';
        matchBadge.className = 'text-xs font-bold text-on-surface-variant/40 tracking-widest uppercase bg-surface-container px-3 py-1 rounded-full';
        breachList.innerHTML = `<div class="text-center py-8 text-primary font-bold">${message}</div>`;
    }
});

