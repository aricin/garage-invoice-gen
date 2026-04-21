import { InvoiceGenerator } from "@/components/InvoiceGenerator";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10 sm:px-10 lg:px-12">
      <InvoiceGenerator />
    </main>
  );
}
