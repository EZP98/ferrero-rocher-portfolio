/**
 * Animation Discovery Script
 *
 * Injected into iframe to discover animatable elements.
 * Works with: DOM elements, GSAP, Three.js, Framer Motion, CSS animations
 */

export interface DiscoveredElement {
  id: string
  name: string
  type: 'dom' | 'gsap' | 'three' | 'css' | 'framer'
  selector?: string
  properties: string[]
  currentValues: Record<string, number | string>
}

export interface DiscoveryResult {
  elements: DiscoveredElement[]
  libraries: string[]
  animations: Array<{
    name: string
    target: string
    properties: string[]
  }>
}

// Script to inject into iframe
export const DISCOVERY_SCRIPT = `
(function() {
  const result = {
    elements: [],
    libraries: [],
    animations: []
  };

  // Detect libraries
  if (window.gsap) result.libraries.push('gsap');
  if (window.THREE) result.libraries.push('three');
  if (window.__FRAMER_MOTION__) result.libraries.push('framer-motion');
  if (window.anime) result.libraries.push('anime.js');

  // Find elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach((el, i) => {
    const id = el.id || 'element-' + i;
    result.elements.push({
      id: id,
      name: el.getAttribute('data-animate') || id,
      type: 'dom',
      selector: el.id ? '#' + el.id : '[data-animate="' + el.getAttribute('data-animate') + '"]',
      properties: ['opacity', 'transform', 'scale', 'rotate', 'x', 'y'],
      currentValues: {
        opacity: parseFloat(getComputedStyle(el).opacity),
        transform: getComputedStyle(el).transform
      }
    });
  });

  // Find elements with CSS animations
  document.querySelectorAll('*').forEach((el, i) => {
    const style = getComputedStyle(el);
    if (style.animationName && style.animationName !== 'none') {
      const id = el.id || 'css-anim-' + i;
      result.animations.push({
        name: style.animationName,
        target: el.id ? '#' + el.id : el.tagName.toLowerCase(),
        properties: ['animationPlayState', 'animationDelay', 'animationDuration']
      });
    }
  });

  // Find GSAP timelines and tweens
  if (window.gsap) {
    const tweens = gsap.globalTimeline.getChildren();
    tweens.forEach((tween, i) => {
      if (tween.targets && tween.targets().length > 0) {
        const target = tween.targets()[0];
        const id = target.id || 'gsap-' + i;
        result.elements.push({
          id: id,
          name: 'GSAP: ' + (target.id || target.tagName || 'element'),
          type: 'gsap',
          selector: target.id ? '#' + target.id : null,
          properties: Object.keys(tween.vars || {}),
          currentValues: {}
        });
      }
    });
  }

  // Find Three.js scenes
  if (window.THREE) {
    // Look for canvas elements that might be Three.js
    document.querySelectorAll('canvas').forEach((canvas, i) => {
      result.elements.push({
        id: 'canvas-' + i,
        name: 'Three.js Canvas',
        type: 'three',
        selector: canvas.id ? '#' + canvas.id : 'canvas:nth-of-type(' + (i+1) + ')',
        properties: ['camera.position', 'camera.rotation', 'scene.children'],
        currentValues: {}
      });
    });
  }

  // Find common animatable elements
  const animatableSelectors = [
    'header', 'nav', 'main', 'section', 'footer',
    '.hero', '.card', '.modal', '.menu',
    '[class*="animate"]', '[class*="motion"]', '[class*="transition"]'
  ];

  animatableSelectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach((el, i) => {
        const existing = result.elements.find(e => e.selector === selector);
        if (!existing && el.id) {
          result.elements.push({
            id: el.id,
            name: el.id || selector,
            type: 'dom',
            selector: '#' + el.id,
            properties: ['opacity', 'transform', 'visibility'],
            currentValues: {
              opacity: parseFloat(getComputedStyle(el).opacity)
            }
          });
        }
      });
    } catch(e) {}
  });

  // Send result to parent
  window.parent.postMessage({ type: 'DISCOVERY_RESULT', data: result }, '*');
})();
`;

// Function to apply changes to iframe
export function createApplyScript(elementId: string, property: string, value: number | string): string {
  return `
(function() {
  // Try to find element
  let el = document.getElementById('${elementId}');
  if (!el) el = document.querySelector('[data-animate="${elementId}"]');

  if (el) {
    // Apply CSS property
    if ('${property}' === 'opacity') el.style.opacity = '${value}';
    if ('${property}' === 'scale') el.style.transform = 'scale(${value})';
    if ('${property}' === 'rotate') el.style.transform = 'rotate(${value}deg)';
    if ('${property}' === 'x') el.style.transform = 'translateX(${value}px)';
    if ('${property}' === 'y') el.style.transform = 'translateY(${value}px)';
  }

  // Try GSAP
  if (window.gsap && el) {
    gsap.to(el, { ${property}: ${value}, duration: 0.3 });
  }

  // Confirm
  window.parent.postMessage({ type: 'APPLY_CONFIRMED', elementId: '${elementId}', property: '${property}', value: ${value} }, '*');
})();
`;
}
