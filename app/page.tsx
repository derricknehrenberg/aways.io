import AwaysLogo from "@/components/AwaysLogo";
import RegionRequest from "@/components/RegionRequest";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AwaysLogo size={26} />
            <span className="font-semibold tracking-tight text-[15px]">
              AWAYS
            </span>
          </div>
          <nav className="text-sm text-ink-subtle">
            <a href="#how" className="mr-6 hover:text-ink transition-colors">
              How it works
            </a>
            <a href="#schedule" className="hover:text-ink transition-colors">
              Schedule
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <AwaysLogo size={132} className="mb-12" />
        <p className="text-[13px] uppercase tracking-[0.04em] text-ink-subtle font-medium">
          Professional OpenStreetMap services
        </p>
        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.05]">
          Grade A mapping for the places that depend on it.
        </h1>
        <p className="mt-7 text-lg text-ink-muted max-w-2xl leading-relaxed">
          AWAYS makes outdoor data accurate — every trail mapped, every
          connector included, every closure reflected, every name correct.
          We&apos;re the OSM-native organization that figured out the economics
          for work the trail-mapping community has been trying to fund for
          years. The data we produce stays open. What your organization pays
          for is consistent accuracy, kept current.
        </p>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Tell us about your region
        </h2>
        <p className="mt-3 text-ink-muted max-w-2xl">
          Draw a bounding box around the area you&apos;d like mapped. Leave a
          note. We&apos;ll get back to you to schedule a 15-minute scoping
          call.
        </p>
        <div className="mt-10">
          <RegionRequest />
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-8 text-[13px] text-ink-subtle flex flex-col md:flex-row gap-2 md:justify-between">
          <span>© AWAYS</span>
          <span>
            Free trail map:{" "}
            <a
              href="https://juicytrails.com"
              className="hover:text-ink transition-colors"
            >
              juicytrails.com
            </a>{" "}
            · Map ©{" "}
            <a
              href="https://openfreemap.org"
              className="hover:text-ink transition-colors"
            >
              OpenFreeMap
            </a>
            ,{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="hover:text-ink transition-colors"
            >
              OpenStreetMap
            </a>{" "}
            contributors
          </span>
        </div>
      </footer>
    </main>
  );
}
