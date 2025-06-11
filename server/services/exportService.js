import { jsPDF } from 'jspdf';

// Function to generate a Markdown string from guide data
export function exportToMarkdown(guide) {
  let markdown = `# ${guide.title}\n\n`;
  markdown += `**Content Type:** ${guide.contentType}\n`;
  markdown += `**Progress:** ${Math.round(guide.progress || 0)}% Complete\n\n`;

  guide.chapters.forEach(chapter => {
    markdown += `## ${chapter.title}\n\n`;
    chapter.steps.forEach(step => {
      const checkbox = step.isCompleted ? '- [x]' : '- [ ]';
      markdown += `${checkbox} ${step.content}\n`;

      if (step.notes && step.notes.length > 0) {
        step.notes.forEach(note => {
          markdown += `  - *Note:* ${note.content}\n`;
        });
      }
      if (step.attachments && step.attachments.length > 0) {
        step.attachments.forEach(att => {
          markdown += `  - *Attachment:* [View Image](${att.fileUrl})\n`;
        });
      }
      markdown += '\n';
    });
  });

  return markdown;
}

// Function to generate a PDF document from guide data
export function exportToPdf(guide) {
  const doc = new jsPDF();
  let y = 20; // Y-coordinate for placing text

  // Helper function to add text and manage page breaks
  const addText = (text, options = {}, margin = 20) => {
    const lines = doc.splitTextToSize(text, 170); // 170mm width
    if (y + (lines.length * 5) > 280) { // Check if it will overflow page
      doc.addPage();
      y = 20;
    }
    doc.text(lines, margin, y, options);
    y += (lines.length * 5);
  };
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  addText(guide.title);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  addText(`Progress: ${Math.round(guide.progress || 0)}% Complete`);
  y += 10;
  
  guide.chapters.forEach(chapter => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    addText(`- ${chapter.title} -`);
    y += 5;
    
    chapter.steps.forEach(step => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      const checkbox = step.isCompleted ? '[X]' : '[ ]';
      addText(`${checkbox} ${step.content}`, {}, 25);

      if (step.notes && step.notes.length > 0) {
        doc.setFontSize(10);
        step.notes.forEach(note => {
          addText(`Note: ${note.content}`, { textColor: 'gray' }, 30);
        });
      }
      if (step.attachments && step.attachments.length > 0) {
        doc.setFontSize(10);
        step.attachments.forEach(att => {
          addText(`Attachment: ${att.fileUrl}`, { textColor: 'blue' }, 30);
        });
      }
      y += 4;
    });
    y += 6;
  });

  // Return the PDF document as a buffer
  return doc.output('arraybuffer');
} 