document.addEventListener('DOMContentLoaded', () => {
  // --- AUDIO SYNTHESIS ENGINE ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(type) {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  }

  // Exposed global click sound helper
  window.playClickSound = () => {
    playSynthSound('click');
  };

  // --- ALPHA REGISTRATION HANDLER ---
  const alphaForm = document.getElementById('alpha-form');
  const successMessage = document.getElementById('signup-success');

  if (alphaForm) {
    alphaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;

      // Save lead details to localStorage
      try {
        const existingLeads = JSON.parse(localStorage.getItem('aetheria_leads') || '[]');
        existingLeads.push({
          name: username,
          email: email,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('aetheria_leads', JSON.stringify(existingLeads));
      } catch (err) {
        console.error("Local storage save failed:", err);
      }

      // Play success chime
      playSynthSound('success');

      // UI Transition
      alphaForm.style.display = 'none';
      successMessage.style.display = 'block';
    });
  }

  // --- GENERAL CLICK EVENTS ON CARDS ---
  const tierButtons = document.querySelectorAll('.btn-tier');
  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('click');
      alert("Founder tiers are ready for simulated pledges! In the commercial release, this directs to the Stripe/Kickstarter checkout panel.");
    });
  });
});
