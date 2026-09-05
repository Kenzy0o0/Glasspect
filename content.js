let isInspectorActive = false;
let isFrozen = false;
let hoveredElement = null;


const card = document.createElement('div');
card.id = 'glass-inspector-card';

card.innerHTML = `
  <header id="glass-tag-name">ELEMENT</header>
  <div class="glass-row"><span class="glass-label">Dimensions:</span><span class="glass-value copyable" id="glass-dim">-</span></div>
  <div class="glass-row"><span class="glass-label">Color:</span><span class="glass-value copyable" id="glass-color">-</span></div>
  <div class="glass-row"><span class="glass-label">Background:</span><span class="glass-value copyable" id="glass-bg">-</span></div>
  <div class="glass-row"><span class="glass-label">Font:</span><span class="glass-value copyable" id="glass-font">-</span></div>
  <div class="glass-row"><span class="glass-label">Padding:</span><span class="glass-value copyable" id="glass-padding">-</span></div>
  <div class="glass-row"><span class="glass-label">Margin:</span><span class="glass-value copyable" id="glass-margin">-</span></div>
`;

document.body.appendChild(card);

// Helper function to convert RGB to HEX
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'Transparent';
  const values = rgb.match(/\d+/g);
  if (!values || values.length < 3) return rgb;
  return '#' + values.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
}


document.addEventListener('keydown', (e) => {
  if (!isInspectorActive) return;

  if (e.code === 'Space') {
    e.preventDefault(); // Prevent page scrolling on Space
    isFrozen = !isFrozen;
    card.classList.toggle('frozen', isFrozen);
  }
});

function handleMouseMove(e) {
  if (!isInspectorActive || isFrozen) return;

  const target = e.target;
  if (target === card || card.contains(target)) return;

  if (hoveredElement && hoveredElement !== target) {
    hoveredElement.classList.remove('glass-inspector-highlight');
  }
  hoveredElement = target;
  hoveredElement.classList.add('glass-inspector-highlight');

  const computedStyle = window.getComputedStyle(target);
  const rect = target.getBoundingClientRect();


  let elementLabel = `<${target.tagName.toLowerCase()}>`;
  if (target.id) {
    elementLabel += `#${target.id}`;
  } else if (target.className && typeof target.className === 'string') {
    const firstClass = target.className.split(' ')[0];
    if (firstClass) elementLabel += `.${firstClass}`;
  }

  document.getElementById('glass-tag-name').textContent = elementLabel;
  document.getElementById('glass-dim').textContent = `${Math.round(rect.width)} x ${Math.round(rect.height)}px`;
  

  if (target.tagName.toLowerCase() === 'img') {
    document.getElementById('glass-bg').textContent = 'Image Asset';
  } else {
    document.getElementById('glass-bg').textContent = rgbToHex(computedStyle.backgroundColor);
  }

  document.getElementById('glass-color').textContent = rgbToHex(computedStyle.color);
  document.getElementById('glass-font').textContent = `${computedStyle.fontSize} ${computedStyle.fontFamily.split(',')[0]}`;
  document.getElementById('glass-padding').textContent = `${computedStyle.paddingTop} ${computedStyle.paddingRight} ${computedStyle.paddingBottom} ${computedStyle.paddingLeft}`;
  document.getElementById('glass-margin').textContent = `${computedStyle.marginTop} ${computedStyle.marginRight} ${computedStyle.marginBottom} ${computedStyle.marginLeft}`;

  let left = e.clientX + 15;
  let top = e.clientY + 15;

  if (left + 280 > window.innerWidth) left = e.clientX - 280;
  if (top + 200 > window.innerHeight) top = e.clientY - 200;

  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
  card.style.display = 'block';
}

card.addEventListener('click', (e) => {
  if (e.target.classList.contains('glass-value')) {
    const textToCopy = e.target.textContent;
    if (textToCopy === '-' || textToCopy === 'Copied!') return;

    navigator.clipboard.writeText(textToCopy);

    const originalText = e.target.textContent;
    e.target.textContent = 'Copied!';
    setTimeout(() => {
      e.target.textContent = originalText;
    }, 1000);
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'toggle_inspector') {
    isInspectorActive = request.state;

    if (isInspectorActive) {
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      isFrozen = false;
      card.classList.remove('frozen');
      card.style.display = 'none';
      if (hoveredElement) {
        hoveredElement.classList.remove('glass-inspector-highlight');
      }
    }
  }
});