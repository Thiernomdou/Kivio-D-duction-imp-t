/**
 * Configuration des comptes administrateurs/testeurs
 * Ces comptes peuvent bypasser le paiement Stripe pour tester le flow complet
 *
 * IMPORTANT: Cette liste doit être vidée ou désactivée avant la mise en production publique
 */

// Emails autorisés à bypasser le paiement
export const ADMIN_TEST_EMAILS = [
  "thiernd28@gmail.com",
  "oury@gmail.com",
  // Ajouter d'autres emails de testeurs/admins ici
];

/**
 * Vérifie si un email est un compte admin/testeur
 */
export function isAdminTestEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_TEST_EMAILS.includes(email.toLowerCase());
}

/**
 * Vérifie si on est en mode développement
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Vérifie si le bypass est autorisé pour cet utilisateur
 * Conditions: email admin OU mode dev avec paramètre bypass
 */
export function canBypassPayment(
  email: string | null | undefined,
  bypassParam?: boolean
): boolean {
  // Les emails admin peuvent toujours bypasser
  if (isAdminTestEmail(email)) {
    return true;
  }

  // En dev, le paramètre bypass est autorisé
  if (isDevelopment() && bypassParam) {
    return true;
  }

  return false;
}
