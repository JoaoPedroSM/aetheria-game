document.addEventListener('DOMContentLoaded', () => {
  // --- TRANSLATION & LOCALIZATION ENGINE ---
  const translations = {
    en: {
      "nav-about": "About",
      "nav-demo": "Play Demo",
      "nav-features": "Features",
      "nav-preorder": "Support Us",
      "nav-signup": "Join Alpha",
      "hero-badge": "SOLARPUNK SKY TRADING RPG",
      "hero-title": "Aetheria:<br><span class=\"highlight\">Shattered Horizons</span>",
      "hero-desc": "Command sailing airships, master volatile supply-and-demand markets, and survive toxic electrical storms. Forge your legend in a shattered sky world.",
      "btn-play-demo": "Play Free Web Demo",
      "btn-join-alpha": "Sign Up for Alpha",
      "demo-title": "Interactive Sky Terminal",
      "demo-desc": "Test your trading instincts and piloting skills in our live pre-alpha web prototype below.",
      "demo-tip": "💡 TIP: Explore Aether Shallows, gather materials, unlock skills, and sell to the bazaar market.",
      "features-title": "Game Mechanics",
      "features-desc": "Discover the core pillars of the Aetheria commercial release.",
      "feat1-title": "Logarithmic Market Economy",
      "feat1-desc": "Prices scale dynamically using real-time supply-and-demand formulas. Exploit Aether Storm price surges or stock up during surpluses.",
      "feat2-title": "Airship Engineering",
      "feat2-desc": "Mount Heavy Cannons, install Singularity Engines, and weld Obsidian Plating. Specialize in Aether-Smith or Bio-Engineer skill paths.",
      "feat3-title": "Volatile Sky Expeditions",
      "feat3-desc": "Steer through Cobalt Peaks and Dragon's Nest. Manage hull integrity and suit radiation toxicity under unpredictable storm cells.",
      "support-title": "Support the Development",
      "support-desc": "Help fund Aetheria's transition to a commercial engine. Unlock exclusive digital rewards.",
      "tier1-badge": "TIER 1",
      "tier1-title": "Prospector Pack",
      "t1-f1": "Full Digital Game (Steam Key)",
      "t1-f2": "Pre-Alpha Access (Itch.io)",
      "t1-f3": "Exclusive Discord Captain Role",
      "tier2-badge": "MOST POPULAR",
      "tier2-title": "Captain Pack",
      "t2-f1": "Full Digital Game (Steam Key)",
      "t2-f2": "Founder's Brass Airship Hull Skin",
      "t2-f3": "Digital Soundtrack & Concept Art Book",
      "t2-f4": "All T1 Rewards Included",
      "tier3-badge": "TIER 3",
      "tier3-title": "Legendary Smelter",
      "t3-f1": "Your Name in Game Credits",
      "t3-f2": "Aether Singularity Glow Engine Skin",
      "t3-f3": "Founder E-Book (100-pg GDD Spec)",
      "t3-f4": "All T1 & T2 Rewards Included",
      "btn-back-tier": "Back This Tier",
      "signup-title": "Register for the Closed Alpha",
      "signup-desc": "Be the first to explore the Shattered Horizons. Spots are limited!",
      "btn-submit-text": "🚀 Request Alpha Access",
      "success-title": "🎉 Registration Successful!",
      "success-desc": "Welcome aboard, Captain. We will email your steam code once the server keys are compiled."
    },
    pt: {
      "nav-about": "Sobre",
      "nav-demo": "Jogar Demo",
      "nav-features": "Recursos",
      "nav-preorder": "Apoie-nos",
      "nav-signup": "Entrar no Alpha",
      "hero-badge": "RPG SOLARPUNK DE COMÉRCIO NOS CÉUS",
      "hero-title": "Aetheria:<br><span class=\"highlight\">Horizontes Despedaçados</span>",
      "hero-desc": "Comande naves voadoras, domine mercados flutuantes de oferta e demanda e sobreviva a tempestades elétricas tóxicas. Escreva sua história nos céus.",
      "btn-play-demo": "Jogar Demo Grátis",
      "btn-join-alpha": "Participar do Alpha",
      "demo-title": "Terminal de Voo Interativo",
      "demo-desc": "Teste seus instintos de mercador e pilotagem no protótipo web pre-alpha abaixo.",
      "demo-tip": "💡 DICA: Explore Aether Shallows, colete recursos, desbloqueie talentos e venda no mercado flutuante.",
      "features-title": "Mecânicas de Jogo",
      "features-desc": "Conheça os pilares fundamentais do lançamento de Aetheria.",
      "feat1-title": "Economia com Fórmula Logarítmica",
      "feat1-desc": "Os preços oscilam dinamicamente por oferta e demanda real. Aproveite surtos inflacionários nas tempestades celestes.",
      "feat2-title": "Engenharia de Naves Celestes",
      "feat2-desc": "Equipe Canhões Pesados, motores de Singularidade e Placas de Obsidiana. Siga os caminhos de Ferreiro ou Bioengenheiro.",
      "feat3-title": "Expedições Climáticas Voláteis",
      "feat3-desc": "Navegue por Cobalt Peaks e Ninho do Dragão. Controle o desgaste do casco e o nível de toxicidade sob radiação das nuvens.",
      "support-title": "Apoie o Desenvolvimento",
      "support-desc": "Ajude a financiar a migração do jogo para uma engine comercial. Ganhe itens exclusivos digitais.",
      "tier1-badge": "TIER 1",
      "tier1-title": "Pacote Garimpeiro",
      "t1-f1": "Jogo Digital Completo (Chave Steam)",
      "t1-f2": "Acesso ao Pre-Alpha (Itch.io)",
      "t1-f3": "Cargo exclusivo de Capitão no Discord",
      "tier2-badge": "MAIS POPULAR",
      "tier2-title": "Pacote Capitão",
      "t2-f1": "Jogo Digital Completo (Chave Steam)",
      "t2-f2": "Pintura de Bronze Founder para a Nave",
      "t2-f3": "Trilha Sonora Digital & Artbook Conceitual",
      "t2-f4": "Todas as recompensas do Tier 1 Inclusas",
      "tier3-badge": "TIER 3",
      "tier3-title": "Fundidor Lendário",
      "t3-f1": "Seu nome nos créditos finais",
      "t3-f2": "Pintura Luminosa do Motor de Singularidade",
      "t3-f3": "E-Book de Desenvolvimento (GDD de 100 págs)",
      "t3-f4": "Todas as recompensas T1 & T2 Inclusas",
      "btn-back-tier": "Apoiar Este Tier",
      "signup-title": "Registre-se para a Alpha Fechada",
      "signup-desc": "Seja um dos primeiros a cruzar os Horizontes Despedaçados. Vagas limitadas!",
      "btn-submit-text": "🚀 Solicitar Acesso Alpha",
      "success-title": "🎉 Inscrição Realizada com Sucesso!",
      "success-desc": "Bem-vindo a bordo, Capitão. Enviaremos sua chave Steam por e-mail assim que os servidores forem compilados."
    }
  };

  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');

  function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Translate placeholders
    if (usernameInput && emailInput) {
      if (lang === 'pt') {
        usernameInput.placeholder = "Seu Nome";
        emailInput.placeholder = "Seu E-mail";
      } else {
        usernameInput.placeholder = "Your Name";
        emailInput.placeholder = "Email Address";
      }
    }

    document.getElementById('language-select').value = lang;
  }

  // Language selector listener
  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      localStorage.setItem('aetheria_lang', selectedLang);
      applyLanguage(selectedLang);
      playSynthSound('click');
    });
  }

  // Detect and set initial language
  const savedLang = localStorage.getItem('aetheria_lang') || 'en';
  applyLanguage(savedLang);

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
      
      const username = usernameInput.value;
      const email = emailInput.value;

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
      const currentLang = localStorage.getItem('aetheria_lang') || 'en';
      if (currentLang === 'pt') {
        alert("Os tiers de apoiador estão configurados para doações simuladas! No lançamento comercial, isso redirecionará para a tela de pagamentos (Stripe/PayPal/Kickstarter).");
      } else {
        alert("Founder tiers are ready for simulated pledges! In the commercial release, this directs to the Stripe/Kickstarter checkout panel.");
      }
    });
  });
});
