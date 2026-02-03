interface PaystackConfig {
  email: string;
  amount: number; 
  currency: string;
  reference: string;
  callback_url?: string;
  metadata?: any;
}

export const initializePayment = (config: PaystackConfig): Promise<any> => {
  return new Promise((resolve, reject) => {
    const handler = (window as any).PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: config.amount,
      currency: config.currency,
      ref: config.reference,
      metadata: config.metadata,
      onClose: function () {
        reject(new Error("Payment cancelled"));
      },
      callback: function (response: any) {
        resolve(response);
      },
    });

    handler.openIframe();
  });
};

export const verifyPayment = async (reference: string): Promise<any> => {
  // In production, you should verify this on your backend
  // For now, we'll simulate verification
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: true,
        message: "Verification successful",
        data: {
          reference,
          amount: 100000,
          status: "success",
        },
      });
    }, 1000);
  });
};
