import RegionRequest from "@/components/RegionRequest";
import StationClock from "@/components/StationClock";

function Tri({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true">
      <use href="#awtri" />
    </svg>
  );
}

const LAST_UPDATED = "2026-07-02";

export default function Home() {
  return (
    <main>
      {/* AWAYS Mark 03 "The Field" — defined once, stamped everywhere */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="awtri" viewBox="0 0 60 60">
            <polygon fill="var(--gold, #b8921f)" points="30,3 58,58 2,58" />
            <polygon fill="currentColor" points="30,14.5 46.5,47 13.5,47" />
          </symbol>
        </defs>
      </svg>

      {/* ============ MASTHEAD ============ */}
      <header className="mast">
        <Tri className="tri" />
        <b>AWAYS</b>
        <span className="sta">FIELD STATION · GUNNISON VALLEY EXAMPLE FEED</span>
        <span className="right">
          <StationClock />
          <span className="live">
            LIVE <span className="cur" />
          </span>
        </span>
      </header>

      {/* ============ HERO ============ */}
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="eyebrow">Professional trail mapping · OpenStreetMap</span>
            <h1>Grade A mapping for the places that depend on it.</h1>
            <p className="herobody">
              AWAYS makes public outdoor data accurate — every trail mapped,
              every connector included, every closure reflected, every name
              correct. The work lives in OpenStreetMap, where nearly every
              outdoor app already looks, and it stays open. What your
              organization pays for is accuracy, kept current.
            </p>
          </div>
          <div className="trirow">
            <Tri className="bigtri" />
            <small>AWAYS · MARK 03</small>
          </div>
        </section>
      </div>

      {/* ============ THE INSTRUMENT ============ */}
      <RegionRequest />

      {/* ============ TRANSMISSION (centerpiece) ============ */}
      <div className="wrap">
        <section className="trans">
          <div className="label">
            <Tri className="tri" />
            Transmission 02
            <br />
            Operating posture
            <br />
            All stations
          </div>
          <div className="body">
            <h2>We won&apos;t assume we know your problem.</h2>
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
            <div className="end">
              // END TRANSMISSION <span className="cur" />
            </div>
          </div>
        </section>
      </div>

      {/* ============ FOOTER ============ */}
      <hr />
      <div className="wrap">
        <footer>
          <span>
            © AWAYS · Free trail map:{" "}
            <a href="https://juicytrails.com">juicytrails.com</a> · Map ©{" "}
            <a href="https://openfreemap.org">OpenFreeMap</a>,{" "}
            <a href="https://www.openstreetmap.org/copyright">
              OpenStreetMap contributors
            </a>
          </span>
          <span className="stamp">
            Last updated {LAST_UPDATED} · station time <StationClock timeOnly />
          </span>
        </footer>
      </div>
    </main>
  );
}
