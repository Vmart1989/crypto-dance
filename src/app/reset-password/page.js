import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";

export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return <PasswordRecoveryForm reset />;
}
