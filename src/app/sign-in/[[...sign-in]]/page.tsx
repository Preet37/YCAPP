import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex-1 flex items-center justify-center py-16 px-6">
      <SignIn
        appearance={{
          variables: { colorPrimary: "#ff6600" },
        }}
      />
    </main>
  );
}
