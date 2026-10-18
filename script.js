const form = document.querySelector('#calorie-form');
const heightInput = document.querySelector('#height');
const weightInput = document.querySelector('#weight');
let currentUnit = 'metric';

function calculateCalories({ age, gender, heightCm, weightKg, activity }) {
  const resting = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  const maintenance = resting * activity;
  return { maintain: Math.round(maintenance), lose: Math.round(maintenance * 0.85), gain: Math.round(maintenance * 1.1) };
}

function updateResults(animate = true) {
  const values = new FormData(form);
  const results = calculateCalories({
    age: Number(values.get('age')),
    gender: values.get('gender'),
    heightCm: Number(values.get('height')) * (currentUnit === 'imperial' ? 2.54 : 1),
    weightKg: Number(values.get('weight')) * (currentUnit === 'imperial' ? 0.45359237 : 1),
    activity: Number(values.get('activity')),
  });
  for (const [key, value] of Object.entries(results)) {
    document.getElementById(key).textContent = value.toLocaleString('en-US');
  }
  const activity = document.querySelector('#activity').selectedOptions[0].textContent.split(' · ')[0].toLowerCase();
  document.querySelector('#result-context').textContent = `Based on your details and a ${activity} lifestyle.`;
  if (animate) {
    const panel = document.querySelector('#results');
    panel.classList.remove('refreshed');
    void panel.offsetWidth;
    panel.classList.add('refreshed');
    if (window.matchMedia('(max-width: 680px)').matches) panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (form.reportValidity()) updateResults();
});

document.querySelectorAll('[data-unit]').forEach(button => {
  button.addEventListener('click', () => {
    const nextUnit = button.dataset.unit;
    if (nextUnit === currentUnit) return;
    const toImperial = nextUnit === 'imperial';
    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);
    // Convert existing entries so switching units preserves the person's measurements.
    heightInput.min = toImperial ? '39.4' : '100';
    heightInput.max = toImperial ? '98.4' : '250';
    weightInput.min = toImperial ? '66.2' : '30';
    weightInput.max = toImperial ? '771.6' : '350';
    heightInput.value = heightInput.value === '' ? '' : (toImperial ? height / 2.54 : height * 2.54).toFixed(1);
    weightInput.value = weightInput.value === '' ? '' : (toImperial ? weight / 0.45359237 : weight * 0.45359237).toFixed(1);
    document.querySelector('#height-unit').textContent = toImperial ? 'in' : 'cm';
    document.querySelector('#weight-unit').textContent = toImperial ? 'lb' : 'kg';
    currentUnit = nextUnit;
    document.querySelectorAll('[data-unit]').forEach(toggle => {
      const selected = toggle === button;
      toggle.classList.toggle('active', selected);
      toggle.setAttribute('aria-pressed', String(selected));
    });
  });
});

updateResults(false);
