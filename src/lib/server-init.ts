import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export async function initAzureKeyVault() {
  // ブラウザ環境なら何もしない（念のため）
  if (typeof window !== 'undefined') {
    return;
  }

  // 両方の環境変数が既にある場合はスキップ
  if (process.env.GEMINI_API_KEY && process.env.DATABASE_URL) {
    return;
  }

  const vaultName = process.env.AZURE_KEY_VAULT_NAME;
  if (!vaultName) {
    console.warn("⚠️ AZURE_KEY_VAULT_NAME is not set.");
    return;
  }

  const url = `https://${vaultName}.vault.azure.net`;

  try {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);

    // 両方のシークレットを並列で取得
    const [geminiSecret, dbSecret] = await Promise.all([
      !process.env.GEMINI_API_KEY ? client.getSecret("GEMINI-API-KEY") : Promise.resolve({ value: process.env.GEMINI_API_KEY }),
      !process.env.DATABASE_URL ? client.getSecret("DATABASE-URL") : Promise.resolve({ value: process.env.DATABASE_URL }),
    ]);

    if (geminiSecret.value) {
      process.env.GEMINI_API_KEY = geminiSecret.value;
    }
    if (dbSecret.value) {
      process.env.DATABASE_URL = dbSecret.value;
    }

    console.log("✅ Secrets loaded from Key Vault (GEMINI_API_KEY, DATABASE_URL)");
  } catch (err) {
    console.warn("⚠️ Key Vault bypass:", (err as Error).message);
  }
}