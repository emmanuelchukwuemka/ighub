const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_test_xxxxxxxx";

export async function initializePaystackPayment(email: string, amount: number, reference: string) {
  const url = "https://api.paystack.co/transaction/initialize";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      channels: ["card", "bank"],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Paystack initialization failed: ${errorBody}`);
  }

  const data = await response.json();
  return data;
}
