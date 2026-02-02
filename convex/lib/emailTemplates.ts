/**
 * Email Template System for Media4U
 * Consistent design system matching site aesthetic
 * Compatible with all major email clients
 */

// Brand colors matching site design
const COLORS = {
  background: "#03030a",
  cardBg: "#0a0a12",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  white: "#ffffff",
  cyan: "#00d4ff",
  purple: "#8b5cf6",
  pink: "#ff2d92",
  border: "rgba(255, 255, 255, 0.1)",
  gradientStart: "#00d4ff",
  gradientMiddle: "#8b5cf6",
  gradientEnd: "#ff2d92",
} as const;

// Base template wrapper
export function emailBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Media4U</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${COLORS.cardBg}; border-radius: 16px; border: 1px solid ${COLORS.border};">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              ${emailHeader()}
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid ${COLORS.border};">
              ${emailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Header with Media4U branding
function emailHeader(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, ${COLORS.cyan} 0%, ${COLORS.purple} 50%, ${COLORS.pink} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Helvetica Neue', Arial, sans-serif;">
            Media4U
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">
            VR Environments & Digital Solutions
          </p>
        </td>
      </tr>
    </table>
  `;
}

// Footer with social links and contact info
function emailFooter(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <!-- Social Links -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 0 8px;">
                <a href="https://www.instagram.com/media4uvr/" style="color: ${COLORS.cyan}; text-decoration: none; font-size: 14px;">Instagram</a>
              </td>
              <td style="padding: 0 8px; color: ${COLORS.border};">|</td>
              <td style="padding: 0 8px;">
                <a href="https://www.youtube.com/channel/UCg-C-WFQDr0OdGVI8YX4V5w" style="color: ${COLORS.cyan}; text-decoration: none; font-size: 14px;">YouTube</a>
              </td>
              <td style="padding: 0 8px; color: ${COLORS.border};">|</td>
              <td style="padding: 0 8px;">
                <a href="https://www.tiktok.com/@media4uvr" style="color: ${COLORS.cyan}; text-decoration: none; font-size: 14px;">TikTok</a>
              </td>
            </tr>
          </table>

          <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
            <a href="mailto:devland@media4u.fun" style="color: ${COLORS.cyan}; text-decoration: none;">devland@media4u.fun</a>
          </p>

          <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.text};">
            <a href="https://media4u.fun" style="color: ${COLORS.cyan}; text-decoration: none;">media4u.fun</a>
          </p>

          <p style="margin: 16px 0 0 0; font-size: 12px; color: ${COLORS.textMuted};">
            © ${new Date().getFullYear()} Media4U. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  `;
}

// Reusable Components

export function emailHeading(text: string, size: "large" | "medium" | "small" = "large"): string {
  const sizes = {
    large: "28px",
    medium: "22px",
    small: "18px",
  };

  return `
    <h2 style="margin: 0 0 20px 0; font-size: ${sizes[size]}; font-weight: 700; color: ${COLORS.white}; font-family: 'Helvetica Neue', Arial, sans-serif;">
      ${text}
    </h2>
  `;
}

export function emailParagraph(text: string): string {
  return `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.text};">
      ${text}
    </p>
  `;
}

export function emailInfoBox(label: string, value: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
      <tr>
        <td style="padding: 12px 16px; background-color: rgba(0, 212, 255, 0.05); border-left: 3px solid ${COLORS.cyan}; border-radius: 4px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: ${COLORS.cyan}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${label}
          </p>
          <p style="margin: 0; font-size: 16px; color: ${COLORS.text}; word-break: break-word;">
            ${value}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function emailDivider(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td style="border-top: 1px solid ${COLORS.border};"></td>
      </tr>
    </table>
  `;
}

export function emailButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, ${COLORS.cyan} 0%, ${COLORS.purple} 100%);">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: ${COLORS.white}; text-decoration: none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function emailList(items: string[]): string {
  const listItems = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right: 12px; vertical-align: top;">
              <span style="display: inline-block; width: 6px; height: 6px; background: linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple}); border-radius: 50%; margin-top: 8px;"></span>
            </td>
            <td style="font-size: 16px; line-height: 1.6; color: ${COLORS.text};">
              ${item}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
      ${listItems}
    </table>
  `;
}

export function emailSuccessIcon(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.purple}); display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13l4 4L19 7" stroke="${COLORS.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </td>
      </tr>
    </table>
  `;
}
