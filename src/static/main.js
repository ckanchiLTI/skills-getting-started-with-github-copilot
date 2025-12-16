document.addEventListener('DOMContentLoaded', () => {
  const MAX_VISIBLE = 4;
  document.querySelectorAll('.participants-list').forEach((list) => {
    const items = Array.from(list.querySelectorAll('li'));
    if (items.length > MAX_VISIBLE) {
      list.classList.add('collapsed');
      items.forEach((li, idx) => {
        if (idx >= MAX_VISIBLE) li.classList.add('hidden');
      });

      const moreBtn = document.createElement('button');
      moreBtn.className = 'participants-toggle';
      moreBtn.type = 'button';
      moreBtn.textContent = `+${items.length - MAX_VISIBLE} more`;
      moreBtn.addEventListener('click', () => {
        const isCollapsed = list.classList.toggle('collapsed');
        items.forEach((li, idx) => {
          if (idx >= MAX_VISIBLE) li.classList.toggle('hidden', isCollapsed);
        });
        moreBtn.textContent = isCollapsed ? `+${items.length - MAX_VISIBLE} more` : 'Show fewer';
      });

      list.parentNode.appendChild(moreBtn);
    }
  });
});
