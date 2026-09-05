let isActive = false;
const toggleButton = document.getElementById('toggleButton');

toggleButton.addEventListener('click', async () => {
  isActive = !isActive;
  toggleButton.textContent = isActive ? 'Deactivate' : 'Activate';
  toggleButton.classList.toggle('active', isActive);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle_inspector', state: isActive })
      .catch((err) => console.log('Please refresh the page first.', err));
  }
});