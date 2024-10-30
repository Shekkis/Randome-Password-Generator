const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate');
  const copyBtn = document.getElementById('copy');
  const passwordInput = document.getElementById('password');
  const passwordList = document.getElementById('password-list');
  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');

  function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length criteria
    if (password.length >= 20) score += 3;
    else if (password.length >= 15) score += 2;
    else if (password.length >= 10) score += 1;
    
    // Required character types
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 1;
    
    // Variety bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.8) score += 2;
    else if (uniqueChars > password.length * 0.6) score += 1;

    // Penalty for missing required characters
    if (!hasUpper || !hasLower || !hasNumbers || !hasSymbols) {
      score = Math.max(0, score - 2); // Significant penalty for missing requirements
    }

    // Length penalty
    if (password.length < 10) {
      score = Math.min(2, score); // Cap score at 'weak' if length is too short
    }

    return score;
  }

  function updateStrengthIndicator(password) {
    const score = calculatePasswordStrength(password);
    let strength, color, percentage;

    if (score >= 7) {
      strength = 'Very Strong';
      color = '#2E7D32';
      percentage = 100;
    } else if (score >= 5) {
      strength = 'Strong';
      color = '#4CAF50';
      percentage = 75;
    } else if (score >= 3) {
      strength = 'Medium';
      color = '#FFA000';
      percentage = 50;
    } else {
      strength = 'Weak';
      color = '#D32F2F';
      percentage = 25;
    }

    strengthFill.style.width = `${percentage}%`;
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = strength;
    strengthText.style.color = color;
  }

  generateBtn.addEventListener('click', () => {
    const options = {
      length: parseInt(document.getElementById('length').value),
      hasUpper: document.getElementById('uppercase').checked,
      hasLower: document.getElementById('lowercase').checked,
      hasNumbers: document.getElementById('numbers').checked,
      hasSymbols: document.getElementById('symbols').checked,
      avoidAmbiguous: document.getElementById('avoidAmbiguous').checked,
      noRepeats: document.getElementById('noRepeats').checked,
      pronounceable: document.getElementById('pronounceable').checked
    };

    ipcRenderer.send('generate-password', options);
  });

  copyBtn.addEventListener('click', () => {
    const password = passwordInput.value;
    if (password) {
      ipcRenderer.send('copy-to-clipboard', password);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    }
  });

  ipcRenderer.on('password-generated', (event, password) => {
    passwordInput.value = password;
    updateStrengthIndicator(password);
    
    const passwordItem = document.createElement('div');
    passwordItem.className = 'password-item';
    passwordItem.textContent = password;
    
    if (passwordList.firstChild) {
      passwordList.insertBefore(passwordItem, passwordList.firstChild);
    } else {
      passwordList.appendChild(passwordItem);
    }
  });

  // Handle pronounceable checkbox
  document.getElementById('pronounceable').addEventListener('change', (e) => {
    const checkboxes = ['uppercase', 'lowercase', 'numbers', 'symbols', 'noRepeats', 'avoidAmbiguous'];
    checkboxes.forEach(id => {
      const checkbox = document.getElementById(id);
      checkbox.disabled = e.target.checked;
      if (e.target.checked) checkbox.checked = false;
    });
  });
});