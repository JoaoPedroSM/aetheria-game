document.addEventListener('DOMContentLoaded', () => {
  // --- WEB AUDIO API SYNTHESISER ---
  let audioCtx = null;
  let soundMuted = false;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playSynthSound(type) {
    if (soundMuted) return;
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
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'gather') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(550, now + 0.25);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'craft') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.4);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'equip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(200, now + 0.08);
        osc.frequency.setValueAtTime(260, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  // --- GLOWING SPARK PARTICLES SYSTEM ---
  function spawnSpark(x, y) {
    if (!x || !y) return;
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement('div');
      spark.className = 'spark-particle';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 1.5;
      
      document.body.appendChild(spark);
      
      let px = x;
      let py = y;
      let opacity = 1.0;
      
      const frame = setInterval(() => {
        px += vx;
        py += vy;
        opacity -= 0.04;
        spark.style.left = `${px}px`;
        spark.style.top = `${py}px`;
        spark.style.opacity = opacity;
        
        if (opacity <= 0) {
          clearInterval(frame);
          spark.remove();
        }
      }, 25);
    }
  }

  // --- STATE ---
  const state = {
    gold: 150,
    aetherium: 10,
    level: 1,
    xp: 0,
    xpNeeded: 100,
    skillPoints: 2,
    toxicity: 0,
    hull: 100,
    inventory: [
      { id: 'wood', name: 'Wood', qty: 10, icon: '🪵', type: 'resource' },
      { id: 'copper_ore', name: 'Copper Ore', qty: 5, icon: '🪨', type: 'resource' },
      { id: 'cloud_kelp', name: 'Cloud Kelp', qty: 4, icon: '🌿', type: 'resource' }
    ],
    inventoryCapacity: 16,
    equipped: {
      tool: { id: 'stone_axe', name: 'Stone Axe', icon: '🪓' },
      armor: { id: 'cloth_tunic', name: 'Cloth Tunic', icon: '👕' },
      accessory: { id: 'none', name: 'None', icon: '💍' }
    },
    // Navigation Location State
    currentLocation: 'shallows',
    stormActive: false,
    locations: {
      shallows: { 
        id: 'shallows', 
        name: 'Aether Shallows 🏝️', 
        desc: 'Secure starter area. Contains basic common materials.', 
        cost: {}, 
        toolPrereq: null, 
        accessoryPrereq: null, 
        minLvl: 1 
      },
      peaks: { 
        id: 'peaks', 
        name: 'Cobalt Peaks 🏔️', 
        desc: 'High altitudes. Rich in Cobalt & Iron. Requires Aether-Steel Pickaxe and 15 Wood for maintenance.', 
        cost: { wood: 15 }, 
        toolPrereq: 'aether_pickaxe', 
        accessoryPrereq: null, 
        minLvl: 2 
      },
      eye: { 
        id: 'eye', 
        name: 'The Shattered Eye 🌀', 
        desc: 'Eye of the tempest. Extreme danger! Requires Aether-Infused Bow and 2 Aether Shards for fuel.', 
        cost: { aether_shard: 2 }, 
        toolPrereq: null, 
        accessoryPrereq: 'aether_bow', 
        minLvl: 4 
      },
      abyss: { 
        id: 'abyss', 
        name: 'Obsidian Abyss 🌋', 
        desc: 'Deep floating cavern. Rich in Obsidian. Requires Level 5, Singularity Engine (Smithing A8) and 20 Steel Ingots.', 
        cost: { steel_ingot: 20 }, 
        toolPrereq: 'aether_pickaxe', 
        accessoryPrereq: null, 
        minLvl: 5 
      },
      nest: { 
        id: 'nest', 
        name: "The Dragon's Nest 🐉", 
        desc: 'Legendary boss boundary. Requires Level 7, Heavy Cannons (Smithing A3), Aether Bow, and 3 Aether Shards.', 
        cost: { aether_shard: 3 }, 
        toolPrereq: null, 
        accessoryPrereq: 'aether_bow', 
        minLvl: 7 
      }
    },
    // Passive multipliers adjusted by skills
    multipliers: {
      gatherYield: 1.0,
      craftSpeed: 1.0,
      toxicityDefense: 0,
      marketSellBonus: 1.0
    },
    market: {
      wood: { name: 'Wood', icon: '🪵', basePrice: 3, supply: 120, targetSupply: 150, alpha: 0.5, minPrice: 1, maxPrice: 15 },
      copper_ore: { name: 'Copper Ore', icon: '🪨', basePrice: 6, supply: 60, targetSupply: 100, alpha: 0.5, minPrice: 2, maxPrice: 25 },
      iron_ore: { name: 'Iron Ore', icon: '⛓️', basePrice: 12, supply: 30, targetSupply: 80, alpha: 0.6, minPrice: 3, maxPrice: 50 },
      aether_shard: { name: 'Aether Shard', icon: '💎', basePrice: 22, supply: 10, targetSupply: 50, alpha: 0.6, minPrice: 5, maxPrice: 90 },
      steel_ingot: { name: 'Steel Ingot', icon: '🧱', basePrice: 30, supply: 8, targetSupply: 40, alpha: 0.7, minPrice: 8, maxPrice: 120 },
      spore_mushroom: { name: 'Spore Mushroom', icon: '🍄', basePrice: 8, supply: 70, targetSupply: 120, alpha: 0.5, minPrice: 2, maxPrice: 30 },
      cloud_kelp: { name: 'Cloud Kelp', icon: '🌿', basePrice: 5, supply: 80, targetSupply: 130, alpha: 0.5, minPrice: 1, maxPrice: 20 },
      obsidian_ore: { name: 'Obsidian Ore', icon: '🌋', basePrice: 45, supply: 5, targetSupply: 25, alpha: 0.7, minPrice: 10, maxPrice: 150 },
      dragon_scale: { name: 'Dragon Scale', icon: '🐉', basePrice: 120, supply: 1, targetSupply: 10, alpha: 0.8, minPrice: 30, maxPrice: 400 },
      aether_pearl: { name: 'Aether Pearl', icon: '🦪', basePrice: 15, supply: 10, targetSupply: 30, alpha: 0.6, minPrice: 3, maxPrice: 60 },
      lightning_essence: { name: 'Lightning Essence', icon: '⚡', basePrice: 35, supply: 5, targetSupply: 15, alpha: 0.7, minPrice: 8, maxPrice: 110 }
    },
    recipes: [
      {
        id: 'steel_ingot',
        name: 'Steel Ingot',
        icon: '🧱',
        station: 'Forge',
        inputs: { iron_ore: 2, wood: 2 },
        duration: 2000,
        type: 'resource'
      },
      {
        id: 'aether_pickaxe',
        name: 'Aether-Steel Pickaxe',
        icon: '⛏️',
        station: 'Forge',
        inputs: { steel_ingot: 2, wood: 2, aether_shard: 1 },
        duration: 3500,
        type: 'tool',
        description: 'Increases gather yield by 50%.'
      },
      {
        id: 'cleanse_potion',
        name: 'Toxicity Cleansing Elixir',
        icon: '🧪',
        station: 'Alchemy Lab',
        inputs: { spore_mushroom: 3, cloud_kelp: 2 },
        duration: 2000,
        type: 'potion',
        description: 'Cleanses Toxicity by 60 units.'
      },
      {
        id: 'aether_bow',
        name: 'Aether-Infused Bow',
        icon: '🏹',
        station: 'Fletching Bench',
        inputs: { wood: 4, aether_shard: 2 },
        duration: 3000,
        type: 'accessory',
        description: 'Adds direct shock combat stats (+15% damage).'
      },
      {
        id: 'obsidian_plating',
        name: 'Obsidian Plating',
        icon: '🛡️',
        station: 'Forge',
        inputs: { obsidian_ore: 4, steel_ingot: 3 },
        duration: 4000,
        type: 'armor',
        description: 'Cuts incoming hull damage and toxicity gains by 50%.'
      }
    ],
    skills: {
      aether_smith: {
        A1: { id: 'A1', title: 'Base Smelting', tier: 'Tier 1', desc: 'Unlocks base smelting recipes and increases smelting speed by 20%.', cost: 1, unlocked: false, prereq: null, bonusType: 'craftSpeed', bonusVal: 0.2 },
        A2: { id: 'A2', title: 'Metallurgy', tier: 'Tier 2', desc: 'Enables high-tier alloy recipes (Steel Ingots).', cost: 1, unlocked: false, prereq: 'A1' },
        A3: { id: 'A3', title: 'Aether-Shielding', tier: 'Tier 2', desc: 'Allows mounting Heavy Cannons on ships.', cost: 1, unlocked: false, prereq: 'A1', bonusType: 'toxicityDefense', bonusVal: 0.15 },
        A8: { id: 'A8', title: 'Master Forger', tier: 'Tier 4', desc: 'Unlocks the Singularity Engine allowing travel to deep space.', cost: 2, unlocked: false, prereq: 'A2', bonusType: 'marketSellBonus', bonusVal: 0.2 }
      },
      bio_engineer: {
        B1: { id: 'B1', title: 'Botanical Cultivation', tier: 'Tier 1', desc: 'Implements smart harvesting, increasing resource gathering yield by 25%.', cost: 1, unlocked: false, prereq: null, bonusType: 'gatherYield', bonusVal: 0.25 },
        B2: { id: 'B2', title: 'Alchemy Basics', tier: 'Tier 2', desc: 'Unlocks Alchemy lab recipes (Cleansing Elixirs).', cost: 1, unlocked: false, prereq: 'B1' },
        B3: { id: 'B3', title: 'Filter Design', tier: 'Tier 2', desc: 'Integrates specialized masks. Toxicity defense +15%.', cost: 1, unlocked: false, prereq: 'B1', bonusType: 'toxicityDefense', bonusVal: 0.15 },
        B7: { id: 'B7', title: 'Master Herbalist', tier: 'Tier 4', desc: 'Doubles yield of harvested wild herbs.', cost: 2, unlocked: false, prereq: 'B2', bonusType: 'gatherYield', bonusVal: 0.3 }
      }
    }
  };

  // --- UI SELECTORS ---
  const goldEl = document.getElementById('hud-gold-val');
  const aetheriumEl = document.getElementById('hud-aether-val');
  const levelEl = document.getElementById('hud-level-val');
  const xpBarInnerEl = document.getElementById('xp-bar-inner');
  const xpTextEl = document.getElementById('xp-text-val');
  const skillPointsEl = document.getElementById('skill-points-val');
  
  const inventoryGridEl = document.getElementById('inventory-grid');
  const equipToolEl = document.getElementById('equip-tool');
  const equipArmorEl = document.getElementById('equip-armor');
  const equipAccessoryEl = document.getElementById('equip-accessory');
  
  const marketGridEl = document.getElementById('market-grid');
  const recipesGridEl = document.getElementById('recipes-grid');
  const smithTreeEl = document.getElementById('smith-tree-nodes');
  const bioTreeEl = document.getElementById('bio-tree-nodes');
  const logContainerEl = document.getElementById('log-container');
  
  const craftingOverlayEl = document.getElementById('crafting-overlay');
  const craftingProgressBarEl = document.getElementById('crafting-progress-bar');
  const craftingLabelEl = document.getElementById('crafting-label');

  // Nav, Storm & Airship Panel Selectors
  const expeditionsGridEl = document.getElementById('expeditions-grid');
  const currentLocationValEl = document.getElementById('current-location-val');
  const stormIndicatorEl = document.getElementById('storm-indicator');
  const shipEngineValEl = document.getElementById('ship-engine-val');
  const shipWeaponsValEl = document.getElementById('ship-weapons-val');
  const shipAnchorValEl = document.getElementById('ship-anchor-val');

  // Difficulty Bars Selectors
  const toxicityBarInnerEl = document.getElementById('toxicity-bar-inner');
  const toxicityValEl = document.getElementById('toxicity-val');
  const hullBarInnerEl = document.getElementById('hull-bar-inner');
  const hullValEl = document.getElementById('hull-val');
  const repairBtn = document.getElementById('repair-btn');

  // Image assets mapping
  const itemImages = {
    wood: 'images/wood.png',
    copper_ore: 'images/copper_ore.png',
    iron_ore: 'images/iron_ore.png',
    spore_mushroom: 'images/spore_mushroom.png',
    cloud_kelp: 'images/cloud_kelp.png',
    aether_shard: 'images/aether_shard.png',
    steel_ingot: 'images/steel_ingot.png',
    aether_pickaxe: 'images/aether_pickaxe.png',
    cleanse_potion: 'images/cleanse_potion.png',
    aether_bow: 'images/aether_bow.png',
    obsidian_ore: 'images/obsidian_ore.png',
    dragon_scale: 'images/dragon_scale.png',
    obsidian_plating: 'images/obsidian_plating.png',
    aether_pearl: 'images/aether_pearl.png',
    lightning_essence: 'images/lightning_essence.png'
  };

  // --- FLOATING TEXT SYSTEM ---
  function spawnFloatingText(text, x, y, colorClass = null) {
    const div = document.createElement('div');
    div.className = 'floating-text';
    if (colorClass) {
      if (colorClass === 'aether') div.style.color = 'var(--color-aether)';
      else if (colorClass === 'gold') div.style.color = 'var(--color-gold)';
      else if (colorClass === 'danger') div.style.color = 'var(--color-danger)';
    }
    div.innerText = text;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1200);
  }

  // --- LOGGING SYSTEM ---
  function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.innerText = `[${timestamp}] ${message}`;
    logContainerEl.appendChild(entry);
    logContainerEl.scrollTop = logContainerEl.scrollHeight;
  }

  // --- INVENTORY MANAGEMENT ---
  function updateInventoryUI() {
    inventoryGridEl.innerHTML = '';
    for (let i = 0; i < state.inventoryCapacity; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      
      if (state.inventory[i]) {
        const item = state.inventory[i];
        slot.classList.add('occupied');
        
        const itemImage = item.image || itemImages[item.id] || null;
        const iconOrImage = itemImage 
          ? `<img src="${itemImage}" class="slot-img">` 
          : `<span class="slot-icon">${item.icon}</span>`;
          
        slot.innerHTML = `
          ${iconOrImage}
          <span class="slot-qty">${item.qty}</span>
          <div class="slot-name-tooltip">${item.name} (${item.type})</div>
        `;
        slot.addEventListener('click', () => handleInventoryClick(item, i));
      } else {
        slot.innerHTML = `<span class="slot-icon"></span>`;
      }
      inventoryGridEl.appendChild(slot);
    }
  }

  function addItem(itemId, name, qty, icon, type) {
    const existing = state.inventory.find(item => item.id === itemId);
    const imgPath = itemImages[itemId] || null;
    if (existing) {
      existing.qty += qty;
    } else {
      if (state.inventory.length >= state.inventoryCapacity) {
        addLog('Inventory is full!', 'danger');
        return false;
      }
      state.inventory.push({ id: itemId, name, qty, icon, type, image: imgPath });
    }
    updateInventoryUI();
    return true;
  }

  function removeItem(itemId, qty) {
    const idx = state.inventory.findIndex(item => item.id === itemId);
    if (idx !== -1) {
      state.inventory[idx].qty -= qty;
      if (state.inventory[idx].qty <= 0) {
        state.inventory.splice(idx, 1);
      }
      updateInventoryUI();
      return true;
    }
    return false;
  }

  function getQty(itemId) {
    const item = state.inventory.find(item => item.id === itemId);
    return item ? item.qty : 0;
  }

  function handleInventoryClick(item, index) {
    if (item.type === 'tool') {
      if (state.equipped.tool.id !== 'fists' && state.equipped.tool.id !== 'none') {
        addItem(state.equipped.tool.id, state.equipped.tool.name, 1, state.equipped.tool.icon, 'tool');
      }
      
      state.equipped.tool = { id: item.id, name: item.name, icon: item.icon };
      removeItem(item.id, 1);
      playSynthSound('equip');
      
      if (item.id === 'aether_pickaxe') {
        state.multipliers.gatherYield += 0.5;
        addLog(`Equipped ${item.name}! Gather yield increased by 50%!`, 'success');
      } else {
        addLog(`Equipped ${item.name}!`, 'info');
      }
      updateHUD();
      updateExpeditionsUI();
      updateRecipesUI();
    } else if (item.type === 'armor') {
      if (state.equipped.armor.id !== 'cloth_tunic') {
        addItem(state.equipped.armor.id, state.equipped.armor.name, 1, state.equipped.armor.icon, 'armor');
      }
      
      state.equipped.armor = { id: item.id, name: item.name, icon: item.icon };
      removeItem(item.id, 1);
      playSynthSound('equip');
      
      if (item.id === 'obsidian_plating') {
        addLog(`Equipped ${item.name}! Toxicity gains and Hull damage reduced by 50%.`, 'success');
      }
      updateHUD();
      updateExpeditionsUI();
      updateRecipesUI();
    } else if (item.type === 'accessory') {
      if (state.equipped.accessory.id !== 'none') {
        addItem(state.equipped.accessory.id, state.equipped.accessory.name, 1, state.equipped.accessory.icon, 'accessory');
      }
      
      state.equipped.accessory = { id: item.id, name: item.name, icon: item.icon };
      removeItem(item.id, 1);
      playSynthSound('equip');
      
      if (item.id === 'aether_bow') {
        addLog(`Equipped ${item.name}! Weapon damage stats increased.`, 'success');
      }
      updateHUD();
      updateExpeditionsUI();
      updateRecipesUI();
    } else if (item.type === 'potion') {
      removeItem(item.id, 1);
      playSynthSound('equip');
      if (item.id === 'cleanse_potion') {
        state.toxicity = Math.max(0, state.toxicity - 60);
        addLog(`Consumed ${item.name}! Aether Toxicity reduced by 60 units.`, 'success');
      }
      updateHUD();
      updateRecipesUI();
    }
  }

  // --- STATS & HUD ---
  function updateHUD() {
    goldEl.innerText = state.gold;
    aetheriumEl.innerText = state.aetherium;
    levelEl.innerText = state.level;
    skillPointsEl.innerText = state.skillPoints;
    
    const xpPercent = Math.min((state.xp / state.xpNeeded) * 100, 100);
    xpBarInnerEl.style.width = `${xpPercent}%`;
    xpTextEl.innerText = `${state.xp} / ${state.xpNeeded}`;

    equipToolEl.innerText = `${state.equipped.tool.name} ${state.equipped.tool.icon}`;
    equipArmorEl.innerText = `${state.equipped.armor.name} ${state.equipped.armor.icon}`;
    equipAccessoryEl.innerText = `${state.equipped.accessory.name} ${state.equipped.accessory.icon}`;

    // Toxicity & Hull updates
    toxicityValEl.innerText = `${state.toxicity}%`;
    toxicityBarInnerEl.style.width = `${state.toxicity}%`;
    
    hullValEl.innerText = `${state.hull}%`;
    hullBarInnerEl.style.width = `${state.hull}%`;

    // Airship Engine display based on skills
    if (state.skills.aether_smith.A8.unlocked) {
      shipEngineValEl.innerText = 'Singularity Engine 🌀';
    } else if (state.skills.bio_engineer.B7.unlocked) {
      shipEngineValEl.innerText = 'Bio-Fuel Impeller 🔋';
    } else {
      shipEngineValEl.innerText = 'Basic Impeller ⚙️';
    }

    // Weapons Mount based on Shielding or Metallurgy
    if (state.skills.aether_smith.A3.unlocked) {
      shipWeaponsValEl.innerText = 'Heavy Cannon 💣';
    } else {
      shipWeaponsValEl.innerText = 'Empty Slot ❌';
    }

    // Anchor based on Smelting unlock
    if (state.skills.aether_smith.A1.unlocked) {
      shipAnchorValEl.innerText = 'Aether Grav-Anchor 🔮';
    } else {
      shipAnchorValEl.innerText = 'Standard Claw ⚓';
    }
  }

  function gainXP(amount) {
    state.xp += amount;
    addLog(`Gained +${amount} XP`, 'info');
    if (state.xp >= state.xpNeeded) {
      state.xp -= state.xpNeeded;
      state.level += 1;
      state.skillPoints += 1;
      state.xpNeeded = Math.floor(state.xpNeeded * 1.3);
      addLog(`🎉 LEVEL UP! You reached Level ${state.level}! Gained 1 Skill Point.`, 'success');
      playSynthSound('success');
      renderSkillTrees();
    }
    updateHUD();
  }

  // --- FORMULA-BASED ECONOMY ---
  function getMarketPrice(itemKey) {
    const item = state.market[itemKey];
    if (!item) return 0;
    
    let price = item.basePrice * Math.pow(item.targetSupply / (item.supply + 1), item.alpha);
    
    if (itemKey === 'aether_shard' && state.stormActive) {
      price *= 1.75;
    }
    
    price = Math.max(item.minPrice, Math.min(item.maxPrice, price));
    return Math.round(price);
  }

  function updateMarketUI() {
    marketGridEl.innerHTML = '';
    
    Object.keys(state.market).forEach(key => {
      const item = state.market[key];
      const buyPrice = getMarketPrice(key);
      const sellPrice = Math.max(1, Math.round(buyPrice * 0.75 * state.multipliers.marketSellBonus));
      
      const card = document.createElement('div');
      card.className = 'market-item-card';
      
      const deviation = (item.targetSupply - item.supply) / item.targetSupply;
      const statusText = deviation > 0.25 ? 'Low Stock' : (deviation < -0.25 ? 'High Stock' : 'Normal');
      const statusClass = deviation > 0.25 ? 'price-up' : (deviation < -0.25 ? 'price-down' : '');
      
      const itemImage = itemImages[key] || item.image || null;
      const visual = itemImage 
        ? `<img src="${itemImage}" class="market-img">` 
        : `<span style="font-size: 1.5rem; display: flex; justify-content: center; align-items: center; width: 40px; height: 40px;">${item.icon}</span>`;
      
      card.innerHTML = `
        <div class="market-info">
          ${visual}
          <div>
            <div class="market-name">${item.name}</div>
            <div class="market-stock">Supply: ${item.supply} / <span class="${statusClass}">${statusText}</span></div>
          </div>
        </div>
        <div class="market-price">💰 ${buyPrice}g</div>
        <div style="font-size: 0.85rem; color: var(--color-text-muted);">Sell: ${sellPrice}g</div>
        <div class="market-actions">
          <button class="btn-trade" id="buy-${key}">Buy</button>
          <button class="btn-trade" id="sell-${key}">Sell</button>
        </div>
      `;
      
      marketGridEl.appendChild(card);
      
      document.getElementById(`buy-${key}`).addEventListener('click', () => buyItemFromMarket(key, buyPrice));
      document.getElementById(`sell-${key}`).addEventListener('click', () => sellItemToMarket(key, sellPrice));
    });
  }

  function buyItemFromMarket(itemKey, price) {
    playSynthSound('click');
    const item = state.market[itemKey];
    if (state.gold < price) {
      addLog(`Not enough gold to buy ${item.name}!`, 'danger');
      playSynthSound('alarm');
      return;
    }
    if (item.supply <= 0) {
      addLog(`Market has zero supply of ${item.name}!`, 'danger');
      return;
    }
    
    const added = addItem(itemKey, item.name, 1, item.icon, 'resource');
    if (added) {
      state.gold -= price;
      item.supply -= 1;
      addLog(`Bought 1x ${item.name} for ${price} gold.`, 'success');
      updateHUD();
      updateMarketUI();
      updateRecipesUI();
    }
  }

  function sellItemToMarket(itemKey, price) {
    playSynthSound('click');
    const item = state.market[itemKey];
    if (getQty(itemKey) < 1) {
      addLog(`You do not have any ${item.name} in inventory to sell!`, 'danger');
      playSynthSound('alarm');
      return;
    }
    
    removeItem(itemKey, 1);
    state.gold += price;
    item.supply += 1;
    addLog(`Sold 1x ${item.name} to Market for ${price} gold.`, 'success');
    updateHUD();
    updateMarketUI();
    updateRecipesUI();
  }

  // --- EXPEDITIONS & NAVIGATION ---
  function updateExpeditionsUI() {
    expeditionsGridEl.innerHTML = '';
    currentLocationValEl.innerText = state.locations[state.currentLocation].name;
    
    Object.keys(state.locations).forEach(locKey => {
      const loc = state.locations[locKey];
      const isCurrent = state.currentLocation === locKey;
      
      const card = document.createElement('div');
      card.className = 'market-item-card';
      
      let satisfiesPrereqs = true;
      let reasons = [];
      
      if (state.level < loc.minLvl) {
        satisfiesPrereqs = false;
        reasons.push(`Level ${loc.minLvl}`);
      }
      if (loc.toolPrereq && state.equipped.tool.id !== loc.toolPrereq) {
        satisfiesPrereqs = false;
        const reqName = state.recipes.find(r => r.id === loc.toolPrereq)?.name || loc.toolPrereq;
        reasons.push(`Requires ${reqName}`);
      }
      if (loc.accessoryPrereq && state.equipped.accessory.id !== loc.accessoryPrereq) {
        satisfiesPrereqs = false;
        const reqName = state.recipes.find(r => r.id === loc.accessoryPrereq)?.name || loc.accessoryPrereq;
        reasons.push(`Requires ${reqName}`);
      }
      
      if (locKey === 'abyss' && !state.skills.aether_smith.A8.unlocked) {
        satisfiesPrereqs = false;
        reasons.push('Singularity Engine (A8)');
      }
      if (locKey === 'nest' && !state.skills.aether_smith.A3.unlocked) {
        satisfiesPrereqs = false;
        reasons.push('Heavy Cannon (A3)');
      }

      let hasCosts = true;
      Object.keys(loc.cost).forEach(costKey => {
        const reqQty = loc.cost[costKey];
        if (getQty(costKey) < reqQty) {
          hasCosts = false;
          reasons.push(`Missing ${reqQty}x ${state.market[costKey].name}`);
        }
      });
      
      let costText = '';
      if (Object.keys(loc.cost).length > 0) {
        costText = 'Cost: ' + Object.keys(loc.cost).map(k => `${loc.cost[k]}x ${state.market[k].icon}`).join(', ');
      } else {
        costText = 'Cost: Free';
      }
      
      card.innerHTML = `
        <div class="market-info" style="grid-column: span 2;">
          <div>
            <div class="market-name" style="color: ${isCurrent ? 'var(--color-aether)' : '#fff'};">${loc.name} ${isCurrent ? '📌' : ''}</div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.2rem;">${loc.desc}</div>
            <div style="font-size: 0.75rem; color: var(--color-gold); margin-top: 0.2rem;">${costText}</div>
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--color-danger);">${reasons.length > 0 ? reasons.join(' | ') : 'Ready'}</div>
        <div class="market-actions">
          <button class="btn-trade" id="travel-${locKey}" ${isCurrent || !satisfiesPrereqs || !hasCosts ? 'disabled' : ''}>
            ${isCurrent ? 'Anchored' : 'Travel'}
          </button>
        </div>
      `;
      
      expeditionsGridEl.appendChild(card);
      
      if (!isCurrent && satisfiesPrereqs && hasCosts) {
        document.getElementById(`travel-${locKey}`).addEventListener('click', () => travelTo(locKey));
      }
    });
  }

  function travelTo(locKey) {
    playSynthSound('click');
    const loc = state.locations[locKey];
    
    Object.keys(loc.cost).forEach(costKey => {
      removeItem(costKey, loc.cost[costKey]);
    });
    
    addLog(`Funnels redirected. Flying to ${loc.name}...`, 'info');
    
    craftingOverlayEl.classList.add('active');
    craftingLabelEl.innerText = `Steering Airship to ${loc.name}...`;
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 10;
      craftingProgressBarEl.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        craftingOverlayEl.classList.remove('active');
        state.currentLocation = locKey;
        
        addLog(`Airship successfully anchored at ${loc.name}!`, 'success');
        playSynthSound('success');
        updateHUD();
        updateMarketUI();
        updateRecipesUI();
        updateExpeditionsUI();
      }
    }, 200);
  }

  // --- HULL REPAIRS ---
  const repairBtnEl = document.getElementById('repair-btn');
  repairBtnEl.addEventListener('click', () => {
    if (getQty('steel_ingot') < 5) {
      addLog('Not enough Steel Ingots to perform hull welding!', 'danger');
      playSynthSound('alarm');
      return;
    }
    
    removeItem('steel_ingot', 5);
    state.hull = Math.min(100, state.hull + 40);
    addLog('🔧 Steel plates welded onto ship chassis. Restored +40% Hull Integrity!', 'success');
    playSynthSound('craft');
    updateHUD();
    updateRecipesUI();
    updateMarketUI();
  });

  // --- RESOURCE GATHERING ---
  const gatherBtn = document.getElementById('gather-btn');
  gatherBtn.addEventListener('click', (e) => {
    playSynthSound('gather');
    if (e.clientX && e.clientY) {
      spawnSpark(e.clientX, e.clientY);
    }
    
    gatherBtn.disabled = true;
    addLog(`Exploring and harvesting at ${state.locations[state.currentLocation].name}...`, 'info');
    
    if (e.clientX && e.clientY) {
      spawnFloatingText('+XP', e.clientX, e.clientY);
    }
    
    let progress = 0;
    craftingOverlayEl.classList.add('active');
    craftingLabelEl.innerText = 'Harvesting Resources...';
    
    const interval = setInterval(() => {
      progress += 10;
      craftingProgressBarEl.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        craftingOverlayEl.classList.remove('active');
        gatherBtn.disabled = false;
        
        const hasShield = state.equipped.armor.id === 'obsidian_plating';
        const reduction = hasShield ? 0.5 : 1.0;
        
        let localTox = 0;
        let localDmg = 0;
        let localDmgChance = 0;
        
        let pool = [];
        if (state.currentLocation === 'shallows') {
          localTox = 2;
          pool = [
            { id: 'wood', name: 'Wood', icon: '🪵', qty: Math.round(3 * state.multipliers.gatherYield) },
            { id: 'copper_ore', name: 'Copper Ore', icon: '🪨', qty: Math.round(2 * state.multipliers.gatherYield) },
            { id: 'cloud_kelp', name: 'Cloud Kelp', icon: '🌿', qty: Math.round(2 * state.multipliers.gatherYield) }
          ];
          if (Math.random() > 0.75) pool.push({ id: 'iron_ore', name: 'Iron Ore', icon: '⛓️', qty: 1 });
          if (Math.random() > 0.65) pool.push({ id: 'aether_pearl', name: 'Aether Pearl', icon: '🦪', qty: 1 });
        } else if (state.currentLocation === 'peaks') {
          localTox = 5;
          localDmgChance = 0.15;
          localDmg = 6;
          pool = [
            { id: 'wood', name: 'Wood', icon: '🪵', qty: Math.round(2 * state.multipliers.gatherYield) },
            { id: 'iron_ore', name: 'Iron Ore', icon: '⛓️', qty: Math.round(3 * state.multipliers.gatherYield) },
            { id: 'spore_mushroom', name: 'Spore Mushroom', icon: '🍄', qty: Math.round(2 * state.multipliers.gatherYield) }
          ];
          if (Math.random() > 0.5) pool.push({ id: 'steel_ingot', name: 'Steel Ingot', icon: '🧱', qty: 1 });
        } else if (state.currentLocation === 'eye') {
          localTox = 12;
          localDmgChance = 0.25;
          localDmg = 12;
          pool = [
            { id: 'aether_shard', name: 'Aether Shard', icon: '💎', qty: Math.round(4 * state.multipliers.gatherYield) },
            { id: 'iron_ore', name: 'Iron Ore', icon: '⛓️', qty: Math.round(2 * state.multipliers.gatherYield) }
          ];
          if (Math.random() > 0.4) pool.push({ id: 'steel_ingot', name: 'Steel Ingot', icon: '🧱', qty: 2 });
          if (Math.random() > 0.55) pool.push({ id: 'lightning_essence', name: 'Lightning Essence', icon: '⚡', qty: 1 });
        } else if (state.currentLocation === 'abyss') {
          localTox = 20;
          localDmgChance = 0.35;
          localDmg = 18;
          pool = [
            { id: 'wood', name: 'Wood', icon: '🪵', qty: Math.round(2 * state.multipliers.gatherYield) },
            { id: 'obsidian_ore', name: 'Obsidian Ore', icon: '🌋', qty: Math.round(2 * state.multipliers.gatherYield) },
            { id: 'iron_ore', name: 'Iron Ore', icon: '⛓️', qty: Math.round(3 * state.multipliers.gatherYield) }
          ];
          if (Math.random() > 0.4) pool.push({ id: 'aether_shard', name: 'Aether Shard', icon: '💎', qty: 2 });
        } else if (state.currentLocation === 'nest') {
          localTox = 30;
          localDmgChance = 0.50;
          localDmg = 25;
          pool = [
            { id: 'obsidian_ore', name: 'Obsidian Ore', icon: '🌋', qty: Math.round(2 * state.multipliers.gatherYield) },
            { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐉', qty: 1 }
          ];
          if (Math.random() > 0.5) pool.push({ id: 'steel_ingot', name: 'Steel Ingot', icon: '🧱', qty: 2 });
        }

        if (state.stormActive) {
          localTox *= 2;
          localDmgChance *= 1.5;
          localDmg *= 1.5;
          if (Math.random() > 0.5) {
            pool.forEach(item => { item.qty *= 2; });
            addLog('🌀 Aether storm energy surged through your tools, doubling harvest yields!', 'warning');
          }
        }

        localTox = Math.round(localTox * reduction);
        localDmg = Math.round(localDmg * reduction);

        state.toxicity = Math.min(100, state.toxicity + localTox);
        addLog(`Exposure increased Toxicity by +${localTox}%.`, 'warning');

        if (Math.random() < localDmgChance) {
          state.hull = Math.max(0, state.hull - localDmg);
          addLog(`💥 Alert! Lightning strike or creature collision damaged your hull by -${localDmg}% HP!`, 'danger');
          playSynthSound('alarm');
        }

        if (state.toxicity >= 100) {
          state.toxicity = 0;
          state.currentLocation = 'shallows';
          state.gold = Math.round(state.gold * 0.5);
          addLog('⚠️ TOXICITY OVERLOAD! Suit systems collapsed under radiation. Teleported to Aether Shallows. Paid 50% Gold in system recovery.', 'danger');
          playSynthSound('alarm');
          updateHUD();
          updateExpeditionsUI();
          updateRecipesUI();
          return;
        }

        if (state.hull <= 0) {
          state.hull = 100;
          state.currentLocation = 'shallows';
          state.gold = Math.max(0, state.gold - 40);
          state.inventory = state.inventory.filter(item => item.type !== 'resource');
          addLog('💥 SHIP CRASHED! Terminal hull failure. Emergency warp to Shallows. Lost all inventory cargo and paid 40g repair fine.', 'danger');
          playSynthSound('alarm');
          updateHUD();
          updateInventoryUI();
          updateExpeditionsUI();
          updateRecipesUI();
          return;
        }

        pool.forEach((res, idx) => {
          addItem(res.id, res.name, res.qty, res.icon, 'resource');
          addLog(`Gathered ${res.qty}x ${res.name} ${res.icon}`, 'success');
          
          setTimeout(() => {
            spawnFloatingText(`+${res.qty} ${res.name} ${res.icon}`, window.innerWidth - 300, 300 + (idx * 30), 'aether');
          }, idx * 100);
        });
        
        let xpGained = 25;
        if (state.currentLocation === 'peaks') xpGained = 50;
        else if (state.currentLocation === 'eye') xpGained = 80;
        else if (state.currentLocation === 'abyss') xpGained = 150;
        else if (state.currentLocation === 'nest') xpGained = 250;
        
        gainXP(xpGained);
        updateHUD();
        updateRecipesUI();
        updateMarketUI();
        playSynthSound('success');
      }
    }, 100);
  });

  // --- CRAFTING ---
  function updateRecipesUI() {
    recipesGridEl.innerHTML = '';
    
    state.recipes.forEach(recipe => {
      let locked = false;
      let reason = '';
      
      if (recipe.id === 'steel_ingot' || recipe.id === 'aether_pickaxe') {
        if (!state.skills.aether_smith.A2.unlocked) {
          locked = true;
          reason = 'Requires Metallurgy (A2)';
        }
      } else if (recipe.id === 'cleanse_potion') {
        if (!state.skills.bio_engineer.B2.unlocked) {
          locked = true;
          reason = 'Requires Alchemy Basics (B2)';
        }
      } else if (recipe.id === 'obsidian_plating') {
        if (!state.skills.aether_smith.A2.unlocked) {
          locked = true;
          reason = 'Requires Metallurgy (A2)';
        }
      }
      
      const card = document.createElement('div');
      card.className = 'recipe-card';
      
      let reqHtml = '';
      let canCraft = true;
      
      Object.keys(recipe.inputs).forEach(inputKey => {
        const requiredQty = recipe.inputs[inputKey];
        const ownedQty = getQty(inputKey);
        const name = state.market[inputKey] ? state.market[inputKey].name : inputKey;
        const satisfied = ownedQty >= requiredQty;
        
        if (!satisfied) canCraft = false;
        
        reqHtml += `<span class="req-badge ${satisfied ? 'satisfied' : ''}">${name}: ${ownedQty}/${requiredQty}</span>`;
      });
      
      const recipeImage = itemImages[recipe.id] || recipe.image || null;
      const recipeVisual = recipeImage 
        ? `<img src="${recipeImage}" style="width: 38px; height: 38px; object-fit: contain; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2);">` 
        : `<span style="font-size: 1.5rem; display: flex; justify-content: center; align-items: center; width: 38px; height: 38px;">${recipe.icon}</span>`;
      
      if (locked) {
        card.innerHTML = `
          <div class="recipe-info" style="display: flex; gap: 0.8rem; align-items: center; opacity: 0.6;">
            ${recipeVisual}
            <div>
              <h4 style="color: var(--color-text-muted);">${recipe.name} (LOCKED)</h4>
              <div style="font-size: 0.8rem; color: var(--color-danger); margin-bottom: 0.3rem;">${reason}</div>
            </div>
          </div>
          <button class="btn-craft" disabled>Locked</button>
        `;
      } else {
        card.innerHTML = `
          <div class="recipe-info" style="display: flex; gap: 0.8rem; align-items: center;">
            ${recipeVisual}
            <div>
              <h4>${recipe.name}</h4>
              <div class="recipe-requirements" style="margin-top: 0.2rem;">${reqHtml}</div>
              ${recipe.description ? `<div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.3rem;">${recipe.description}</div>` : ''}
            </div>
          </div>
          <button class="btn-craft" id="craft-${recipe.id}" ${canCraft ? '' : 'disabled'}>Craft</button>
        `;
      }
      
      recipesGridEl.appendChild(card);
      
      if (!locked) {
        document.getElementById(`craft-${recipe.id}`).addEventListener('click', () => craftItem(recipe));
      }
    });
  }

  function craftItem(recipe) {
    playSynthSound('click');
    Object.keys(recipe.inputs).forEach(inputKey => {
      removeItem(inputKey, recipe.inputs[inputKey]);
    });
    
    addLog(`Starting crafting of ${recipe.name} ${recipe.icon}...`, 'info');
    
    let progress = 0;
    craftingOverlayEl.classList.add('active');
    craftingLabelEl.innerText = `Forging ${recipe.name} ${recipe.icon}...`;
    
    const actualDuration = recipe.duration * (1 - state.multipliers.craftSpeed + 1 === 1 ? 1 : 1 - state.multipliers.craftSpeed);
    const intervalTime = actualDuration / 20;
    
    const interval = setInterval(() => {
      progress += 5;
      craftingProgressBarEl.style.width = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(interval);
        craftingOverlayEl.classList.remove('active');
        
        addItem(recipe.id, recipe.name, 1, recipe.icon, recipe.type);
        
        addLog(`Successfully crafted: ${recipe.name} ${recipe.icon}!`, 'success');
        playSynthSound('success');
        gainXP(40);
        updateRecipesUI();
        updateMarketUI();
        updateExpeditionsUI();
      }
    }, intervalTime);
  }

  // --- SKILL TREES ---
  function renderSkillTrees() {
    renderTree('aether_smith', smithTreeEl);
    renderTree('bio_engineer', bioTreeEl);
  }

  function renderTree(profKey, containerEl) {
    containerEl.innerHTML = '';
    const tree = state.skills[profKey];
    
    Object.keys(tree).forEach(nodeId => {
      const node = tree[nodeId];
      
      let statusClass = 'locked';
      let isUnlockable = false;
      
      if (node.unlocked) {
        statusClass = 'unlocked';
        if (nodeId === 'A8' || nodeId === 'B7') {
          statusClass = 'master';
        }
      } else {
        const hasPoints = state.skillPoints >= node.cost;
        const prereqSatisfied = !node.prereq || tree[node.prereq].unlocked;
        if (hasPoints && prereqSatisfied) {
          statusClass = 'unlockable';
          isUnlockable = true;
        }
      }
      
      const nodeCard = document.createElement('div');
      nodeCard.className = `skill-node ${statusClass}`;
      nodeCard.innerHTML = `
        <div class="node-tier">${node.tier} ${node.unlocked ? '✅' : ''}</div>
        <div class="node-title">${node.title}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.4rem;">${node.desc}</div>
        <div class="node-bonus">Cost: ${node.cost} SP</div>
      `;
      
      if (isUnlockable) {
        nodeCard.addEventListener('click', () => unlockSkill(profKey, nodeId));
      }
      
      containerEl.appendChild(nodeCard);
    });
  }

  function unlockSkill(profKey, nodeId) {
    const node = state.skills[profKey][nodeId];
    if (state.skillPoints >= node.cost) {
      state.skillPoints -= node.cost;
      node.unlocked = true;
      playSynthSound('equip');
      
      if (node.bonusType && node.bonusVal) {
        state.multipliers[node.bonusType] += node.bonusVal;
      }
      
      addLog(`Unlocked skill: ${node.title}!`, 'success');
      updateHUD();
      renderSkillTrees();
      updateRecipesUI();
      updateExpeditionsUI();
    }
  }

  // --- TABS SYSTEM ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('click');
      const target = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
      
      addLog(`Navigated to: ${btn.innerText}`, 'info');
    });
  });

  // --- AUDIO TOGGLE ---
  const muteBtn = document.getElementById('mute-btn');
  const muteIcon = document.getElementById('mute-icon');
  const muteText = document.getElementById('mute-text');
  
  muteBtn.addEventListener('click', () => {
    soundMuted = !soundMuted;
    if (soundMuted) {
      muteIcon.innerText = '🔇';
      muteText.innerText = 'Sound: OFF';
      addLog('Audio elements muted.', 'info');
    } else {
      muteIcon.innerText = '🔊';
      muteText.innerText = 'Sound: ON';
      addLog('Audio elements unmuted.', 'info');
      playSynthSound('click');
    }
  });

  // --- AETHER STORM TIMER ---
  setInterval(() => {
    if (Math.random() < 0.45) {
      state.stormActive = !state.stormActive;
      
      if (state.stormActive) {
        stormIndicatorEl.style.display = 'block';
        addLog('🌀 AETHER TEMPSET ACTIVE! Price of Aether Shards has rocketed. Resource harvest yields are volatile!', 'warning');
        playSynthSound('alarm');
      } else {
        stormIndicatorEl.style.display = 'none';
        addLog('🌀 The Aether Storm has dissipated. Clear navigation lanes ahead.', 'success');
      }
      
      updateMarketUI();
      updateRecipesUI();
      updateExpeditionsUI();
    }
  }, 20000);

  // --- INITIALIZATION ---
  addLog('Project Aetheria client initialized.', 'info');
  addLog('Welcome, Prospector! Anchor your ship, specialize in trades, and explore the frontier.', 'warning');
  
  updateInventoryUI();
  updateHUD();
  updateMarketUI();
  updateRecipesUI();
  updateExpeditionsUI();
  renderSkillTrees();
});
