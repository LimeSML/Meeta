import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export async function initAzureKeyVault() {
  // ブラウザ環境なら何もしない（念のため）
  if (typeof window !== 'undefined') {
    return;
  }
  if (process.env.GEMINI_API_KEY) {
    return;
  }

  const vaultName = process.env.AZURE_KEY_VAULT_NAME;
  const url = `https://${vaultName}.vault.azure.net`;

  try {
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(url, credential);
    const secret = await client.getSecret("GEMINI-API-KEY");
    process.env.GEMINI_API_KEY = secret.value;
    console.log("✅ GEMINI_API_KEY loaded from Key Vault");
  } catch (err) {
    console.warn("⚠️ Key Vault bypass:", (err as Error).message);
  }
}