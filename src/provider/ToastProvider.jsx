import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        style: {
          borderRadius: "10px",
          fontSize: "20px",
          padding: "20px",
        },
        duration: 1500,
        error: {
          duration: 2000,
        },
      }}
    />
  );
}
