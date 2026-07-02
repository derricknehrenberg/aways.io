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
            <a href="#call" className="mr-6 hover:text-ink transition-colors">
              The first call
            </a>
            <a href="#how" className="hover:text-ink transition-colors">
              Your region
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
          AWAYS makes public outdoor data accurate — every trail mapped, every
          connector included, every closure reflected, every name correct. The
          work lives in OpenStreetMap, where nearly every outdoor app already
          looks, and it stays open. What your organization pays for is
          accuracy, kept current.
        </p>
      </section>

      <section id="call" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          We won&apos;t assume we know your problem.
        </h2>
        <div className="mt-5 text-ink-muted max-w-2xl leading-relaxed space-y-4">
          <p>
            Every region is different. Maybe you have good trail data and no
            way to get it in front of the public. Maybe wayfinding on the
            ground doesn&apos;t match what visitors see in their apps. Maybe
            the problem is something else entirely — and whether mapping is
            even the fix isn&apos;t obvious yet.
          </p>
          <p>
            That&apos;s what the first call is for. Fifteen minutes: you
            describe your situation, we listen. If we can help, we&apos;ll
            tell you how. If we can&apos;t, we&apos;ll say so plainly — and
            either way you&apos;ll leave with an honest read on where your
            region stands.
          </p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Show us your region
        </h2>
        <p className="mt-3 text-ink-muted max-w-2xl">
          Draw a rough box around the area on your mind. Tell us about your
          organization and the situation in your own words — however it looks
          from where you sit. We&apos;ll get back to you to schedule the call.
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
