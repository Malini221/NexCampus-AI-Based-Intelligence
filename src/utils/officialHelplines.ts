const officialHelplines: Record<string, string> = {
  '5550199111': '100',
  '5550199222': '108',
  '5550199333': '181',
  '5550199444': '112',
  '914427417000': '112',
  '0199': '112',
};

function normalizePhoneText(value: string): string {
  let result = value;
  Object.entries(officialHelplines).forEach(([placeholder, official]) => {
    result = result.replace(new RegExp(`\\(555\\)\\s*019-${placeholder.slice(6)}|${placeholder}`, 'g'), official);
  });
  result = result.replace(/\\+91\\s*44\\s*2741[- ]?7000/g, '112');
  result = result.replace(/SOS\\s*#?0199/g, 'SOS 112');
  return result;
}

function normalizeNode(root: ParentNode = document): void {
  root.querySelectorAll('a[href^="tel:"]').forEach((anchor) => {
    const element = anchor as HTMLAnchorElement;
    const raw = element.getAttribute('href') || '';
    const digits = raw.replace(/\\D/g, '');
    const official = officialHelplines[digits] || (digits === '914427417000' ? '112' : null);
    if (official) {
      element.href = `tel:${official}`;
      element.querySelectorAll('.font-mono-code').forEach((node) => {
        node.textContent = official;
      });
    }
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current: Node | null = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    const next = normalizePhoneText(node.nodeValue || '');
    if (next !== node.nodeValue) node.nodeValue = next;
  });
}

export function installOfficialHelplineNormalization(): () => void {
  normalizeNode();
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) normalizeNode(node as Element);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
