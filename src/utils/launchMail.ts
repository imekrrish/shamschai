export function openLaunchEmail(email: string) {
  const subject = encodeURIComponent("Join the Sham's Chai launch list");
  const body = encodeURIComponent(
    `Hello Sham's,\n\nPlease add ${email} to the Masala Chai launch list.\n\nThank you!`,
  );

  window.location.href = `mailto:support@shamschai.com?subject=${subject}&body=${body}`;
}
