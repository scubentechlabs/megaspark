interface WhatsAppShareOptions {
  hallTicketUrl: string;
  registrationNumber?: string | null;
  studentName: string;
}

export async function downloadFileFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
    return;
  } catch {
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.download = filename;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
  }
}

export function openWhatsAppShare({ hallTicketUrl, registrationNumber, studentName }: WhatsAppShareOptions) {
  const shareMessage = [
    `Hall ticket for ${studentName}`,
    registrationNumber ? `Registration No: ${registrationNumber}` : null,
    hallTicketUrl,
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  if (!popup) {
    window.location.href = whatsappUrl;
  }
}