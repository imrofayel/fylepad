export const md2pdf = (htmlContent: string, title: string = 'Untitled') => {
    if (htmlContent) {
      const fullHtmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title || 'Untitled'}</title>
          <style>
            body {
              font-family: Inter, sans-serif;
              line-height: 1;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 10px;
              font-size: 18px;
            }
            h1 {
              font-size: 2rem;
              margin: 1rem 0;
            }
            h2 {
              font-size: 1.75rem;
              margin: 0.75rem 0;
            }
            h3 {
              font-size: 1.5rem;
              margin: 0.5rem 0;
            }
            h4 {
              font-size: 1.25rem;
              margin: 0.25rem 0;
            }
            ul,
            ol {
              margin-left: 1.5rem;
              padding-left: 1rem;
            }
            ul {
              list-style-type: disc;
            }
            ol {
              list-style-type: decimal;
            }
            li {
              margin: 0.5rem 0;
            }
            .task-list-item {
              display: flex;
              align-items: center;
            }
            .task-list-item input {
              margin-right: 0.5rem;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1rem;
              margin: 1rem 0;
              font-style: italic;
            }
            mark {
              background-color: #FAF594;
              border-radius: 0.4rem;
              padding: 0.1rem 0.3rem;
            }
            code {
              font-family: 'Roboto Mono', monospace;
              font-size: 18px;
              background-color: #F9FAFB;
              border-radius: 0.4rem;
              padding: 0.1rem 0.3rem;
            }
            pre {
              background-color: #f4f4f4;
              border: 1px solid #ddd;
              border-left: 3px solid #f36d33;
              color: #666;
              page-break-inside: avoid;
              font-family: monospace;
              font-size: 15px;
              line-height: 1.6;
              margin-bottom: 1.6em;
              max-width: 100%;
              overflow: auto;
              padding: 1em 1.5em;
              display: block;
              word-wrap: break-word;
            }
            .color::before {
              background-color: var(--color);
              border-radius: 8px;
              content: " ";
              display: inline-block;
              height: 1em;
              margin-bottom: 0.15em;
              margin-right: 0.3em;
              vertical-align: middle;
              width: 1em;
            }
            ul[data-type="taskList"] {
              list-style: none;
              margin-left: 14px;
              padding: 0;
            }
            ul[data-type="taskList"] li {
              align-items: center;
              display: flex;
              margin-bottom: 0.5rem;
            }
            ul[data-type="taskList"] li > label {
              display: flex;
              align-items: center;
              user-select: none;
            }
            ul[data-type="taskList"] label > input[type="checkbox"] {
              cursor: pointer;
              appearance: none;
              width: 20px;
              height: 20px;
              border: 2px solid #eaeaea;
              border-radius: 8px;
              margin-right: 0.5rem;
              position: relative;
            }
            ul[data-type="taskList"] label > input[type="checkbox"]:checked {
              background-color: #00bcf0;
              border-color: #00bcf0;
            }

            ul[data-type="taskList"] label > input[type="checkbox"]:checked::after {
              content: '✔'; /* Checkmark symbol */
              color: #00bcf0;
              font-size: 14px;
              display: block;
              text-align: center;
              line-height: 18px;
            }
            ul[data-type="taskList"] label > div {
              flex: 1 1 auto;
            }

            @media print {
            mark {
              background-color: #FAF594 !important; /* Ensure highlight color is shown when printing */
              color: inherit;
            }
          }
          </style>
        </head>
        <body>
          <h1 style="padding-bottom: 1rem; font-weight: normal;">${title || 'Untitled'}</h1>
          ${htmlContent}
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(fullHtmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load before printing
        printWindow.onload = function() {
          printWindow.print();
          printWindow.close();
        };
      } else {
        console.error('Failed to open print window.');
      }
    } else {
      console.error('Editor instance is not available.');
    }
  };