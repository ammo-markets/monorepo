import { CALIBER_SPECS } from "@ammo-exchange/shared";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Ammo Exchange</h1>
      <p className="text-lg text-gray-600 mb-8">
        Tokenized ammunition trading protocol
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(CALIBER_SPECS).map((spec) => (
          <div
            key={spec.caliber}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{spec.name}</h2>
            <p className="text-sm text-gray-500">{spec.description}</p>
            <p className="text-xs mt-2">
              Min mint: {spec.minMintRounds} rounds
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
