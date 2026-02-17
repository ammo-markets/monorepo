import { CALIBER_SPECS } from "@ammo-exchange/shared";

const caliberCount = Object.keys(CALIBER_SPECS).length;

export default function TestSlide() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="mb-4 text-5xl font-bold text-brass">Ammo Exchange</h1>
      <p className="mb-2 text-xl text-text-secondary">
        Pitch Deck - Test Slide
      </p>
      <p className="mb-8 text-sm text-text-muted">
        {caliberCount} calibers supported via @ammo-exchange/shared
      </p>

      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-lg bg-brass" title="Brass" />
        <div className="h-16 w-16 rounded-lg bg-green" title="Green" />
        <div className="h-16 w-16 rounded-lg bg-red" title="Red" />
        <div className="h-16 w-16 rounded-lg bg-blue" title="Blue" />
      </div>
    </main>
  );
}
